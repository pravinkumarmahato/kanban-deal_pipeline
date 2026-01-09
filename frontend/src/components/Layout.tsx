import React from 'react';
import { Link, useLocation } from 'react-router-dom'; // Using HashRouter in App.tsx but importing types from react-router-dom
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path ? "bg-brand-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white";

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col flex-shrink-0 transition-all duration-300">
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-2xl font-bold tracking-tight text-brand-500">Kanban</h1>
          <p className="text-xs text-slate-400 mt-1">Investment Pipeline Manager</p>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          <Link to="/" className={`block px-4 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/')}`}>
            Pipeline
          </Link>
          {user?.role === Role.ADMIN && (
            <Link to="/users" className={`block px-4 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/users')}`}>
              User Management
            </Link>
          )}
        </nav>

        <div className="p-4 border-t border-slate-700 bg-slate-800/50">
          <div className="flex items-center gap-3">
             <div className="h-8 w-8 rounded-full bg-brand-500 flex items-center justify-center text-white font-bold">
               {user?.full_name?.[0] || user?.email?.[0] || 'U'}
             </div>
             <div className="flex-1 min-w-0">
               <p className="text-sm font-medium truncate">{user?.full_name || user?.email || 'User'}</p>
               <p className="text-xs text-slate-400 truncate">{user?.role}</p>
             </div>
          </div>
          <button 
            onClick={logout}
            className="mt-4 w-full px-3 py-2 text-xs text-center border border-slate-600 rounded hover:bg-slate-700 text-slate-300 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
