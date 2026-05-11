import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Users,
  Calculator,
  LogOut,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  Menu,
  User as UserIcon,
  Upload
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { isMobile } from '../../lib/helpers';

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const { user, firebaseUser, logout } = useAuth();
  const location = useLocation();

  const isAdmin = user?.roles?.includes('admin') || user?.roles?.includes('sys-admin');

  const navItems = [
    {
      title: 'Personas',
      href: '/',
      icon: Users,
      show: true
    },
    {
      title: 'Planes de Pago',
      href: '/planes-pago',
      icon: Calculator,
      show: isAdmin
    },
    {
      title: 'Importaciones',
      href: '/importaciones',
      icon: Upload,
      show: isAdmin
    }
  ];

  const ModeToggle = () => (
    <button
      onClick={() => document.documentElement.classList.toggle('dark')}
      className="flex w-full items-center gap-3 rounded-xl p-2.5 transition-all hover:bg-primary/10 hover:text-primary group"
      title="Cambiar tema"
    >
      <div className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary transition-colors">
        <Sun className="size-5 hidden dark:block text-amber-500" />
        <Moon className="size-5 block dark:hidden text-indigo-600" />
      </div>
      {!isCollapsed && <span className="text-sm font-semibold">Cambiar Tema</span>}
    </button>
  );

  return (
    <>
      {/* Mobile Trigger */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="fixed top-4 left-4 z-50 flex items-center justify-center rounded-xl bg-primary p-2 text-white shadow-lg md:hidden"
      >
        <Menu className="size-5" />
      </button>

      {/* Sidebar Overlay */}
      {
        (!isCollapsed) && (
          <div
            className="fixed inset-0 z-40 backdrop-blur-xs"
            onClick={() => setIsCollapsed(true)}
          />
        )
      }

      {/* Sidebar Container */}
      <aside className={`
        fixed left-0 top-0 z-40 h-full bg-card border-r border-border transition-all duration-300 flex flex-col
        ${isCollapsed ? 'w-20' : 'w-64'}
        ${isMobile && !isCollapsed ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Logo Section */}
        <div className="p-6 flex items-center justify-between">
          {!isMobile && !isCollapsed && (
            <h2 className="text-xl font-black bg-gradient-to-r from-primary to-indigo-400 bg-clip-text text-transparent">
              Sr. Cobranza
            </h2>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden cursor-pointer md:flex size-8 items-center justify-center rounded-lg hover:bg-muted text-muted-foreground transition-colors"
          >
            {isCollapsed ? <ChevronRight className="size-5" /> : <ChevronLeft className="size-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.filter(item => item.show).map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={`
                flex items-center gap-3 rounded-xl p-2.5 transition-all group
                ${location.pathname === item.href
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'hover:bg-primary/10 hover:text-primary text-muted-foreground'}
              `}
            >
              <div className={`
                flex size-9 items-center justify-center rounded-lg transition-colors
                ${location.pathname === item.href ? 'bg-white/20' : 'bg-muted group-hover:bg-primary/20'}
              `}>
                <item.icon className="size-5" />
              </div>
              {!isCollapsed && <span className="text-sm font-bold uppercase tracking-wider">{item.title}</span>}
            </Link>
          ))}
        </nav>

        {/* Bottom Section: User, Mode, Logout */}
        <div className="p-4 border-t border-border space-y-2">
          {/* User Info */}
          <div className={`flex items-center gap-3 px-2 py-3 rounded-xl ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <UserIcon className="size-5" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0 overflow-hidden">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest truncate">Usuario</p>
                <p className="text-sm font-bold truncate">{firebaseUser?.email}</p>
              </div>
            )}
          </div>

          <ModeToggle />

          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl p-2.5 text-destructive transition-all hover:bg-destructive/10 group"
          >
            <div className="flex size-9 items-center justify-center rounded-lg bg-destructive/10 group-hover:bg-destructive/20 transition-colors">
              <LogOut className="size-5" />
            </div>
            {!isCollapsed && <span className="text-sm font-bold uppercase tracking-wider">Salir</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
