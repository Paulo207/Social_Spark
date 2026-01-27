import React from 'react';
import { LayoutDashboard, Calendar, FileText, Users, Settings, Sun, Moon } from 'lucide-react';
import './Sidebar.css';

interface SidebarProps {
    activeView: string;
    onViewChange: (view: string) => void;
    isDarkMode: boolean;
    onToggleTheme: () => void;
    user?: any; // Replace with proper type from useAuth if shared
    onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange, isDarkMode, onToggleTheme, user, onLogout }) => {
    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'calendar', label: 'Calendário', icon: Calendar },
        { id: 'posts', label: 'Postagens', icon: FileText },
        { id: 'accounts', label: 'Contas', icon: Users },
        { id: 'settings', label: 'Configurações', icon: Settings },
    ];

    return (
        <aside className="sidebar glass">
            <div className="sidebar-header">
                <h2 className="sidebar-logo gradient-text">Social Spark</h2>
                <p className="sidebar-tagline">Gerencie suas redes sociais</p>
            </div>

            <nav className="sidebar-nav">
                {menuItems.map(item => {
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.id}
                            className={`nav-item ${activeView === item.id ? 'active' : ''}`}
                            onClick={() => onViewChange(item.id)}
                        >
                            <Icon size={20} />
                            <span>{item.label}</span>
                        </button>
                    );
                })}
            </nav>

            <div className="sidebar-footer">
                <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="user-info cursor-pointer hover:opacity-80 transition-opacity" onClick={onLogout} title="Sair">
                        <div className="user-avatar">
                            <img
                                src={user?.picture || "https://api.dicebear.com/7.x/avataaars/svg?seed=user"}
                                alt="User"
                            />
                        </div>
                        <div className="user-details">
                            <p className="user-name">{user?.name || "Usuário"}</p>
                            <p className="user-email text-[10px] opacity-70">Clique para sair</p>
                        </div>
                    </div>
                    <button
                        onClick={onToggleTheme}
                        className="p-2 rounded-full hover:bg-white/10 text-muted-foreground hover:text-primary transition-colors"
                        title={isDarkMode ? "Mudar para tema claro" : "Mudar para tema escuro"}
                    >
                        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                </div>
            </div>


            {/* Mobile Bottom Navigation */}
            <nav className="mobile-bottom-nav">
                {menuItems.slice(0, 4).map(item => { // Show first 4 items
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.id}
                            className={`mobile-nav-item ${activeView === item.id ? 'active' : ''}`}
                            onClick={() => onViewChange(item.id)}
                        >
                            <Icon size={24} />
                            <span className="sr-only">{item.label}</span>
                        </button>
                    );
                })}
                <button
                    className="mobile-nav-item"
                    onClick={onToggleTheme}
                >
                    {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
                    <span className="sr-only">Tema</span>
                </button>
            </nav>
        </aside>
    );
};
