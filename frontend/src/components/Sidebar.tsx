import { LayoutDashboard, Users, Calendar, GraduationCap, LogOut, Car, Wallet, MessageSquare } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/useAuth';

export const Sidebar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const roleLabel = user?.role === 'ADMIN' ? 'Gérant' : user?.role === 'INSTRUCTOR' ? 'Moniteur' : 'Élève';

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', roles: ['ADMIN', 'INSTRUCTOR', 'STUDENT'] },
        { icon: Calendar, label: 'Planning', path: '/planning', roles: ['ADMIN', 'INSTRUCTOR', 'STUDENT'] },
        { icon: GraduationCap, label: 'Pédagogie', path: '/pedagogy', roles: ['ADMIN', 'INSTRUCTOR', 'STUDENT'] },
        { icon: Wallet, label: user?.role === 'ADMIN' ? 'Facturation' : 'Wallet', path: '/wallet', roles: ['ADMIN', 'STUDENT'] },
        { icon: MessageSquare, label: 'Messagerie', path: '/chat', roles: ['ADMIN', 'INSTRUCTOR', 'STUDENT'] },
        { icon: Users, label: 'Équipe', path: '/team', roles: ['ADMIN', 'INSTRUCTOR'] },
        { icon: Car, label: 'Parc auto', path: '/fleet', roles: ['ADMIN', 'INSTRUCTOR'] },
    ].filter(item => item.roles.includes(user?.role));

    return (
        <aside className="w-72 min-h-screen bg-slate-950 text-white border-r border-white/10 flex flex-col p-5">
            <div className="mb-8 rounded-3xl bg-white/5 p-5 ring-1 ring-white/10">
                <div className="text-[10px] uppercase tracking-[0.2em] text-orange-300 font-bold mb-1 truncate">
                    {user?.schoolName || 'DrivPilot'}
                </div>
                <div className="text-xl font-black truncate">{user?.firstName} {user?.lastName}</div>
                <div className="mt-2 inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-slate-300">
                    Espace {roleLabel}
                </div>
            </div>

            <nav className="flex-1 space-y-2">
                {menuItems.map((item) => {
                    const active = location.pathname === item.path;
                    return (
                        <button
                            key={item.label}
                            onClick={() => navigate(item.path)}
                            className={`w-full flex items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all ${
                                active
                                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-950/30'
                                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                            }`}
                        >
                            <item.icon size={20} />
                            <span className="font-medium">{item.label}</span>
                        </button>
                    );
                })}
            </nav>

            <button
                onClick={logout}
                className="mt-6 flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-red-300 transition-colors hover:bg-red-500/10 hover:text-red-200"
            >
                <LogOut size={20} />
                <span className="font-medium">Déconnexion</span>
            </button>
        </aside>
    );
};