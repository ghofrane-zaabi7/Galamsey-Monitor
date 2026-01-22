'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import DashboardStats from '@/components/DashboardStats';
import RecentIncidents from '@/components/RecentIncidents';
import GhanaMap from '@/components/GhanaMap';
import {
  AlertTriangle,
  Droplets,
  Map,
  ArrowRight,
  Shield,
  Eye,
  Users,
  TrendingUp,
  Zap,
  TreePine,
  Mountain,
  Waves,
  ChevronRight,
  Play,
  Bell,
  FileText,
  BarChart3,
} from 'lucide-react';
import type { DashboardStats as DashboardStatsType, Incident, WaterQualityReading, MiningSite } from '@/types';

// Animated counter component
function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [displayValue, setDisplayValue] = useState(0);
  const countRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
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
  }, [value]);

  return (
    <span ref={countRef} className="counter-value">
      {displayValue.toLocaleString()}{suffix}
    </span>
  );
}

export default function Home() {
  const [stats, setStats] = useState<DashboardStatsType | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [waterReadings, setWaterReadings] = useState<WaterQualityReading[]>([]);
  const [miningSites, setMiningSites] = useState<MiningSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    async function fetchData() {
      try {
        const [statsRes, incidentsRes, waterRes, sitesRes] = await Promise.all([
          fetch('/api/stats'),
          fetch('/api/incidents'),
          fetch('/api/water'),
          fetch('/api/sites'),
        ]);

        const [statsData, incidentsData, waterData, sitesData] = await Promise.all([
          statsRes.json(),
          incidentsRes.json(),
          waterRes.json(),
          sitesRes.json(),
        ]);

        setStats(statsData);
        setIncidents(incidentsData);
        setWaterReadings(waterData);
        setMiningSites(sitesData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-forest-950 via-ghana-black to-earth-950">
        <Navigation />
        <div className="flex flex-col items-center justify-center h-[80vh] gap-6">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-ghana-green/30 rounded-full animate-spin-slow" />
            <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-ghana-gold rounded-full animate-spin" />
          </div>
          <p className="text-white/60 font-medium tracking-wide">Loading environmental data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafaf8]">
      <Navigation />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-forest-950 via-ghana-black to-earth-950 noise-overlay">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-ghana-green/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-ghana-gold/5 rounded-full blur-3xl animate-float delay-200" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-ghana-green/5 to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24 lg:pt-24 lg:pb-32">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left content */}
            <div className={`space-y-8 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm rounded-full border border-white/10">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-ghana-gold opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-ghana-gold" />
                </span>
                <span className="text-sm text-white/80 font-medium">
                  {stats?.activeIncidents || 0} Active Incidents Monitored
                </span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight">
                Protecting Ghana&apos;s
                <span className="block mt-2">
                  <span className="text-gradient-gold">Natural Heritage</span>
                </span>
              </h1>

              {/* Description */}
              <p className="text-lg text-white/60 max-w-xl leading-relaxed">
                Real-time monitoring and community-driven reporting of illegal mining activities.
                Together, we safeguard our water bodies, forests, and communities for future generations.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/report"
                  className="group inline-flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-ghana-red to-red-700 text-white font-semibold rounded-xl hover:shadow-glow-red transition-all duration-300 hover:-translate-y-1"
                >
                  <AlertTriangle className="w-5 h-5" />
                  Report Incident
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/map"
                  className="group inline-flex items-center gap-3 px-6 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300"
                >
                  <Map className="w-5 h-5" />
                  Explore Map
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="flex items-center gap-8 pt-4">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-full bg-gradient-to-br from-ghana-green to-forest-700 border-2 border-ghana-black flex items-center justify-center text-white text-xs font-bold"
                      >
                        {String.fromCharCode(64 + i)}
                      </div>
                    ))}
                  </div>
                  <span className="text-sm text-white/50">500+ contributors</span>
                </div>
                <div className="h-8 w-px bg-white/10" />
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-ghana-green" />
                  <span className="text-sm text-white/50">Verified Reports</span>
                </div>
              </div>
            </div>

            {/* Right content - Stats preview */}
            <div className={`relative ${isVisible ? 'animate-fade-in-up delay-200' : 'opacity-0'}`}>
              <div className="relative">
                {/* Floating stat cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="glass-card-dark rounded-2xl p-6 transform hover:scale-105 transition-transform">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-ghana-red/20 rounded-lg">
                        <AlertTriangle className="w-5 h-5 text-ghana-red" />
                      </div>
                      <span className="text-white/60 text-sm">Active Alerts</span>
                    </div>
                    <p className="text-3xl font-bold text-white">
                      <AnimatedCounter value={stats?.activeIncidents || 0} />
                    </p>
                  </div>

                  <div className="glass-card-dark rounded-2xl p-6 transform hover:scale-105 transition-transform translate-y-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-water-polluted/20 rounded-lg">
                        <Droplets className="w-5 h-5 text-water-polluted" />
                      </div>
                      <span className="text-white/60 text-sm">Polluted Waters</span>
                    </div>
                    <p className="text-3xl font-bold text-white">
                      <AnimatedCounter value={stats?.pollutedWaterBodies || 0} />
                    </p>
                  </div>

                  <div className="glass-card-dark rounded-2xl p-6 transform hover:scale-105 transition-transform -translate-y-2">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-ghana-gold/20 rounded-lg">
                        <Mountain className="w-5 h-5 text-ghana-gold" />
                      </div>
                      <span className="text-white/60 text-sm">Mining Sites</span>
                    </div>
                    <p className="text-3xl font-bold text-white">
                      <AnimatedCounter value={stats?.activeMiningSites || 0} />
                    </p>
                  </div>

                  <div className="glass-card-dark rounded-2xl p-6 transform hover:scale-105 transition-transform translate-y-2">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-ghana-green/20 rounded-lg">
                        <TreePine className="w-5 h-5 text-ghana-green" />
                      </div>
                      <span className="text-white/60 text-sm">Regions Affected</span>
                    </div>
                    <p className="text-3xl font-bold text-white">
                      <AnimatedCounter value={stats?.incidentsByRegion?.length || 0} suffix="/16" />
                    </p>
                  </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute -top-4 -right-4 w-24 h-24 border border-ghana-gold/20 rounded-full" />
                <div className="absolute -bottom-4 -left-4 w-16 h-16 border border-ghana-green/20 rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path
              d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="#fafaf8"
            />
          </svg>
        </div>
      </section>

      {/* Alert Banner */}
      {stats && stats.activeIncidents > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10">
          <div className="bg-gradient-to-r from-ghana-red to-red-700 text-white p-4 rounded-2xl shadow-glow-red flex items-center justify-between flex-wrap gap-4 animate-pulse-glow">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-white/20 rounded-lg">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold">
                  {stats.activeIncidents} Active {stats.activeIncidents === 1 ? 'Incident' : 'Incidents'} Require Attention
                </p>
                <p className="text-white/80 text-sm">Critical environmental threats detected in multiple regions</p>
              </div>
            </div>
            <Link
              href="/map"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-ghana-red font-semibold rounded-lg hover:bg-white/90 transition-colors"
            >
              View on Map
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Section Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold text-ghana-black tracking-tight">Live Monitoring</h2>
            <p className="text-gray-500 mt-2">Real-time environmental data from across Ghana</p>
          </div>
          <Link
            href="/statistics"
            className="hidden sm:inline-flex items-center gap-2 text-ghana-green font-medium hover:gap-3 transition-all"
          >
            View Full Statistics
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Stats Cards */}
        {stats && <DashboardStats stats={stats} />}

        {/* Map and Incidents Grid */}
        <div className="grid lg:grid-cols-3 gap-8 mt-12">
          {/* Map Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-card overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-ghana-green/10 rounded-xl">
                      <Map className="w-5 h-5 text-ghana-green" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-ghana-black">Live Incident Map</h3>
                      <p className="text-sm text-gray-500">Click markers for details</p>
                    </div>
                  </div>
                  <Link
                    href="/map"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-ghana-green/10 text-ghana-green text-sm font-medium rounded-lg hover:bg-ghana-green/20 transition-colors"
                  >
                    Full Screen
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
              <div className="map-container" style={{ height: '500px' }}>
                <GhanaMap
                  incidents={incidents}
                  waterReadings={waterReadings}
                  miningSites={miningSites}
                  height="500px"
                />
              </div>
            </div>
          </div>

          {/* Recent Incidents Sidebar */}
          <div className="lg:col-span-1">
            {stats && <RecentIncidents incidents={stats.recentIncidents} />}
          </div>
        </div>

        {/* Feature Cards */}
        <section className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-ghana-black tracking-tight">How You Can Help</h2>
            <p className="text-gray-500 mt-3 max-w-2xl mx-auto">
              Join thousands of Ghanaians working together to protect our environment. Every report matters.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Link href="/report" className="group feature-card shadow-card">
              <div className="p-4 bg-gradient-to-br from-ghana-red/10 to-ghana-red/5 rounded-2xl w-fit mb-6">
                <AlertTriangle className="w-8 h-8 text-ghana-red" />
              </div>
              <h3 className="text-xl font-semibold text-ghana-black mb-3 group-hover:text-ghana-red transition-colors">
                Report an Incident
              </h3>
              <p className="text-gray-500 mb-6">
                Spot illegal mining activity? Report it anonymously and help authorities take action quickly.
              </p>
              <span className="inline-flex items-center gap-2 text-ghana-red font-medium">
                Report Now
                <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
              </span>
            </Link>

            <Link href="/water" className="group feature-card shadow-card">
              <div className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-2xl w-fit mb-6">
                <Droplets className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold text-ghana-black mb-3 group-hover:text-blue-500 transition-colors">
                Check Water Quality
              </h3>
              <p className="text-gray-500 mb-6">
                Monitor water quality readings from rivers and streams across all 16 regions of Ghana.
              </p>
              <span className="inline-flex items-center gap-2 text-blue-500 font-medium">
                View Readings
                <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
              </span>
            </Link>

            <Link href="/awareness" className="group feature-card shadow-card">
              <div className="p-4 bg-gradient-to-br from-ghana-green/10 to-ghana-green/5 rounded-2xl w-fit mb-6">
                <TreePine className="w-8 h-8 text-ghana-green" />
              </div>
              <h3 className="text-xl font-semibold text-ghana-black mb-3 group-hover:text-ghana-green transition-colors">
                Learn About Galamsey
              </h3>
              <p className="text-gray-500 mb-6">
                Understand the environmental and social impact of illegal mining on our communities.
              </p>
              <span className="inline-flex items-center gap-2 text-ghana-green font-medium">
                Learn More
                <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
              </span>
            </Link>
          </div>
        </section>

        {/* Impact Section */}
        <section className="mt-20">
          <div className="relative bg-gradient-to-br from-forest-950 via-ghana-black to-earth-950 rounded-3xl overflow-hidden noise-overlay">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-ghana-green/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-ghana-gold/5 rounded-full blur-3xl" />

            <div className="relative px-8 py-16 sm:px-16 sm:py-20">
              <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                  The True Cost of <span className="text-gradient-gold">Galamsey</span>
                </h2>
                <p className="text-white/60 mt-4 max-w-2xl mx-auto">
                  Illegal mining threatens Ghana&apos;s most precious natural resources. These numbers tell the story.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4">
                <div className="impact-stat">
                  <p className="text-4xl sm:text-5xl font-bold text-ghana-gold mb-2">
                    <AnimatedCounter value={60} suffix="%" />
                  </p>
                  <p className="text-white/60 text-sm">Water bodies polluted by mining activities</p>
                </div>
                <div className="impact-stat">
                  <p className="text-4xl sm:text-5xl font-bold text-ghana-gold mb-2">
                    $<AnimatedCounter value={2.2} suffix="B" />
                  </p>
                  <p className="text-white/60 text-sm">Annual economic loss to Ghana</p>
                </div>
                <div className="impact-stat">
                  <p className="text-4xl sm:text-5xl font-bold text-ghana-gold mb-2">
                    <AnimatedCounter value={34} suffix="%" />
                  </p>
                  <p className="text-white/60 text-sm">Forest cover destroyed since 2000</p>
                </div>
                <div className="impact-stat">
                  <p className="text-4xl sm:text-5xl font-bold text-ghana-gold mb-2">
                    <AnimatedCounter value={5} suffix="M+" />
                  </p>
                  <p className="text-white/60 text-sm">People affected by water contamination</p>
                </div>
              </div>

              <div className="flex justify-center mt-12">
                <Link
                  href="/awareness"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-ghana-gold text-ghana-black font-semibold rounded-xl hover:bg-yellow-400 transition-all duration-300 hover:-translate-y-1 hover:shadow-glow-gold"
                >
                  Take Action Today
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Platform Features */}
        <section className="mt-20">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-ghana-black tracking-tight">Platform Features</h2>
              <p className="text-gray-500 mt-2">Powerful tools for environmental monitoring</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Eye, title: 'Real-time Monitoring', desc: 'Live satellite imagery and incident tracking', color: 'text-purple-500', bg: 'bg-purple-500/10' },
              { icon: Bell, title: 'Instant Alerts', desc: 'Get notified about incidents in your area', color: 'text-orange-500', bg: 'bg-orange-500/10' },
              { icon: FileText, title: 'Detailed Reports', desc: 'Download comprehensive PDF reports', color: 'text-blue-500', bg: 'bg-blue-500/10' },
              { icon: BarChart3, title: 'Data Analytics', desc: 'Visualize trends and patterns over time', color: 'text-ghana-green', bg: 'bg-ghana-green/10' },
            ].map((feature, i) => (
              <div
                key={feature.title}
                className="bg-white rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className={`p-3 ${feature.bg} rounded-xl w-fit mb-4`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="font-semibold text-ghana-black mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-500">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="mt-20">
          <div className="bg-gradient-to-r from-ghana-green to-forest-700 rounded-3xl p-8 sm:p-12 relative overflow-hidden">
            {/* Decorative patterns */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-center md:text-left">
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                  Ready to Make a Difference?
                </h2>
                <p className="text-white/80 max-w-lg">
                  Join our community of environmental guardians. Your reports help protect Ghana&apos;s natural resources.
                </p>
              </div>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-ghana-green font-semibold rounded-xl hover:bg-gray-100 transition-colors"
                >
                  Create Account
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/report"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-colors"
                >
                  Report Anonymously
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-ghana-black text-white mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-4 gap-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-ghana-green to-forest-700 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">G</span>
                </div>
                <div>
                  <span className="font-bold text-xl">Galamsey</span>
                  <span className="text-ghana-gold font-semibold ml-1">Monitor</span>
                </div>
              </div>
              <p className="text-gray-400 max-w-md mb-6">
                A community-driven platform dedicated to protecting Ghana&apos;s environment through
                real-time monitoring and collaborative reporting of illegal mining activities.
              </p>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500">Protecting Ghana&apos;s future, together.</span>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-white mb-4">Quick Links</h4>
              <ul className="space-y-3">
                {[
                  { href: '/map', label: 'Live Map' },
                  { href: '/report', label: 'Report Incident' },
                  { href: '/water', label: 'Water Quality' },
                  { href: '/statistics', label: 'Statistics' },
                  { href: '/awareness', label: 'Learn More' },
                ].map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-gray-400 hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="font-semibold text-white mb-4">Resources</h4>
              <ul className="space-y-3">
                {[
                  { href: '/satellite', label: 'Satellite Imagery' },
                  { href: '/api', label: 'API Access' },
                  { href: '/partners', label: 'Partners' },
                  { href: '/contact', label: 'Contact Us' },
                ].map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-gray-400 hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} Galamsey Monitor. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
