import React, { useEffect, useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { apiFetch } from '../services/apiService';
import { UserPlus, Trash2, Mail, Phone, FileUp, Sparkles } from 'lucide-react';

interface Member {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
    phone?: string;
}

export const Team = () => {
    const [members, setMembers] = useState<Member[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [csvData, setCsvData] = useState('');

    const [formData, setFormData] = useState({
        email: '',
        role: 'STUDENT',
        firstName: '',
        lastName: '',
        phone: '',
        hoursPurchased: 0
    });

    const fetchMembers = async () => {
        const response = await apiFetch('/users');
        setMembers(response.data ?? []);
    };

    useEffect(() => {
        fetchMembers();
    }, []);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await apiFetch('/users', { method: 'POST', body: JSON.stringify(formData) });
            setShowModal(false);
            fetchMembers();
        } catch (error: any) {
            alert(error.message);
        }
    };

    const handleImport = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const lines = csvData.split('\n').filter(l => l.trim() !== '');
            const students = lines.map(line => {
                const parts = line.split(/[,;]/).map(s => s.trim());
                return {
                    firstName: parts[0] || '',
                    lastName: parts[1] || '',
                    email: parts[2] || '',
                    phone: parts[3] || ''
                };
            }).filter(s => s.firstName && s.email);

            if (students.length === 0) {
                alert('Aucune donnée valide trouvée.');
                return;
            }

            const response = await apiFetch('/users/import', {
                method: 'POST',
                body: JSON.stringify({ students })
            });

            alert(`${response.data.added} élèves importés avec succès ! (Ignorés: ${response.data.total - response.data.added})`);
            setShowImportModal(false);
            setCsvData('');
            fetchMembers();
        } catch (error: any) {
            alert(`Erreur d'importation : ${error.message}`);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Supprimer ce membre définitivement ?')) {
            await apiFetch(`/users/${id}`, { method: 'DELETE' });
            fetchMembers();
        }
    };

    const instructors = members.filter((member) => member.role === 'INSTRUCTOR');
    const students = members.filter((member) => member.role === 'STUDENT');

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
                                        Gestion du personnel & Élèves
                                    </div>
                                    <div>
                                        <h1 className="text-3xl font-black tracking-tight md:text-4xl">L'Équipe</h1>
                                        <p className="mt-2 max-w-2xl text-sm text-slate-300 md:text-base">
                                            Gérez les accès de vos moniteurs et l'inscription de vos élèves.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3 sm:flex-row">
                                    <button
                                        onClick={() => setShowImportModal(true)}
                                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/10 px-5 py-3 font-semibold text-white transition hover:bg-white/20"
                                    >
                                        <FileUp size={18} />
                                        Importer CSV
                                    </button>
                                    <button
                                        onClick={() => setShowModal(true)}
                                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#FF7F50] px-5 py-3 font-semibold text-white shadow-lg shadow-orange-950/30 transition hover:bg-[#E66E45]"
                                    >
                                        <UserPlus size={18} />
                                        Ajouter un membre
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>

                    <div className="space-y-8">
                        <section className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-black text-slate-900">Moniteurs</h2>
                                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                                    {instructors.length}
                                </span>
                            </div>

                            {instructors.length === 0 ? (
                                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
                                    Aucun moniteur trouvé.
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                                    {instructors.map((member) => (
                                        <article key={member.id} className="flex items-center justify-between rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
                                            <div className="flex items-center gap-4">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl font-bold bg-blue-50 text-blue-600">
                                                    {member.first_name.charAt(0)}{member.last_name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-bold text-slate-900">{member.first_name} {member.last_name}</h3>
                                                        <span className="rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-700">
                                                            Moniteur
                                                        </span>
                                                    </div>
                                                    <div className="mt-1 flex items-center gap-4 text-xs font-medium text-slate-500">
                                                        <span className="flex items-center gap-1"><Mail size={14} /> {member.email}</span>
                                                        {member.phone && <span className="flex items-center gap-1"><Phone size={14} /> {member.phone}</span>}
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDelete(member.id)}
                                                className="rounded-xl p-3 text-slate-300 transition hover:bg-rose-50 hover:text-rose-600"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </article>
                                    ))}
                                </div>
                            )}
                        </section>

                        <section className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-black text-slate-900">Élèves</h2>
                                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                                    {students.length}
                                </span>
                            </div>

                            {students.length === 0 ? (
                                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
                                    Aucun élève trouvé.
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                                    {students.map((member) => (
                                        <article key={member.id} className="flex items-center justify-between rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
                                            <div className="flex items-center gap-4">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl font-bold bg-emerald-50 text-emerald-600">
                                                    {member.first_name.charAt(0)}{member.last_name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-bold text-slate-900">{member.first_name} {member.last_name}</h3>
                                                        <span className="rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-700">
                                                            Élève
                                                        </span>
                                                    </div>
                                                    <div className="mt-1 flex items-center gap-4 text-xs font-medium text-slate-500">
                                                        <span className="flex items-center gap-1"><Mail size={14} /> {member.email}</span>
                                                        {member.phone && <span className="flex items-center gap-1"><Phone size={14} /> {member.phone}</span>}
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDelete(member.id)}
                                                className="rounded-xl p-3 text-slate-300 transition hover:bg-rose-50 hover:text-rose-600"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </article>
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>

                    {showModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
                            <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl md:p-8">
                                <h2 className="mb-6 text-2xl font-black text-slate-900">Nouveau membre</h2>
                                <form onSubmit={handleAdd} className="space-y-4">
                                    <select
                                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-[#FF7F50] focus:ring-4 focus:ring-orange-100"
                                        onChange={(e) => setFormData({...formData, role: e.target.value})}
                                    >
                                        <option value="STUDENT">Élève</option>
                                        <option value="INSTRUCTOR">Moniteur</option>
                                    </select>
                                    <div className="grid grid-cols-2 gap-4">
                                        <input type="text" placeholder="Prénom" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-[#FF7F50] focus:ring-4 focus:ring-orange-100" onChange={(e) => setFormData({...formData, firstName: e.target.value})} required />
                                        <input type="text" placeholder="Nom" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-[#FF7F50] focus:ring-4 focus:ring-orange-100" onChange={(e) => setFormData({...formData, lastName: e.target.value})} required />
                                    </div>
                                    <input type="email" placeholder="Email" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-[#FF7F50] focus:ring-4 focus:ring-orange-100" onChange={(e) => setFormData({...formData, email: e.target.value})} required />
                                    <input type="text" placeholder="Téléphone (Optionnel)" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-[#FF7F50] focus:ring-4 focus:ring-orange-100" onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                                    {formData.role === 'STUDENT' && (
                                        <input type="number" placeholder="Solde d'heures initial" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-[#FF7F50] focus:ring-4 focus:ring-orange-100" onChange={(e) => setFormData({...formData, hoursPurchased: Number(e.target.value)})} />
                                    )}
                                    <div className="flex gap-3 pt-4">
                                        <button type="button" onClick={() => setShowModal(false)} className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 font-semibold text-slate-600 transition hover:bg-slate-50">Annuler</button>
                                        <button type="submit" className="flex-1 rounded-2xl bg-[#FF7F50] px-4 py-3 font-semibold text-white transition hover:bg-[#E66E45]">Enregistrer</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {showImportModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
                            <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl md:p-8">
                                <h2 className="mb-2 text-2xl font-black text-slate-900">Importation massive</h2>
                                <p className="mb-6 text-sm text-slate-500">Collez les données de votre fichier Excel/CSV (Format: Prénom, Nom, Email, Téléphone).</p>

                                <form onSubmit={handleImport} className="space-y-4">
                                    <textarea
                                        rows={8}
                                        className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm outline-none focus:border-[#FF7F50] focus:ring-4 focus:ring-orange-100"
                                        placeholder={`Jean, Dupont, jean.dupont@email.com, 0612345678\nMarie, Curie, marie@email.com, 0698765432`}
                                        value={csvData}
                                        onChange={(e) => setCsvData(e.target.value)}
                                        required
                                    />

                                    <div className="rounded-2xl bg-blue-50 p-4 text-sm text-blue-800">
                                        <strong>Note :</strong> Les doublons d'adresses email seront ignorés automatiquement. Un mot de passe par défaut (DrivPilot2026!) sera attribué.
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <button type="button" onClick={() => setShowImportModal(false)} className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 font-semibold text-slate-600 transition hover:bg-slate-50">Annuler</button>
                                        <button type="submit" className="flex-1 rounded-2xl bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-800">Lancer l'importation</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};