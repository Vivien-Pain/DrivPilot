import React, { useEffect, useMemo, useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { apiFetch } from '../services/apiService';
import { useAuth } from '../store/useAuth';
import { Calendar as CalendarIcon, Clock, Plus, Sparkles, CalendarDays, CheckCircle2, X, MapPin, Map } from 'lucide-react';

interface Lesson {
    id: string;
    status: 'AVAILABLE' | 'BOOKED';
    start_time: string;
    end_time: string;
    first_name?: string;
    last_name?: string;
    student_id?: string;
    meeting_point?: string;
}

interface MeetingPoint {
    id: string;
    name: string;
    address: string;
}

export const Planning = () => {
    const { user } = useAuth();
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [meetingPoints, setMeetingPoints] = useState<MeetingPoint[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [isManagingPoints, setIsManagingPoints] = useState(false);
    const [bookingLessonId, setBookingLessonId] = useState<string | null>(null);
    const [selectedPoint, setSelectedPoint] = useState<string>('');
    const [newSlot, setNewSlot] = useState({ date: '', start: '', end: '' });
    const [newPoint, setNewPoint] = useState({ name: '', address: '' });

    const fetchLessons = async () => {
        const response = await apiFetch('/lessons/calendar');
        setLessons(response.data ?? []);
    };

    const fetchMeetingPoints = async () => {
        const response = await apiFetch('/meeting-points');
        setMeetingPoints(response.data ?? []);
        if (response.data?.length > 0) setSelectedPoint(response.data[0].name);
    };

    useEffect(() => {
        fetchLessons();
        fetchMeetingPoints();
    }, []);

    const handleAddSlot = async (e: React.FormEvent) => {
        e.preventDefault();
        const start = `${newSlot.date}T${newSlot.start}:00`;
        const end = `${newSlot.date}T${newSlot.end}:00`;
        await apiFetch('/lessons/availability', { method: 'POST', body: JSON.stringify({ slots: [{ start, end }] }) });
        setIsAdding(false);
        fetchLessons();
    };

    const handleBooking = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!bookingLessonId || !selectedPoint) return;
        try {
            await apiFetch('/lessons/book', { method: 'POST', body: JSON.stringify({ lessonId: bookingLessonId, meetingPoint: selectedPoint }) });
            setBookingLessonId(null);
            fetchLessons();
        } catch (error: any) {
            alert(error.message);
        }
    };

    const handleAddMeetingPoint = async (e: React.FormEvent) => {
        e.preventDefault();
        await apiFetch('/meeting-points', { method: 'POST', body: JSON.stringify(newPoint) });
        setNewPoint({ name: '', address: '' });
        fetchMeetingPoints();
    };

    const handleDeletePoint = async (id: string) => {
        await apiFetch(`/meeting-points/${id}`, { method: 'DELETE' });
        fetchMeetingPoints();
    };

    const handleCancellation = async (lessonId: string) => {
        try {
            await apiFetch('/lessons/cancel', { method: 'POST', body: JSON.stringify({ lessonId }) });
            fetchLessons();
        } catch (error: any) {
            alert(error.message === 'CANCELLATION_TOO_LATE_48H' ? 'Annulation impossible à moins de 48h de la leçon.' : error.message);
        }
    };

    const stats = useMemo(() => ({
        total: lessons.length,
        available: lessons.filter((lesson) => lesson.status === 'AVAILABLE').length,
        booked: lessons.filter((lesson) => lesson.status === 'BOOKED').length,
    }), [lessons]);

    return (
        <div className="flex min-h-screen bg-slate-50">
            <Sidebar />
            <main className="flex-1 p-6 md:p-10">
                <div className="mx-auto max-w-6xl space-y-8">
                    <section className="overflow-hidden rounded-3xl border border-white bg-white shadow-sm">
                        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 p-8 text-white md:p-10">
                            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                                <div className="space-y-3">
                                    <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-orange-200">
                                        <Sparkles size={14} />
                                        Planning de conduite
                                    </div>
                                    <div>
                                        <h1 className="text-3xl font-black tracking-tight md:text-4xl">Planning de conduite</h1>
                                        <p className="mt-2 max-w-2xl text-sm text-slate-300 md:text-base">
                                            Gérez les disponibilités, réservez des créneaux et fixez les lieux de prise en charge.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    {user.role === 'ADMIN' && (
                                        <button onClick={() => setIsManagingPoints(true)} className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-5 py-3 font-semibold text-white transition hover:bg-white/20">
                                            <Map size={18} /> Points RDV
                                        </button>
                                    )}
                                    {(user.role === 'ADMIN' || user.role === 'INSTRUCTOR') && (
                                        <button onClick={() => setIsAdding(true)} className="inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 font-semibold text-white shadow-lg shadow-orange-950/30 transition hover:bg-orange-400">
                                            <Plus size={18} /> Ouvrir un créneau
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="grid grid-cols-1 gap-5 md:grid-cols-3">
                        <StatCard icon={<CalendarDays size={20} />} label="Créneaux totaux" value={`${stats.total}`} />
                        <StatCard icon={<CheckCircle2 size={20} />} label="Disponibles" value={`${stats.available}`} accent />
                        <StatCard icon={<Clock size={20} />} label="Réservés" value={`${stats.booked}`} />
                    </section>

                    {lessons.length === 0 ? (
                        <section className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500 shadow-sm">
                            Aucun créneau pour le moment.
                        </section>
                    ) : (
                        <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                            {lessons.map((lesson) => {
                                const available = lesson.status === 'AVAILABLE';
                                const isMyBooking = user.role === 'STUDENT' && lesson.student_id === (user.userId || user.id);
                                const canCancel = lesson.status === 'BOOKED' && (user.role === 'ADMIN' || user.role === 'INSTRUCTOR' || isMyBooking);

                                return (
                                    <article key={lesson.id} className={`rounded-3xl border bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${available ? 'border-emerald-200' : 'border-blue-200'}`}>
                                        <div className="mb-5 flex items-start justify-between gap-4">
                                            <div className={`rounded-2xl p-3 ${available ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                                                <CalendarIcon size={24} />
                                            </div>
                                            <span className={`rounded-full px-3 py-1 text-xs font-bold ${available ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                                                {available ? 'DISPONIBLE' : 'RÉSERVÉ'}
                                            </span>
                                        </div>

                                        <h3 className="text-lg font-bold text-slate-900">
                                            {new Date(lesson.start_time).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                                        </h3>
                                        <p className="mt-2 inline-flex items-center gap-2 text-sm text-slate-500">
                                            <Clock size={16} />
                                            {new Date(lesson.start_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                            {' - '}
                                            {new Date(lesson.end_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                        </p>

                                        {lesson.meeting_point && (
                                            <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-[#FF7F50]">
                                                <MapPin size={16} /> {lesson.meeting_point}
                                            </p>
                                        )}

                                        {lesson.status === 'BOOKED' && (
                                            <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                                                Élève : <span className="font-semibold text-slate-900">{lesson.first_name} {lesson.last_name}</span>
                                            </div>
                                        )}

                                        {user.role === 'STUDENT' && available && (
                                            <button onClick={() => setBookingLessonId(lesson.id)} className="mt-5 w-full rounded-2xl bg-slate-950 py-3 font-semibold text-white transition hover:bg-slate-800">
                                                Réserver ce créneau
                                            </button>
                                        )}

                                        {canCancel && (
                                            <button onClick={() => handleCancellation(lesson.id)} className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-rose-50 py-3 font-semibold text-rose-600 transition hover:bg-rose-100">
                                                <X size={18} /> Annuler la réservation
                                            </button>
                                        )}
                                    </article>
                                );
                            })}
                        </section>
                    )}

                    {bookingLessonId && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
                            <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
                                <h2 className="mb-2 text-xl font-black text-slate-900">Confirmer la réservation</h2>
                                <p className="mb-6 text-sm text-slate-500">Choisissez votre point de prise en charge.</p>
                                <form onSubmit={handleBooking} className="space-y-4">
                                    <select className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-[#FF7F50] focus:ring-4 focus:ring-orange-100" value={selectedPoint} onChange={(e) => setSelectedPoint(e.target.value)} required>
                                        {meetingPoints.length === 0 ? (
                                            <option value="Auto-école">Auto-école (Défaut)</option>
                                        ) : (
                                            meetingPoints.map(mp => <option key={mp.id} value={mp.name}>{mp.name} - {mp.address}</option>)
                                        )}
                                    </select>
                                    <div className="flex gap-3 pt-4">
                                        <button type="button" onClick={() => setBookingLessonId(null)} className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 font-semibold text-slate-600 hover:bg-slate-50">Annuler</button>
                                        <button type="submit" className="flex-1 rounded-2xl bg-slate-950 px-4 py-3 font-semibold text-white hover:bg-slate-800">Valider</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {isAdding && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
                            <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl">
                                <h2 className="mb-6 text-2xl font-black text-slate-900">Nouvelle disponibilité</h2>
                                <form onSubmit={handleAddSlot} className="space-y-4">
                                    <input type="date" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-[#FF7F50] focus:ring-4 focus:ring-orange-100" onChange={(e) => setNewSlot({ ...newSlot, date: e.target.value })} required />
                                    <div className="grid grid-cols-2 gap-4">
                                        <input type="time" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-[#FF7F50] focus:ring-4 focus:ring-orange-100" onChange={(e) => setNewSlot({ ...newSlot, start: e.target.value })} required />
                                        <input type="time" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-[#FF7F50] focus:ring-4 focus:ring-orange-100" onChange={(e) => setNewSlot({ ...newSlot, end: e.target.value })} required />
                                    </div>
                                    <div className="flex gap-3 pt-2">
                                        <button type="button" onClick={() => setIsAdding(false)} className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 font-semibold text-slate-600 hover:bg-slate-50">Annuler</button>
                                        <button type="submit" className="flex-1 rounded-2xl bg-[#FF7F50] px-4 py-3 font-semibold text-white hover:bg-[#E66E45]">Publier</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {isManagingPoints && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
                            <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
                                <div className="mb-6 flex justify-between items-center">
                                    <h2 className="text-2xl font-black text-slate-900">Points de RDV</h2>
                                    <button onClick={() => setIsManagingPoints(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
                                </div>
                                <div className="space-y-4 mb-8">
                                    {meetingPoints.map(mp => (
                                        <div key={mp.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                            <div>
                                                <div className="font-bold text-slate-900">{mp.name}</div>
                                                <div className="text-sm text-slate-500">{mp.address}</div>
                                            </div>
                                            <button onClick={() => handleDeletePoint(mp.id)} className="text-rose-500 hover:text-rose-700"><X size={20} /></button>
                                        </div>
                                    ))}
                                    {meetingPoints.length === 0 && <div className="text-center text-sm text-slate-500 py-4">Aucun point de RDV enregistré.</div>}
                                </div>
                                <form onSubmit={handleAddMeetingPoint} className="flex gap-3 border-t border-slate-100 pt-6">
                                    <input type="text" placeholder="Nom (Ex: Lycée Jean Jaurès)" className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-[#FF7F50]" value={newPoint.name} onChange={(e) => setNewPoint({ ...newPoint, name: e.target.value })} required />
                                    <input type="text" placeholder="Adresse" className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-[#FF7F50]" value={newPoint.address} onChange={(e) => setNewPoint({ ...newPoint, address: e.target.value })} required />
                                    <button type="submit" className="rounded-2xl bg-slate-900 px-6 py-3 font-semibold text-white hover:bg-slate-800">Ajouter</button>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

function StatCard({ icon, label, value, accent = false }: { icon: React.ReactNode; label: string; value: string; accent?: boolean }) {
    return (
        <div className={`rounded-3xl border border-slate-200 bg-white p-6 shadow-sm ${accent ? 'ring-1 ring-orange-100' : ''}`}>
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                <span className="rounded-2xl bg-slate-50 p-2 text-[#FF7F50]">{icon}</span>
                {label}
            </div>
            <div className="mt-3 text-3xl font-black text-slate-900">{value}</div>
        </div>
    );
}