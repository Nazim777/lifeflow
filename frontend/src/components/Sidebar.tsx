
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../features/auth/hooks/useAuthStore';
import {
    LayoutDashboard,
    User,
    Heart,
    Activity,
    Building2,
    LogOut,
    Settings,
    Search
} from 'lucide-react';
import clsx from 'clsx';

const Sidebar = () => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const links = [
        { to: '/dashboard', label: 'Overview', icon: LayoutDashboard, roles: ['donor', 'hospital', 'admin', 'recipient'] },
        { to: '/profile', label: 'My Profile', icon: User, roles: ['donor', 'recipient'] },
        { to: '/donate', label: 'Donate Blood', icon: Heart, roles: ['donor'] },
        { to: '/requests', label: 'Blood Requests', icon: Activity, roles: ['donor', 'hospital', 'admin', 'recipient'] },
        { to: '/donors', label: 'Find Donors', icon: Search, roles: ['recipient', 'admin'] },
        { to: '/inventory', label: 'Inventory', icon: Building2, roles: ['hospital', 'admin'] },
        { to: '/admin', label: 'Admin Panel', icon: Settings, roles: ['admin'] },
    ];

    const filteredLinks = links.filter((link) => link.roles.includes(user?.role || ''));

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-white/80 backdrop-blur-xl border-r border-gray-100 flex flex-col z-50">
            <div className="p-6">
                <div className="flex items-center gap-3 text-primary font-bold text-2xl">
                    <Heart className="fill-current w-8 h-8" />
                    <span>LifeFlow</span>
                </div>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-2">
                {filteredLinks.map((link) => (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        className={({ isActive }) =>
                            clsx(
                                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium',
                                isActive
                                    ? 'bg-red-50 text-primary shadow-sm'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                            )
                        }
                    >
                        <link.icon className="w-5 h-5" />
                        {link.label}
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-gray-100">
                <div className="flex items-center gap-3 px-4 py-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-primary font-bold">
                        {user?.name?.[0] || user?.email?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{user?.name || 'User'}</p>
                        <p className="text-xs text-gray-500 truncate capitalize">{user?.role}</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all font-medium"
                >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
