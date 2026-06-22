import React, { useEffect, useMemo, useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { apiFetch } from '../services/apiService';
import { useAuth } from '../store/useAuth';
import { Navigate } from 'react-router-dom';
import { Car, Plus, ShieldCheck, Sparkles, Truck, Gauge } from 'lucide-react';

interface Vehicle {
    id: string;
    brand: string;
    model: string;
    license_plate: string;
    status: 'ACTIVE' | 'INACTIVE' | string;
}

export function Fleet() {
    const { user } = useAuth();
    if (user?.role === 'STUDENT') return <Navigate to="/dashboard" />;

    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ brand: '', model: '', license_plate: '' });

    const fetchVehicles = async () => {
        const response = await apiFetch('/vehicles');
        setVehicles(response.data ?? []);
    };

    useEffect(() => {
        fetchVehicles();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await apiFetch('/vehicles', { method: 'POST', body: JSON.stringify(formData) });
        setShowModal(false);
        fetchVehicles();
    };

    const stats = useMemo(
        () => ({
            total: vehicles.length,
            active: vehicles.filter((vehicle) => vehicle.status === 'ACTIVE').length,
            inactive: vehicles.filter((vehicle) => vehicle.status !== 'ACTIVE').length,
        }),
        [vehicles],
    );

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
                                        Parc automobile
                                    </div>
                                    <div>
                                        <h1 className="text-3xl font-black tracking-tight md:text-4xl">Parc Automobile</h1>
                                        <p className="mt-2 max-w-2xl text-sm text-slate-300 md:text-base">
                                            Consultez les véhicules de l'auto-école et leur état de service.
                                        </p>
                                    </div>
                                </div>

                                {user.role === 'ADMIN' && (
                                    <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 font-semibold text-white shadow-lg shadow-orange-950/30 transition hover:bg-orange-400">
                                        <Plus size={18} />
                                        Ajouter un véhicule
                                    </button>
                                )}
                            </div>
                        </div>
                    </section>

                    <section className="grid grid-cols-1 gap-5 md:grid-cols-3">
                        <StatCard icon={<Truck size={20} />} label="Véhicules" value={`${stats.total}`} />
                        <StatCard icon={<Gauge size={20} />} label="Actifs" value={`${stats.active}`} accent />
                        <StatCard icon={<ShieldCheck size={20} />} label="À surveiller" value={`${stats.inactive}`} />
                    </section>

                    {vehicles.length === 0 ? (
                        <section className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500 shadow-sm">
                            Aucun véhicule enregistré pour le moment.
                        </section>
                    ) : (
                        <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                            {vehicles.map((vehicle) => {
                                const active = vehicle.status === 'ACTIVE';
                                return (
                                    <article key={vehicle.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                                        <div className="mb-5 flex items-start justify-between gap-4">
                                            <div className="rounded-2xl bg-slate-50 p-3 text-slate-900">
                                                <Car size={24} />
                                            </div>
                                            <span className={`rounded-full px-3 py-1 text-xs font-bold ${active ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                                {vehicle.status}
                                            </span>
                                        </div>

                                        <h3 className="text-lg font-bold text-slate-900">{vehicle.brand} {vehicle.model}</h3>
                                        <p className="mt-2 text-sm text-slate-500">{vehicle.license_plate}</p>

                                        <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4 text-xs font-medium text-slate-400">
                                            <ShieldCheck size={14} />
                                            Entretien à jour
                                        </div>
                                    </article>
                                );
                            })}
                        </section>
                    )}

                    {showModal && user.role === 'ADMIN' && (
                        /* Modale d'ajout inchangée */
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
                            <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl md:p-8">
                                <div className="mb-6 flex items-start justify-between gap-4">
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-900">Nouveau véhicule</h2>
                                        <p className="mt-1 text-sm text-slate-500">Renseigner les informations du véhicule.</p>
                                    </div>
                                    <button onClick={() => setShowModal(false)} className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-500 transition hover:bg-slate-200">
                                        Fermer
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <input type="text" placeholder="Marque (ex: Peugeot)" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-[#FF7F50] focus:ring-4 focus:ring-orange-100" onChange={(e) => setFormData({ ...formData, brand: e.target.value })} required />
                                    <input type="text" placeholder="Modèle (ex: 208)" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-[#FF7F50] focus:ring-4 focus:ring-orange-100" onChange={(e) => setFormData({ ...formData, model: e.target.value })} required />
                                    <input type="text" placeholder="Plaque d'immatriculation" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-[#FF7F50] focus:ring-4 focus:ring-orange-100" onChange={(e) => setFormData({ ...formData, license_plate: e.target.value })} required />
                                    <div className="flex gap-3 pt-2">
                                        <button type="button" onClick={() => setShowModal(false)} className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 font-semibold text-slate-600 transition hover:bg-slate-50">
                                            Annuler
                                        </button>
                                        <button type="submit" className="flex-1 rounded-2xl bg-[#FF7F50] px-4 py-3 font-semibold text-white transition hover:bg-[#E66E45]">
                                            Enregistrer
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

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