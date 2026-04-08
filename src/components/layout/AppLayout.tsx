import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard, Store, Package, Building2, ClipboardList, BarChart3,
  Menu, X, LogOut, ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  { title: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { title: 'Pasar', path: '/pasar', icon: Store },
  { title: 'Komoditas', path: '/komoditas', icon: Package },
  { title: 'Tempat Usaha', path: '/tempat-usaha', icon: Building2 },
  { title: 'Harga Rutin', path: '/harga-rutin', icon: ClipboardList },
  { title: 'Harga Pelaporan', path: '/harga-pelaporan', icon: BarChart3 },
];

export default function AppLayout() {
  const { logout } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => location.pathname.startsWith(path);
  const currentPage = menuItems.find(m => isActive(m.path));

  // Close menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  // Close on route change
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="flex h-14 items-center justify-between px-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <span className="text-base font-bold text-accent tracking-tight">Harga Pangan</span>
            <span className="hidden sm:inline text-xs text-muted-foreground">Backoffice</span>
          </div>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-1">
            {menuItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive(item.path)
                    ? 'bg-accent/15 text-accent'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.title}</span>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="hidden md:flex items-center gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" />
              <span className="text-sm">Keluar</span>
            </Button>

            {/* Mobile burger */}
            <div className="md:hidden" ref={menuRef}>
              <Button variant="ghost" size="icon" onClick={() => setMenuOpen(!menuOpen)}>
                {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>

              {/* Dropdown menu - drops down from navbar */}
              {menuOpen && (
                <div className="absolute left-0 right-0 top-14 bg-card border-b shadow-lg animate-in slide-in-from-top-2 duration-200">
                  <nav className="flex flex-col p-2 max-w-7xl mx-auto">
                    {menuItems.map(item => (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={cn(
                          'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors',
                          isActive(item.path)
                            ? 'bg-accent/15 text-accent'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        )}
                      >
                        <item.icon className="h-5 w-5" />
                        <span>{item.title}</span>
                      </Link>
                    ))}
                    <div className="border-t mt-2 pt-2">
                      <button
                        onClick={() => { logout(); setMenuOpen(false); }}
                        className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-destructive hover:bg-destructive/10 w-full"
                      >
                        <LogOut className="h-5 w-5" />
                        <span>Keluar</span>
                      </button>
                    </div>
                  </nav>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6">
        <Outlet />
      </main>
    </div>
  );
}
