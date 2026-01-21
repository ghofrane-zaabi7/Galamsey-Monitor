'use client';

import { AlertTriangle, Droplets, MapPin, Activity } from 'lucide-react';
import type { DashboardStats } from '@/types';

interface StatCardProps {
  title: string;
  value: number;
  subValue?: string;
  icon: React.ReactNode;
  color: string;
}

function StatCard({ title, value, subValue, icon, color }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 card-hover">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <p className={`text-3xl font-bold ${color}`}>{value}</p>
          {subValue && <p className="text-gray-400 text-sm mt-1">{subValue}</p>}
        </div>
        <div className={`p-3 rounded-full ${color.replace('text-', 'bg-').replace('-600', '-100')}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function DashboardStatsComponent({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Active Incidents"
        value={stats.activeIncidents}
        subValue={`${stats.totalIncidents} total reported`}
        icon={<AlertTriangle className="w-6 h-6 text-red-600" />}
        color="text-red-600"
      />
      <StatCard
        title="Polluted Water Bodies"
        value={stats.pollutedWaterBodies}
        subValue={`${stats.affectedWaterBodies} monitored`}
        icon={<Droplets className="w-6 h-6 text-blue-600" />}
        color="text-blue-600"
      />
      <StatCard
        title="Active Mining Sites"
        value={stats.activeMiningSites}
        subValue={`${stats.totalMiningSites} total detected`}
        icon={<MapPin className="w-6 h-6 text-orange-600" />}
        color="text-orange-600"
      />
      <StatCard
        title="Regions Affected"
        value={stats.incidentsByRegion.length}
        subValue="Out of 16 regions"
        icon={<Activity className="w-6 h-6 text-purple-600" />}
        color="text-purple-600"
      />
    </div>
  );
}
