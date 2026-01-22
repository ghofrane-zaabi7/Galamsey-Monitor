'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Droplets, MapPin, Activity, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { DashboardStats } from '@/types';

interface StatCardProps {
  title: string;
  value: number;
  subValue?: string;
  icon: React.ReactNode;
  color: string;
  accentColor: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  delay?: number;
}

function AnimatedNumber({ value, duration = 1500 }: { value: number; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const steps = 40;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value, duration]);

  return <span>{displayValue.toLocaleString()}</span>;
}

function StatCard({ title, value, subValue, icon, color, accentColor, trend, trendValue, delay = 0 }: StatCardProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColorClass = trend === 'up' ? 'text-red-500 bg-red-50' : trend === 'down' ? 'text-green-500 bg-green-50' : 'text-gray-500 bg-gray-50';

  return (
    <div
      className={`stat-card shadow-card group ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
      style={{ '--card-accent': accentColor } as React.CSSProperties}
    >
      {/* Background gradient on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-300 rounded-3xl`} />

      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-2xl ${color.replace('from-', 'bg-').split(' ')[0]}/10`}>
            {icon}
          </div>
          {trend && trendValue && (
            <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${trendColorClass}`}>
              <TrendIcon className="w-3 h-3" />
              {trendValue}
            </div>
          )}
        </div>

        {/* Value */}
        <div className="mb-2">
          <p className={`text-4xl font-bold tracking-tight ${color.replace('from-', 'text-').split(' ')[0]}`}>
            <AnimatedNumber value={value} />
          </p>
        </div>

        {/* Title */}
        <p className="text-gray-900 font-semibold text-sm mb-1">{title}</p>

        {/* Subtitle */}
        {subValue && (
          <p className="text-gray-500 text-xs">{subValue}</p>
        )}

        {/* Decorative element */}
        <div className={`absolute bottom-0 right-0 w-24 h-24 ${color.replace('from-', 'bg-').split(' ')[0]}/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
      </div>
    </div>
  );
}

export default function DashboardStatsComponent({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Active Incidents"
        value={stats.activeIncidents}
        subValue={`${stats.totalIncidents} total reported`}
        icon={<AlertTriangle className="w-6 h-6 text-ghana-red" />}
        color="from-ghana-red to-red-600"
        accentColor="#CE1126"
        trend={stats.activeIncidents > 5 ? 'up' : 'stable'}
        trendValue={stats.activeIncidents > 5 ? '+12%' : '0%'}
        delay={0}
      />
      <StatCard
        title="Polluted Water Bodies"
        value={stats.pollutedWaterBodies}
        subValue={`${stats.affectedWaterBodies} monitored`}
        icon={<Droplets className="w-6 h-6 text-blue-500" />}
        color="from-blue-500 to-blue-600"
        accentColor="#3B82F6"
        trend="up"
        trendValue="+8%"
        delay={100}
      />
      <StatCard
        title="Active Mining Sites"
        value={stats.activeMiningSites}
        subValue={`${stats.totalMiningSites} total detected`}
        icon={<MapPin className="w-6 h-6 text-orange-500" />}
        color="from-orange-500 to-orange-600"
        accentColor="#F97316"
        trend="down"
        trendValue="-5%"
        delay={200}
      />
      <StatCard
        title="Regions Affected"
        value={stats.incidentsByRegion.length}
        subValue="Out of 16 regions"
        icon={<Activity className="w-6 h-6 text-purple-500" />}
        color="from-purple-500 to-purple-600"
        accentColor="#A855F7"
        trend="stable"
        trendValue="0%"
        delay={300}
      />
    </div>
  );
}
