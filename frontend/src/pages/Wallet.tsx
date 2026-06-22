import React, { useEffect, useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { apiFetch } from '../services/apiService';
import { useAuth } from '../store/useAuth';
import { Wallet as WalletIcon, CreditCard, Clock, Sparkles, Plus } from 'lucide-react';
import { Navigate } from 'react-router-dom';

interface Pack {
    id: string;
    name: string;
    hours: number;
    price: number;
}

export const Wallet = () => {
    const { user } = useAuth();
    if (user?.role === 'INSTRUCTOR') return <Navigate to="/dashboard" />;

    const [packs, setPacks] = useState<Pack[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [newPack, setNewPack] = useState({ name: '', hours: 0, price: 0 });

    const fetchPacks = async () => {
        const response = await apiFetch('/billing/packs');
        setPacks(response.data ?? []);
    };

    useEffect(() => {
        fetchPacks();
    }, []);

    const handlePurchase = async (packId: string) => {
        if (!confirm('Confirmer l\'achat de ce pack ?')) return;
        try {
            await apiFetch('/billing/purchase', { method: 'POST', body: JSON.stringify({ packId }) });
            alert('Achat validé avec succès ! Les heures ont été créditées.');
        } catch (error: any) {
            alert(error.message);
        }
    };

    const handleCreatePack = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await apiFetch('/billing/packs', { method: 'POST', body: JSON.stringify(newPack) });
            setIsAdding(false);
            setNewPack({ name: '', hours: 0, price: 0 });
            fetchPacks();
        } catch (error: any) {
            alert(error.message);
        }
    };

    return (
        <div className="flex min-h-screen bg-slate-50">
            <Sidebar />
            <main className="flex-1 p-6 md:p-10">
                <div className="mx-auto max-w-5xl space-y-8">
                    <section className="overflow-hidden rounded-3xl border border-white bg-white shadow-sm">
                        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 p-8 text-white md:p-10">
                            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                                <div className="space-y-3">
                                    <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-orange-200">
                                        <Sparkles size={14} />
                                        {user.role === 'ADMIN' ? 'Gestion des Packs' : 'Portefeuille Virtuel'}
                                    </div>
                                    <div>
                                        <h1 className="text-3xl font-black tracking-tight md:text-4xl">
                                            {user.role === 'ADMIN' ? 'Packs de facturation' : 'Recharger mon compte'}
                                        </h1>
                                        <p className="mt-2 max-w-2xl text-sm text-slate-300 md:text-base">
                                            {user.role === 'ADMIN'
                                                ? 'Configurez les forfaits d\'heures que vos élèves pourront acheter depuis l\'application.'
                                                : 'Achetez des packs d\'heures pour débloquer la réservation sur le planning.'}
                                        </p>
                                    </div>
                                </div>
                                {user.role === 'ADMIN' && (
                                    <button onClick={() => setIsAdding(true)} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#FF7F50] px-5 py-3 font-semibold text-white shadow-lg shadow-orange-950/30 transition hover:bg-[#E66E45]">
                                        <Plus size={18} /> Créer un pack
                                    </button>
                                )}
                            </div>
                        </div>
                    </section>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {packs.map((pack) => (
                            <article key={pack.id} className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                                <div className="absolute top-0 right-0 p-6 opacity-5">
                                    <WalletIcon size={120} />
                                </div>
                                <h2 className="text-2xl font-black text-slate-900">{pack.name}</h2>
                                <div className="mt-2 flex items-baseline gap-2">
                                    <span className="text-4xl font-black text-[#FF7F50]">{pack.price}€</span>
                                </div>
                                <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-slate-600 bg-slate-50 w-max px-4 py-2 rounded-xl border border-slate-100">
                                    <Clock size={16} className="text-slate-400" />
                                    Crédit de {pack.hours} heures
                                </div>
                                {user.role === 'STUDENT' && (
                                    <button onClick={() => handlePurchase(pack.id)} className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-4 font-bold text-white transition hover:bg-slate-800">
                                        <CreditCard size={18} /> Payer par carte
                                    </button>
                                )}
                            </article>
                        ))}
                        {packs.length === 0 && (
                            <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
                                Aucun pack n'a été configuré par l'auto-école.
                            </div>
                        )}
                    </div>

                    {isAdding && user.role === 'ADMIN' && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
                            <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl md:p-8">
                                <h2 className="mb-6 text-2xl font-black text-slate-900">Nouveau Pack</h2>
                                <form onSubmit={handleCreatePack} className="space-y-4">
                                    <div>
                                        <label className="text-sm font-semibold text-slate-700">Nom du pack</label>
                                        <input type="text" placeholder="Ex: Pack Permis 20h" className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-[#FF7F50] focus:ring-4 focus:ring-orange-100" value={newPack.name} onChange={(e) => setNewPack({ ...newPack, name: e.target.value })} required />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-semibold text-slate-700">Heures incluses</label>
                                            <input type="number" min="1" className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-[#FF7F50] focus:ring-4 focus:ring-orange-100" value={newPack.hours || ''} onChange={(e) => setNewPack({ ...newPack, hours: Number(e.target.value) })} required />
                                        </div>
                                        <div>
                                            <label className="text-sm font-semibold text-slate-700">Prix (€)</label>
                                            <input type="number" min="1" className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-[#FF7F50] focus:ring-4 focus:ring-orange-100" value={newPack.price || ''} onChange={(e) => setNewPack({ ...newPack, price: Number(e.target.value) })} required />
                                        </div>
                                    </div>
                                    <div className="flex gap-3 pt-4">
                                        <button type="button" onClick={() => setIsAdding(false)} className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 font-semibold text-slate-600 transition hover:bg-slate-50">Annuler</button>
                                        <button type="submit" className="flex-1 rounded-2xl bg-slate-950 px-4 py-3 font-semibold text-white transition hover:bg-slate-800">Enregistrer</button>
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