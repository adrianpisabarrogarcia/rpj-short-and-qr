import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 bg-[#f5f7f2] dark:bg-[#1c1d1a] hover:bg-[#edf0e8] dark:hover:bg-[#22231f] text-[#6d7067] dark:text-[#d4d8cc] border border-[#edf0e8] dark:border-[#2b2d28] rounded-xl cursor-pointer transition"
      title="Cambiar tema"
    >
      {theme === 'dark' ? <Sun size={16} className="text-yellow-400" /> : <Moon size={16} className="text-indigo-600" />}
    </button>
  );
}
