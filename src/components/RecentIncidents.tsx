'use client';

import { format } from 'date-fns';
import type { Incident } from '@/types';

const severityColors = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
};

const statusColors = {
  active: 'bg-red-100 text-red-800',
  investigating: 'bg-yellow-100 text-yellow-800',
  resolved: 'bg-green-100 text-green-800',
};

const typeLabels = {
  illegal_mining: 'Illegal Mining',
  water_pollution: 'Water Pollution',
  deforestation: 'Deforestation',
  land_degradation: 'Land Degradation',
};

export default function RecentIncidents({ incidents }: { incidents: Incident[] }) {
  if (incidents.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Incidents</h3>
        <p className="text-gray-500 text-center py-8">No incidents reported yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Recent Incidents</h3>
        <a href="/report" className="text-ghana-green text-sm hover:underline">
          View all
        </a>
      </div>
      <div className="space-y-4">
        {incidents.map((incident) => (
          <div
            key={incident.id}
            className="border-l-4 border-ghana-green pl-4 py-2 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{incident.title}</h4>
                <p className="text-sm text-gray-500 mt-1">
                  {incident.region} - {incident.district}
                </p>
              </div>
              <span className={`status-badge ${statusColors[incident.status]}`}>
                {incident.status}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className={`status-badge ${severityColors[incident.severity]}`}>
                {incident.severity}
              </span>
              <span className="text-xs text-gray-400">
                {typeLabels[incident.incident_type]}
              </span>
              <span className="text-xs text-gray-400 ml-auto">
                {format(new Date(incident.created_at), 'MMM d, yyyy')}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
