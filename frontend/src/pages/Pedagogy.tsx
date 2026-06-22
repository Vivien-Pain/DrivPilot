import { useEffect, useMemo, useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { apiFetch } from '../services/apiService';
import { useAuth } from '../store/useAuth';
import { CheckCircle2, Circle, Trophy, Users, BookOpen, Sparkles, MessageSquare, Send, FileText } from 'lucide-react';

const REMC_SKILLS = [
    'Maîtriser le véhicule à allure lente ou modérée',
    'Appréhender la route et circuler dans des conditions normales',
    'Circuler dans des conditions difficiles et partager la route avec les autres usagers',
    'Pratiquer une conduite autonome, sûre et économique',
];

interface BookletEntry { skill_name: string; status: string; }
interface Student { id: string; first_name: string; last_name: string; }
interface Note { id: string; content: string; created_at: string; first_name: string; last_name: string; role: string; }
interface MockExam { id: string; score: number; remarks: string; created_at: string; instructor_first_name: string; }

export const Pedagogy = () => {
    const { user } = useAuth();
    const [booklet, setBooklet] = useState<BookletEntry[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [notes, setNotes] = useState<Note[]>([]);
    const [exams, setExams] = useState<MockExam[]>([]);
    const [newNote, setNewNote] = useState('');
    const [examData, setExamData] = useState({ score: 0, remarks: '' });
    const [showExamForm, setShowExamForm] = useState(false);

    const [selectedStudent, setSelectedStudent] = useState<string>(() => {
        return user?.role === 'STUDENT' ? (user?.userId || user?.id) : '';
    });

    const fetchAllData = async (studentId: string) => {
        if (!studentId) return;
        const [bookletRes, notesRes, examsRes] = await Promise.all([
            apiFetch(`/booklet/${studentId}`),
            user?.role !== 'STUDENT' ? apiFetch(`/notes/${studentId}`) : Promise.resolve({ data: [] }),
            apiFetch(`/exams/${studentId}`)
        ]);
        setBooklet(bookletRes.data ?? []);
        setNotes(notesRes.data ?? []);
        setExams(examsRes.data ?? []);
    };

    const fetchStudents = async () => {
        if (user?.role === 'STUDENT') return;
        const response = await apiFetch('/users?role=STUDENT');
        setStudents(response.data ?? []);
    };

    useEffect(() => {
        if (user?.role === 'STUDENT') {
            fetchAllData(user?.userId || user?.id);
        } else {
            fetchStudents();
        }
    }, [user]);

    const handleStudentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const studentId = e.target.value;
        setSelectedStudent(studentId);
        fetchAllData(studentId);
    };

    const handleUpdateSkill = async (skillName: string, status: string) => {
        if (!selectedStudent) return;
        await apiFetch('/booklet/update', { method: 'POST', body: JSON.stringify({ studentId: selectedStudent, skillName, status }) });
        fetchAllData(selectedStudent);
    };

    const handleAddNote = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newNote.trim() || !selectedStudent) return;
        await apiFetch('/notes', { method: 'POST', body: JSON.stringify({ studentId: selectedStudent, content: newNote }) });
        setNewNote('');
        fetchAllData(selectedStudent);
    };

    const handleAddExam = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStudent) return;
        await apiFetch('/exams', { method: 'POST', body: JSON.stringify({ studentId: selectedStudent, ...examData }) });
        setExamData({ score: 0, remarks: '' });
        setShowExamForm(false);
        fetchAllData(selectedStudent);
    };

    const getSkillStatus = (skillName: string) => booklet.find((b) => b.skill_name === skillName)?.status || 'NOT_STARTED';

    const progress = useMemo(() => {
        if (!REMC_SKILLS.length) return 0;
        const acquired = booklet.filter((b) => b.status === 'ACQUIRED').length;
        return Math.round((acquired / REMC_SKILLS.length) * 100);
    }, [booklet]);

    const statusConfig = {
        NOT_STARTED: { label: 'À faire', tone: 'bg-slate-100 text-slate-500 border-slate-200', dot: 'bg-slate-300' },
        IN_PROGRESS: { label: 'En cours', tone: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-400' },
        ACQUIRED: { label: 'Acquis', tone: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
    } as const;

    return (
        <div className="flex min-h-screen bg-slate-50">
            <Sidebar />
            <main className="flex-1 p-6 md:p-10">
                <div className="mx-auto max-w-6xl space-y-8">
                    <section className="overflow-hidden rounded-3xl border border-white/60 bg-white shadow-sm backdrop-blur">
                        <div className="bg-gradient-to-r from-[#0F172A] via-slate-900 to-[#1F2937] p-8 md:p-10 text-white">
                            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                                <div className="space-y-3">
                                    <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-orange-200">
                                        <Sparkles size={14} /> Suivi pédagogique
                                    </div>
                                    <div>
                                        <h1 className="text-3xl md:text-4xl font-black tracking-tight">Livret Numérique REMC</h1>
                                        <p className="mt-2 max-w-2xl text-sm md:text-base text-slate-300">
                                            Suivi clair, progression visible et validation des compétences en temps réel.
                                        </p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                    <StatCard icon={<BookOpen size={18} />} label="Compétences" value={`${REMC_SKILLS.length}`} />
                                    <StatCard icon={<Trophy size={18} />} label="Progression" value={`${progress}%`} accent />
                                    {user?.role !== 'STUDENT' && <StatCard icon={<Users size={18} />} label="Élèves" value={`${students.length}`} />}
                                </div>
                            </div>
                        </div>
                    </section>

                    {user?.role !== 'STUDENT' && (
                        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <label className="mb-3 block text-sm font-semibold text-slate-700">Sélectionner un élève</label>
                            <select className="w-full md:max-w-md rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-[#FF7F50] focus:ring-4 focus:ring-orange-100" value={selectedStudent} onChange={handleStudentChange}>
                                <option value="">Choisir un élève...</option>
                                {students.map((s) => <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>)}
                            </select>
                        </section>
                    )}

                    {selectedStudent ? (
                        <div className={`grid gap-8 ${user?.role !== 'STUDENT' ? 'xl:grid-cols-[1fr_400px]' : 'grid-cols-1'}`}>
                            <section className="space-y-6">
                                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                    <div className="mb-4 flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-xl bg-orange-100 p-2 text-[#FF7F50]"><Trophy size={22} /></div>
                                            <div>
                                                <h2 className="text-lg font-bold text-slate-900">Progression globale</h2>
                                                <p className="text-sm text-slate-500">Vue d'ensemble de la progression</p>
                                            </div>
                                        </div>
                                        <div className="text-3xl font-black text-[#FF7F50]">{progress}%</div>
                                    </div>
                                    <div className="h-4 w-full overflow-hidden rounded-full bg-slate-100">
                                        <div className="h-full rounded-full bg-gradient-to-r from-[#FF7F50] to-orange-500 transition-all duration-500" style={{ width: `${progress}%` }} />
                                    </div>
                                </div>

                                <div className="grid gap-4">
                                    {REMC_SKILLS.map((skill, index) => {
                                        const status = getSkillStatus(skill);
                                        const config = statusConfig[status as keyof typeof statusConfig] ?? statusConfig.NOT_STARTED;
                                        return (
                                            <article key={skill} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                                                    <div className="flex items-start gap-4">
                                                        <div className="mt-1">{status === 'ACQUIRED' ? <CheckCircle2 className="text-emerald-500" size={22} /> : <Circle className="text-slate-300" size={22} />}</div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <h3 className="font-bold text-slate-900">{skill}</h3>
                                                                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">{index + 1}</span>
                                                            </div>
                                                            <p className="mt-1 text-sm text-slate-500">Compétence du référentiel REMC</p>
                                                        </div>
                                                    </div>
                                                    {user?.role !== 'STUDENT' ? (
                                                        <div className="inline-flex rounded-2xl border border-slate-200 bg-slate-50 p-1">
                                                            {(['NOT_STARTED', 'IN_PROGRESS', 'ACQUIRED'] as const).map((s) => (
                                                                <button key={s} onClick={() => handleUpdateSkill(skill, s)} className={`rounded-xl px-4 py-2 text-xs font-bold transition ${status === s ? 'bg-white text-[#FF7F50] shadow-sm' : 'text-slate-400 hover:text-slate-700'}`}>
                                                                    {statusConfig[s].label}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold ${config.tone}`}>
                                                            <span className={`h-2 w-2 rounded-full ${config.dot}`} />{config.label}
                                                        </div>
                                                    )}
                                                </div>
                                            </article>
                                        );
                                    })}
                                </div>

                                <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                                    <div className="mb-6 flex justify-between items-center border-b border-slate-100 pb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-xl bg-blue-50 p-2 text-blue-600"><FileText size={20} /></div>
                                            <h2 className="font-bold text-slate-900">Examens Blancs (IPCSR)</h2>
                                        </div>
                                        {user?.role !== 'STUDENT' && (
                                            <button onClick={() => setShowExamForm(!showExamForm)} className="text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-xl">
                                                + Nouveau Bilan
                                            </button>
                                        )}
                                    </div>

                                    {showExamForm && (
                                        <form onSubmit={handleAddExam} className="mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                                            <div className="flex gap-4 mb-4">
                                                <input type="number" min="0" max="31" placeholder="Note /31" className="w-32 rounded-xl border border-slate-200 px-4 py-2 outline-none" value={examData.score} onChange={(e) => setExamData({...examData, score: Number(e.target.value)})} required />
                                                <input type="text" placeholder="Remarques (ex: Manque de contrôle angle mort)" className="flex-1 rounded-xl border border-slate-200 px-4 py-2 outline-none" value={examData.remarks} onChange={(e) => setExamData({...examData, remarks: e.target.value})} required />
                                            </div>
                                            <button type="submit" className="w-full bg-blue-600 text-white font-semibold py-2 rounded-xl">Enregistrer l'examen blanc</button>
                                        </form>
                                    )}

                                    <div className="space-y-3">
                                        {exams.length === 0 ? <p className="text-sm text-slate-500 text-center py-4">Aucun examen blanc enregistré.</p> : exams.map(exam => (
                                            <div key={exam.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                                                <div>
                                                    <span className={`font-black text-lg ${exam.score >= 20 ? 'text-emerald-600' : 'text-rose-600'}`}>{exam.score}/31</span>
                                                    <p className="text-sm text-slate-600">{exam.remarks}</p>
                                                    <p className="text-xs text-slate-400 mt-1">Par {exam.instructor_first_name} le {new Date(exam.created_at).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </section>

                            {user?.role !== 'STUDENT' && (
                                <aside className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                                    <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                                        <div className="rounded-xl bg-slate-50 p-2 text-slate-600"><MessageSquare size={20} /></div>
                                        <div>
                                            <h2 className="font-bold text-slate-900">Notes d'équipe</h2>
                                            <p className="text-xs text-slate-500">Invisibles pour l'élève</p>
                                        </div>
                                    </div>
                                    <div className="flex-1 space-y-4 overflow-y-auto pr-2">
                                        {notes.length === 0 ? <div className="py-8 text-center text-sm text-slate-400">Aucune observation.</div> : notes.map((note) => (
                                            <div key={note.id} className="rounded-2xl bg-slate-50 p-4">
                                                <div className="mb-2 flex items-center justify-between">
                                                    <span className="text-xs font-bold text-slate-700">{note.first_name} {note.last_name}</span>
                                                    <span className="text-[10px] font-medium text-slate-400">{new Date(note.created_at).toLocaleDateString()}</span>
                                                </div>
                                                <p className="text-sm leading-relaxed text-slate-600">{note.content}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <form onSubmit={handleAddNote} className="mt-auto border-t border-slate-100 pt-4">
                                        <div className="relative">
                                            <textarea className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-3 pr-12 text-sm text-slate-900 outline-none" rows={3} placeholder="Ajouter une observation..." value={newNote} onChange={(e) => setNewNote(e.target.value)} />
                                            <button type="submit" disabled={!newNote.trim()} className="absolute bottom-3 right-3 rounded-xl bg-slate-900 p-2 text-white disabled:opacity-50"><Send size={16} /></button>
                                        </div>
                                    </form>
                                </aside>
                            )}
                        </div>
                    ) : (
                        <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
                            <BookOpen size={24} className="mx-auto mb-4 text-[#FF7F50]" />
                            <h2 className="text-xl font-bold text-slate-900">Aucun livret affiché</h2>
                        </section>
                    )}
                </div>
            </main>
        </div>
    );
};

function StatCard({ icon, label, value, accent = false }: { icon: React.ReactNode; label: string; value: string; accent?: boolean }) {
    return (
        <div className={`rounded-2xl border border-white/10 p-4 backdrop-blur ${accent ? 'bg-white/15' : 'bg-white/10'}`}>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-300">{icon}{label}</div>
            <div className="mt-2 text-2xl font-black text-white">{value}</div>
        </div>
    );
}