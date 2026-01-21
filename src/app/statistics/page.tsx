'use client';

import { useEffect, useState } from 'react';
import Navigation from '@/components/Navigation';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import type { DashboardStats } from '@/types';

const COLORS = ['#006B3F', '#CE1126', '#FCD116', '#3B82F6', '#8B5CF6', '#F59E0B'];

const typeLabels: Record<string, string> = {
  illegal_mining: 'Illegal Mining',
  water_pollution: 'Water Pollution',
  deforestation: 'Deforestation',
  land_degradation: 'Land Degradation',
};

export default function StatisticsPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching stats:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-96">
            <div className="text-gray-500">Loading statistics...</div>
          </div>
        </main>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-16">
            <p className="text-red-600">Failed to load statistics</p>
          </div>
        </main>
      </div>
    );
  }

  const incidentTypeData = stats.incidentsByType.map(item => ({
    name: typeLabels[item.type] || item.type,
    value: item.count,
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Statistics & Analytics</h1>
          <p className="text-gray-600 mt-2">
            Data-driven insights into galamsey activities across Ghana.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <p className="text-4xl font-bold text-ghana-red">{stats.totalIncidents}</p>
            <p className="text-gray-600 mt-1">Total Incidents</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <p className="text-4xl font-bold text-orange-600">{stats.activeIncidents}</p>
            <p className="text-gray-600 mt-1">Active Incidents</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <p className="text-4xl font-bold text-blue-600">{stats.pollutedWaterBodies}</p>
            <p className="text-gray-600 mt-1">Polluted Water Bodies</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <p className="text-4xl font-bold text-ghana-green">{stats.activeMiningSites}</p>
            <p className="text-gray-600 mt-1">Active Mining Sites</p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Incidents by Region */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Incidents by Region</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.incidentsByRegion} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="region" type="category" width={100} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#006B3F" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Incidents by Type */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Incidents by Type</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={incidentTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {incidentTypeData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Water Quality Trend */}
          <div className="bg-white rounded-xl shadow-md p-6 lg:col-span-2">
            <h3 className="text-lg font-semibold mb-4">Water Quality Trend (Last 30 Days)</h3>
            {stats.waterQualityTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.waterQualityTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="safe"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    name="Safe Readings"
                  />
                  <Line
                    type="monotone"
                    dataKey="polluted"
                    stroke="#EF4444"
                    strokeWidth={2}
                    name="Polluted Readings"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                No trend data available for the last 30 days
              </div>
            )}
          </div>
        </div>

        {/* Key Insights */}
        <div className="mt-8 bg-gradient-to-r from-ghana-green to-green-700 text-white rounded-xl p-6">
          <h3 className="text-xl font-bold mb-4">Key Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-ghana-gold">Most Affected Regions</h4>
              <ul className="mt-2 space-y-1">
                {stats.incidentsByRegion.slice(0, 5).map((region, index) => (
                  <li key={region.region} className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-sm">
                      {index + 1}
                    </span>
                    {region.region} - {region.count} incidents
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-ghana-gold">Environmental Impact</h4>
              <ul className="mt-2 space-y-2 text-green-100">
                <li>
                  {Math.round((stats.pollutedWaterBodies / stats.affectedWaterBodies) * 100)}% of monitored water bodies are polluted
                </li>
                <li>
                  {Math.round((stats.activeMiningSites / stats.totalMiningSites) * 100)}% of detected mining sites remain active
                </li>
                <li>
                  {Math.round((stats.activeIncidents / stats.totalIncidents) * 100)}% of reported incidents are still active
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">
            Help us gather more data to fight galamsey effectively.
          </p>
          <a
            href="/report"
            className="inline-flex items-center gap-2 bg-ghana-red text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors"
          >
            Report an Incident
          </a>
        </div>
      </main>
    </div>
  );
}
