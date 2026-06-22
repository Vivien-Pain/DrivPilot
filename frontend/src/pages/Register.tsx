import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../services/apiService';
import { Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';

export const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        schoolName: '',
        firstName: '',
        lastName: '',
        email: '',
        password: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await apiFetch('/auth/register', {
                method: 'POST',
                body: JSON.stringify(formData),
            });
            navigate('/login');
        } catch (error) {
            alert('Erreur lors de l’inscription');
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 p-4 text-white md:p-8">
            <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-6xl overflow-hidden rounded-[2rem] bg-white shadow-2xl lg:grid-cols-[0.95fr_1.05fr]">
                <section className="flex flex-col justify-between bg-gradient-to-br from-[#FF7F50] via-[#E66E45] to-slate-900 p-8 md:p-10">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white">
                            <Sparkles size={14} />
                            Création de compte
                        </div>
                        <h1 className="mt-6 text-4xl font-black tracking-tight md:text-5xl">DrivPilot</h1>
                        <p className="mt-4 max-w-lg text-sm leading-6 text-orange-50/90 md:text-base">
                            Donnez à votre auto-école un espace de gestion moderne, lisible et agréable à utiliser.
                        </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <InfoCard title="Lancement rapide" text="Créez votre espace et commencez à gérer l’activité immédiatement." />
                        <InfoCard title="Image pro" text="Une interface claire pour donner une impression premium à vos clients." />
                    </div>
                </section>

                <section className="flex items-center bg-slate-50 p-6 md:p-10">
                    <div className="w-full rounded-3xl bg-white p-6 shadow-sm md:p-8">
                        <div className="mb-8 text-center">
                            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-[#FF7F50]">
                                <ShieldCheck size={26} />
                            </div>
                            <h2 className="text-2xl font-black text-slate-900">Créer mon compte</h2>
                            <p className="mt-2 text-sm text-slate-500">Renseignez les informations de votre auto-école.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input
                                type="text"
                                placeholder="Nom de l'auto-école"
                                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-[#FF7F50] focus:ring-4 focus:ring-orange-100"
                                onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                                required
                            />
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <input
                                    type="text"
                                    placeholder="Prénom"
                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-[#FF7F50] focus:ring-4 focus:ring-orange-100"
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="Nom"
                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-[#FF7F50] focus:ring-4 focus:ring-orange-100"
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                    required
                                />
                            </div>
                            <input
                                type="email"
                                placeholder="Email professionnel"
                                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-[#FF7F50] focus:ring-4 focus:ring-orange-100"
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                            <input
                                type="password"
                                placeholder="Mot de passe"
                                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-[#FF7F50] focus:ring-4 focus:ring-orange-100"
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                            />
                            <button
                                type="submit"
                                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#FF7F50] px-4 py-3 font-semibold text-white transition hover:bg-[#E66E45]"
                            >
                                Créer mon compte gérant
                                <ArrowRight size={18} />
                            </button>
                        </form>

                        <p className="mt-6 text-center text-sm text-slate-600">
                            Déjà client ?{' '}
                            <span onClick={() => navigate('/login')} className="cursor-pointer font-semibold text-[#FF7F50]">
                                Se connecter
                            </span>
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
};

function InfoCard({ title, text }: { title: string; text: string }) {
    return (
        <div className="rounded-3xl border border-white/15 bg-white/10 p-4 backdrop-blur">
            <div className="text-sm font-semibold text-white">{title}</div>
            <p className="mt-2 text-sm leading-6 text-orange-50/90">{text}</p>
        </div>
    );
}