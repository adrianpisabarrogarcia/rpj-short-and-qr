import { LogOut, Sparkles, Sun, Moon, User } from 'lucide-react';
import type { Theme } from '../../hooks/useTheme';

interface DashboardHeaderProps {
  user: {
    name: string;
    email: string;
    picture?: string;
  };
  theme: Theme;
  onToggleTheme: () => void;
}

export default function DashboardHeader({ user, theme, onToggleTheme }: DashboardHeaderProps) {
  return (
    <header className="flex flex-col md:flex-row items-center justify-between gap-4 p-5 bg-[#ffffff] dark:bg-[#121310] border border-[#edf0e8] dark:border-[#1c1d1a] rounded-2xl transition-colors duration-200">
      <div className="flex items-center gap-3">
        {user.picture ? (
          <img src={user.picture} alt={user.name} className="w-12 h-12 rounded-full border-2 border-[#94C700]" />
        ) : (
          <div className="w-12 h-12 rounded-full bg-[#edf0e8] dark:bg-[#1c1d1a] flex items-center justify-center border border-[#94C700]/30">
            <User className="text-[#94C700]" />
          </div>
        )}
        <div>
          <h2 className="text-[#1c1d1a] dark:text-white font-bold text-lg flex items-center gap-2">
            Hola, {user.name} <Sparkles size={16} className="text-[#94C700] animate-pulse" />
          </h2>
          <p className="text-[#6d7067] dark:text-[#575855] text-xs font-mono">{user.email}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Theme switcher button */}
        <button
          onClick={onToggleTheme}
          className="p-2.5 bg-[#f5f7f2] dark:bg-[#1c1d1a] hover:bg-[#edf0e8] dark:hover:bg-[#22231f] text-[#6d7067] dark:text-[#d4d8cc] border border-[#edf0e8] dark:border-[#2b2d28] rounded-xl cursor-pointer transition"
          title="Cambiar tema de la interfaz"
        >
          {theme === 'dark' ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-indigo-600" />}
        </button>

        <a
          href="/api/auth/logout"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-500 dark:text-red-400 border border-red-500/20 hover:bg-red-500/10 cursor-pointer transition"
        >
          <LogOut size={16} /> Cerrar Sesión
        </a>
      </div>
    </header>
  );
}
