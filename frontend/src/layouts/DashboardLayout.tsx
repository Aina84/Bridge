import React, { useState } from 'react';
import { NavLink, Outlet, Navigate, useNavigate } from 'react-router-dom';
import {
  Ticket,
  LayoutDashboard,
  Plus,
  Users,
  Tag,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Bell,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { Avatar, Button } from '@/components/ui';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { APP_NAME, ROUTES } from '@/config/constants';

interface NavItem {
  label: string;
  to: string;
  icon: React.ReactNode;
  roles?: string[];
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Tableau de bord', to: '/', icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: 'Tickets', to: '/tickets', icon: <Ticket className="h-4 w-4" /> },
  { label: 'Nouveau ticket', to: '/tickets/new', icon: <Plus className="h-4 w-4" /> },
  { label: 'Utilisateurs', to: '/users', icon: <Users className="h-4 w-4" />, roles: ['ADMIN'] },
  { label: 'Catégories', to: '/categories', icon: <Tag className="h-4 w-4" />, roles: ['ADMIN'] },
];

export const DashboardLayout: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!isAuthenticated) return <Navigate to={ROUTES.AUTH.LOGIN} replace />;

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.roles || (user?.role && item.roles.includes(user.role)),
  );

  const handleLogout = () => {
    logout();
    navigate(ROUTES.AUTH.LOGIN);
  };

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-5 border-b border-slate-100">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-600">
          <Ticket className="h-4 w-4 text-white" />
        </div>
        <span className="font-heading font-bold text-slate-900 text-base">{APP_NAME}</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {visibleItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
              )
            }
          >
            {item.icon}
            {item.label}
            {item.to === '/tickets' && (
              <ChevronRight className="h-3.5 w-3.5 ml-auto text-slate-300" />
            )}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="border-t border-slate-100 p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          {user && (
            <Avatar firstName={user.firstName} lastName={user.lastName} size="sm" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-slate-400 truncate">{user?.email}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-slate-400 hover:text-red-500"
            onClick={handleLogout}
            title="Se déconnecter"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-60 flex-shrink-0 border-r border-slate-200 bg-white">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-slate-900/40"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-60 flex flex-col bg-white shadow-xl z-50">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {/* Top bar (mobile) */}
        <header className="flex lg:hidden items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-slate-500 hover:text-slate-700"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <Ticket className="h-5 w-5 text-primary-600" />
            <span className="font-heading font-bold text-slate-900">{APP_NAME}</span>
          </div>
          <button className="text-slate-500 hover:text-slate-700">
            <Bell className="h-5 w-5" />
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
