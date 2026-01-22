'use client';

import { Suspense } from 'react';
import Navigation from '@/components/Navigation';
import OfflineReportForm from '@/components/OfflineReportForm';
import { Shield, Users, Clock } from 'lucide-react';

function ReportPageContent() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <Navigation />

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
            Report an Incident
          </h1>
          <p className="text-slate-600 mt-2 text-lg max-w-2xl">
            Help us track illegal mining activities. Your report can make a difference in
            protecting Ghana&apos;s environment and communities.
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 flex items-start gap-3">
            <div className="w-10 h-10 bg-ghana-green/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Shield className="h-5 w-5 text-ghana-green" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Anonymous Reporting</h3>
              <p className="text-slate-600 text-sm">Your identity is protected. Report safely.</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Works Offline</h3>
              <p className="text-slate-600 text-sm">Submit reports even without internet.</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 flex items-start gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Users className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Community Impact</h3>
              <p className="text-slate-600 text-sm">Join thousands protecting our lands.</p>
            </div>
          </div>
        </div>

        {/* Report Form */}
        <OfflineReportForm />

        {/* Help Section */}
        <div className="mt-8 bg-slate-800 rounded-2xl p-6 sm:p-8 text-white">
          <h2 className="text-xl font-semibold mb-4">Need Help?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-white/90 mb-2">What to Report</h3>
              <ul className="text-white/70 text-sm space-y-1">
                <li>&bull; Illegal mining operations (galamsey)</li>
                <li>&bull; Water pollution from mining</li>
                <li>&bull; Deforestation for mining purposes</li>
                <li>&bull; Land degradation and erosion</li>
                <li>&bull; Mining near protected areas</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-white/90 mb-2">Tips for Reporting</h3>
              <ul className="text-white/70 text-sm space-y-1">
                <li>&bull; Be as specific as possible about the location</li>
                <li>&bull; Include photos or videos if safe to do so</li>
                <li>&bull; Note the number of people and equipment</li>
                <li>&bull; Report from a safe distance</li>
                <li>&bull; Do not confront miners directly</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-white/60 text-sm">
              For emergencies or immediate threats, contact local authorities directly.
              <br />
              EPA Hotline: <span className="text-white">+233 30 266 4697</span> |
              Police: <span className="text-white">191</span>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ReportPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-ghana-green border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading report form...</p>
        </div>
      </div>
    }>
      <ReportPageContent />
    </Suspense>
  );
}
