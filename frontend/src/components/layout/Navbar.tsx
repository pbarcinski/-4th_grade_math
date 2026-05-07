import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Trophy, User, LayoutDashboard } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="font-display font-bold text-xl text-blue-600 dark:text-blue-400">
          Matematyka 4
        </Link>

        <div className="flex items-center gap-1">
          <Link
            to="/"
            className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-700 transition-all"
            aria-label="Strona główna"
          >
            <LayoutDashboard size={20} />
          </Link>
          <Link
            to="/leaderboard"
            className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-700 transition-all"
            aria-label="Ranking"
          >
            <Trophy size={20} />
          </Link>
          <Link
            to="/profile"
            className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-700 transition-all"
            aria-label="Profil"
          >
            <User size={20} />
          </Link>
          <ThemeToggle />
          {user && (
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-900/30 transition-all ml-1"
              aria-label="Wyloguj"
            >
              <LogOut size={20} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
