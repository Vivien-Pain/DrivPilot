import { useEffect, useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { apiFetch } from '../services/apiService';
import { Users, AlertTriangle, CalendarCheck, Sparkles, Activity, BellRing, MapPin, ArrowRight } from 'lucide-react';
import { useAuth } from '../store/useAuth';
import { useNavigate } from 'react-router-dom';

interface DashboardStats {
    studentCount?: number;
    noShowRate?: string | number;
    totalLessons?: number;
}

export const Dashboard = () => {
    const { user } = useAuth();

    if (user?.role === 'STUDENT') {
        return <StudentDashboard user={user} />;
    }

    return <StaffDashboard user={user} />;
};

const StudentDashboard = ({ user }: { user: any }) => {
    const navigate = useNavigate();

    return (
        <div className="flex min-h-screen bg-slate-50">
            <Sidebar />
            <main className="flex-1 p-6 md:p-10">
                <div className="mx-auto max-w-4xl space-y-8">
                    <section className="overflow-hidden rounded-3xl border border-white bg-white shadow-sm">
                        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 p-8 text-white md:p-10">
                            <div className="space-y-3">
                                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-orange-200">
                                    <Sparkles size={14} />
                                    {user.schoolName}
                                </div>
                                <div>
                                    <h1 className="text-3xl font-black tracking-tight md:text-4xl">Bonjour {user.firstName} !</h1>
                                    <p className="mt-2 max-w-2xl text-sm text-slate-300 md:text-base">
                                        Prêt pour ta prochaine leçon ? Gère tes réservations et suis ta progression en un clin d'œil.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <div className="grid gap-6 md:grid-cols-2">
                        <article className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                            <div className="mb-4 flex items-center gap-4">
                                <div className="rounded-2xl bg-orange-50 p-3 text-[#FF7F50]"><CalendarCheck size={24} /></div>
                                <h2 className="text-xl font-bold text-slate-900">Planning</h2>
                            </div>
                            <p className="mb-6 text-sm text-slate-500">Réserve tes prochaines leçons de conduite selon tes disponibilités.</p>
                            <button onClick={() => navigate('/planning')} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#FF7F50] px-4 py-3 font-bold text-white transition hover:bg-[#E66E45]">
                                Voir les créneaux <ArrowRight size={18} />
                            </button>
                        </article>

                        <article className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                            <div className="mb-4 flex items-center gap-4">
                                <div className="rounded-2xl bg-blue-50 p-3 text-blue-600"><Activity size={24} /></div>
                                <h2 className="text-xl font-bold text-slate-900">Pédagogie</h2>
                            </div>
                            <p className="mb-6 text-sm text-slate-500">Consulte ton livret numérique REMC et les retours de tes moniteurs.</p>
                            <button onClick={() => navigate('/pedagogy')} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 font-bold text-white transition hover:bg-slate-800">
                                Suivre ma progression <ArrowRight size={18} />
                            </button>
                        </article>
                    </div>
                </div>
            </main>
        </div>
    );
};

const StaffDashboard = ({ user }: { user: any }) => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [isTriggering, setIsTriggering] = useState(false);

    useEffect(() => {
        if (user.role === 'ADMIN') {
            const fetchStats = async () => {
                try {
                    const response = await apiFetch('/school/stats');
                    setStats(response.data);
                } catch (error) {
                    console.error('Non autorisé ou erreur');
                }
            };
            fetchStats();
        }
    }, [user.role]);

    const handleTriggerNotifications = async () => {
        setIsTriggering(true);
        try {
            const response = await apiFetch('/notifications/trigger', { method: 'POST' });
            alert(`Rappels envoyés : ${response.data.processed24h} (24h), ${response.data.processed2h} (2h)`);
        } catch (error: any) {
            alert(error.message);
        } finally {
            setIsTriggering(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-slate-50">
            <Sidebar />
            <main className="flex-1 p-6 md:p-10">
                <div className="mx-auto max-w-6xl space-y-8">
                    <section className="overflow-hidden rounded-3xl border border-white bg-white shadow-sm">
                        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 p-8 text-white md:p-10">
                            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                                <div className="space-y-3">
                                    <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-orange-200">
                                        <Sparkles size={14} />
                                        Vue d’ensemble {user.role === 'ADMIN' ? 'Gérant' : 'Moniteur'}
                                    </div>
                                    <div>
                                        <h1 className="text-3xl font-black tracking-tight md:text-4xl">Tableau de bord</h1>
                                        <p className="mt-2 max-w-2xl text-sm text-slate-300 md:text-base">
                                            Suivi de l’activité de {user.schoolName}.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3 sm:flex-row">
                                    {user?.role === 'ADMIN' && (
                                        <button
                                            onClick={handleTriggerNotifications}
                                            disabled={isTriggering}
                                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#FF7F50] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#E66E45] disabled:opacity-50"
                                        >
                                            <BellRing size={18} />
                                            {isTriggering ? 'Envoi...' : 'Déclencher Rappels'}
                                        </button>
                                    )}
                                    <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-row">
                                        <MiniCard icon={<MapPin size={18} />} label="Auto-école" value={user.schoolName} accent />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {user.role === 'ADMIN' && stats && (
                        <section className="grid grid-cols-1 gap-5 md:grid-cols-3">
                            <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                                <div className="mb-5 flex items-start justify-between">
                                    <div className="rounded-2xl p-3 bg-blue-50 text-blue-600"><Users size={24} /></div>
                                    <div className="h-2 w-20 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 opacity-80" />
                                </div>
                                <p className="text-sm font-medium text-slate-500">Élèves inscrits</p>
                                <div className="mt-2 text-3xl font-black tracking-tight text-slate-900">{stats.studentCount}</div>
                            </article>
                            <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                                <div className="mb-5 flex items-start justify-between">
                                    <div className="rounded-2xl p-3 bg-orange-50 text-[#FF7F50]"><AlertTriangle size={24} /></div>
                                    <div className="h-2 w-20 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 opacity-80" />
                                </div>
                                <p className="text-sm font-medium text-slate-500">Taux de no-show</p>
                                <div className="mt-2 text-3xl font-black tracking-tight text-slate-900">{stats.noShowRate}%</div>
                            </article>
                            <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                                <div className="mb-5 flex items-start justify-between">
                                    <div className="rounded-2xl p-3 bg-emerald-50 text-emerald-600"><CalendarCheck size={24} /></div>
                                    <div className="h-2 w-20 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 opacity-80" />
                                </div>
                                <p className="text-sm font-medium text-slate-500">Leçons planifiées</p>
                                <div className="mt-2 text-3xl font-black tracking-tight text-slate-900">{stats.totalLessons}</div>
                            </article>
                        </section>
                    )}
                </div>
            </main>
        </div>
    );
};

function MiniCard({ icon, label, value, accent = false }: { icon: React.ReactNode; label: string; value: string; accent?: boolean }) {
    return (
        <div className={`rounded-2xl border border-white/10 px-4 py-3 backdrop-blur ${accent ? 'bg-white/15' : 'bg-white/10'}`}>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
                {icon}
                {label}
            </div>
            <div className="mt-1 text-base font-black truncate text-white">{value}</div>
        </div>
    );
}