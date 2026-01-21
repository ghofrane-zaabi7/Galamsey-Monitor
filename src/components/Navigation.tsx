'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  AlertTriangle,
  Droplets,
  Map,
  BarChart3,
  BookOpen,
  Satellite
} from 'lucide-react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/report', label: 'Report Incident', icon: AlertTriangle },
  { href: '/map', label: 'Live Map', icon: Map },
  { href: '/water', label: 'Water Quality', icon: Droplets },
  { href: '/statistics', label: 'Statistics', icon: BarChart3 },
  { href: '/satellite', label: 'Satellite View', icon: Satellite },
  { href: '/awareness', label: 'Learn More', icon: BookOpen },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="bg-ghana-green text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-ghana-gold rounded-full flex items-center justify-center">
              <span className="text-ghana-green font-bold text-xl">G</span>
            </div>
            <div>
              <span className="font-bold text-lg">Galamsey Monitor</span>
              <span className="hidden sm:inline text-ghana-gold text-sm ml-2">Ghana</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center space-x-1">
            {navItems.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-white/20 text-ghana-gold'
                      : 'hover:bg-white/10 hover:text-ghana-gold'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </Link>
              );
            })}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="p-2 rounded-md hover:bg-white/10">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile navigation */}
      <div className="md:hidden border-t border-white/20">
        <div className="px-2 py-2 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
                  isActive
                    ? 'bg-white/20 text-ghana-gold'
                    : 'hover:bg-white/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
