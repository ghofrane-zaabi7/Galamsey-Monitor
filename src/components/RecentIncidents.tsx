'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { format, formatDistanceToNow } from 'date-fns';
import { AlertTriangle, MapPin, Clock, ChevronRight, Flame, AlertCircle, Info, CheckCircle } from 'lucide-react';
import type { Incident } from '@/types';

const severityConfig = {
  low: {
    color: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-200',
    icon: Info,
    label: 'Low',
  },
  medium: {
    color: 'text-yellow-600',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    icon: AlertCircle,
    label: 'Medium',
  },
  high: {
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    icon: AlertTriangle,
    label: 'High',
  },
  critical: {
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: Flame,
    label: 'Critical',
  },
};

const statusConfig = {
  active: {
    color: 'text-red-600',
    bg: 'bg-red-100',
    dot: 'bg-red-500',
    label: 'Active',
  },
  investigating: {
    color: 'text-yellow-600',
    bg: 'bg-yellow-100',
    dot: 'bg-yellow-500',
    label: 'Investigating',
  },
  resolved: {
    color: 'text-green-600',
    bg: 'bg-green-100',
    dot: 'bg-green-500',
    label: 'Resolved',
  },
};

const typeLabels: Record<string, string> = {
  illegal_mining: 'Illegal Mining',
  water_pollution: 'Water Pollution',
  deforestation: 'Deforestation',
  land_degradation: 'Land Degradation',
};

interface IncidentCardProps {
  incident: Incident;
  index: number;
}

function IncidentCard({ incident, index }: IncidentCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const severity = severityConfig[incident.severity];
  const status = statusConfig[incident.status];
  const SeverityIcon = severity.icon;

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), index * 100);
    return () => clearTimeout(timer);
  }, [index]);

  return (
    <Link
      href={`/incident/${incident.id}`}
      className={`incident-card severity-${incident.severity} block group ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
    >
      <div className="flex items-start gap-4">
        {/* Severity indicator */}
        <div className={`flex-shrink-0 p-2 rounded-xl ${severity.bg} ${severity.border} border`}>
          <SeverityIcon className={`w-5 h-5 ${severity.color}`} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-ghana-green transition-colors">
              {incident.title}
            </h4>
            <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 group-hover:translate-x-1 group-hover:text-ghana-green transition-all" />
          </div>

          {/* Location */}
          <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-3">
            <MapPin className="w-3.5 h-3.5" />
            <span className="truncate">{incident.district}, {incident.region}</span>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status badge */}
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${status.dot} ${incident.status === 'active' ? 'animate-pulse' : ''}`} />
              {status.label}
            </span>

            {/* Severity badge */}
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${severity.bg} ${severity.color}`}>
              {severity.label}
            </span>

            {/* Type label */}
            <span className="text-xs text-gray-400">
              {typeLabels[incident.incident_type]}
            </span>
          </div>

          {/* Timestamp */}
          <div className="flex items-center gap-1.5 mt-3 text-xs text-gray-400">
            <Clock className="w-3 h-3" />
            <span>{formatDistanceToNow(new Date(incident.created_at), { addSuffix: true })}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function RecentIncidents({ incidents }: { incidents: Incident[] }) {
  if (incidents.length === 0) {
    return (
      <div className="bg-white rounded-3xl shadow-card p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-ghana-green/10 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-ghana-green" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Recent Incidents</h3>
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 font-medium">No incidents reported</p>
          <p className="text-gray-400 text-sm mt-1">The environment is safe for now</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-card overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-ghana-red/10 rounded-xl">
              <AlertTriangle className="w-5 h-5 text-ghana-red" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Recent Incidents</h3>
              <p className="text-sm text-gray-500">{incidents.length} reports this week</p>
            </div>
          </div>
          <Link
            href="/map"
            className="text-sm text-ghana-green font-medium hover:underline flex items-center gap-1"
          >
            View all
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Incidents list */}
      <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
        {incidents.map((incident, index) => (
          <IncidentCard key={incident.id} incident={incident} index={index} />
        ))}
      </div>

      {/* Footer CTA */}
      <div className="p-4 bg-gradient-to-r from-ghana-green/5 to-transparent border-t border-gray-100">
        <Link
          href="/report"
          className="flex items-center justify-center gap-2 w-full py-3 bg-ghana-green text-white font-semibold rounded-xl hover:bg-ghana-green/90 transition-colors"
        >
          <AlertTriangle className="w-4 h-4" />
          Report New Incident
        </Link>
      </div>
    </div>
  );
}
