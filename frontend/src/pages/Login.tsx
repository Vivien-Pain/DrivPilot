import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../services/apiService';
import { useAuth } from '../store/useAuth';
import { ShieldCheck, Sparkles, ArrowRight, AlertCircle } from 'lucide-react';

export const Login = () => {
    const navigate = useNavigate();
    const setAuth = useAuth((state) => state.setAuth);
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg(null);
        setIsLoading(true);
        try {
            const response = await apiFetch('/auth/login', {
                method: 'POST',
                body: JSON.stringify({
                    email: credentials.email.trim(),
                    password: credentials.password
                }),
            });
            setAuth(response.data.token, response.data.user);
            navigate('/dashboard');
        } catch (error: unknown) {
            if (error instanceof Error) {
                setErrorMsg(error.message === 'INVALID_CREDENTIALS' ? 'Email ou mot de passe incorrect' : error.message);
            } else {
                setErrorMsg('Une erreur inattendue est survenue');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 p-4 text-white md:p-8">
            <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-6xl overflow-hidden rounded-[2rem] bg-white shadow-2xl lg:grid-cols-[1.1fr_0.9fr]">
                <section className="flex flex-col justify-between bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-8 md:p-10">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-orange-200">
                            <Sparkles size={14} />
                            Connexion sécurisée
                        </div>
                        <h1 className="mt-6 text-4xl font-black tracking-tight md:text-5xl">DrivPilot</h1>
                        <p className="mt-4 max-w-lg text-sm leading-6 text-slate-300 md:text-base">
                            Un cockpit clair pour piloter l'auto-école, suivre les élèves et garder le planning sous contrôle.
                        </p>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <InfoCard title="Visibilité" text="Accédez vite aux informations clés sans surcharge visuelle." />
                        <InfoCard title="Protection" text="Espace pensé pour des accès simples et sécurisés." />
                    </div>
                </section>

                <section className="flex items-center bg-slate-50 p-6 md:p-10">
                    <div className="w-full rounded-3xl bg-white p-6 shadow-sm md:p-8">
                        <div className="mb-8 text-center">
                            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-[#FF7F50]">
                                <ShieldCheck size={26} />
                            </div>
                            <h2 className="text-2xl font-black text-slate-900">Connexion</h2>
                            <p className="mt-2 text-sm text-slate-500">Accédez à votre espace de gestion.</p>
                        </div>

                        {errorMsg && (
                            <div className="mb-6 flex items-center gap-3 rounded-2xl bg-rose-50 p-4 text-sm font-semibold text-rose-600 border border-rose-100">
                                <AlertCircle size={18} />
                                {errorMsg}
                            </div>
                        )}

                        <form onSubmit={handleLogin} className="space-y-4">
                            <input
                                type="email"
                                placeholder="Email"
                                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-[#FF7F50] focus:ring-4 focus:ring-orange-100"
                                onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                                required
                            />
                            <input
                                type="password"
                                placeholder="Mot de passe"
                                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-[#FF7F50] focus:ring-4 focus:ring-orange-100"
                                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                                required
                            />
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
                            >
                                {isLoading ? 'Vérification...' : 'Se connecter'}
                                {!isLoading && <ArrowRight size={18} />}
                            </button>
                        </form>
                        <p className="mt-6 text-center text-sm text-slate-600">
                            Pas encore de compte ?{' '}
                            <span onClick={() => navigate('/register')} className="cursor-pointer font-semibold text-[#FF7F50]">
                                Inscrire mon auto-école
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
        <div className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur">
            <div className="text-sm font-semibold text-white">{title}</div>
            <p className="mt-2 text-sm leading-6 text-slate-300">{text}</p>
        </div>
    );
}