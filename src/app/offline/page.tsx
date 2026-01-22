'use client';

/**
 * Offline Page - Shown when user is offline and page isn't cached
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { WifiOff, RefreshCw, MapPin, FileText, Home } from 'lucide-react';
import { getPendingIncidentsCount, getAllDrafts } from '@/lib/offline-storage';

export default function OfflinePage() {
  const [pendingCount, setPendingCount] = useState(0);
  const [draftsCount, setDraftsCount] = useState(0);
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    // Check online status
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      // Redirect to home when back online
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
    };

    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    // Load offline data counts
    const loadCounts = async () => {
      try {
        const pending = await getPendingIncidentsCount();
        const drafts = await getAllDrafts();
        setPendingCount(pending);
        setDraftsCount(drafts.length);
      } catch (error) {
        console.error('Failed to load offline counts:', error);
      }
    };

    loadCounts();
  }, []);

  const handleRetry = () => {
    window.location.reload();
  };

  if (isOnline) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-ghana-green to-forest-800 flex items-center justify-center p-4">
        <div className="text-center text-white">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <RefreshCw className="h-8 w-8 animate-spin" />
          </div>
          <h2 className="text-xl font-semibold">Back Online!</h2>
          <p className="text-white/80 mt-2">Redirecting you now...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      {/* Header */}
      <div className="bg-slate-800/50 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-ghana-green/20 rounded-xl flex items-center justify-center">
              <MapPin className="h-5 w-5 text-ghana-green" />
            </div>
            <div>
              <h1 className="text-white font-semibold">Galamsey Monitor</h1>
              <p className="text-slate-400 text-sm">Environmental Protection Platform</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-lg mx-auto px-4 py-12">
        <div className="text-center">
          {/* Offline Icon */}
          <div className="w-24 h-24 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <WifiOff className="h-12 w-12 text-amber-500" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            You&apos;re Offline
          </h1>
          <p className="text-slate-400 text-lg mb-8">
            Don&apos;t worry, you can still report incidents. Your reports will be saved and submitted when you&apos;re back online.
          </p>

          {/* Retry Button */}
          <button
            onClick={handleRetry}
            className="inline-flex items-center gap-2 bg-ghana-green text-white px-6 py-3 rounded-xl font-medium hover:bg-ghana-green/90 transition-colors mb-8"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
        </div>

        {/* Offline Status Cards */}
        <div className="grid gap-4 mb-8">
          {pendingCount > 0 && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-amber-500 font-medium">
                    {pendingCount} Pending Report{pendingCount > 1 ? 's' : ''}
                  </p>
                  <p className="text-slate-400 text-sm">
                    Will sync automatically when online
                  </p>
                </div>
              </div>
            </div>
          )}

          {draftsCount > 0 && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-blue-500 font-medium">
                    {draftsCount} Draft{draftsCount > 1 ? 's' : ''} Saved
                  </p>
                  <p className="text-slate-400 text-sm">
                    Continue editing when ready
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Available Offline */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h2 className="text-white font-semibold mb-4">Available Offline</h2>

          <div className="space-y-3">
            <Link
              href="/report"
              className="flex items-center gap-3 p-3 bg-ghana-green/10 rounded-lg hover:bg-ghana-green/20 transition-colors group"
            >
              <div className="w-10 h-10 bg-ghana-green/20 rounded-lg flex items-center justify-center group-hover:bg-ghana-green/30 transition-colors">
                <FileText className="h-5 w-5 text-ghana-green" />
              </div>
              <div>
                <p className="text-white font-medium">Report an Incident</p>
                <p className="text-slate-400 text-sm">Submit reports offline</p>
              </div>
            </Link>

            <Link
              href="/"
              className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors group"
            >
              <div className="w-10 h-10 bg-slate-600 rounded-lg flex items-center justify-center group-hover:bg-slate-500 transition-colors">
                <Home className="h-5 w-5 text-slate-300" />
              </div>
              <div>
                <p className="text-white font-medium">Home</p>
                <p className="text-slate-400 text-sm">View cached content</p>
              </div>
            </Link>

            <Link
              href="/map"
              className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors group"
            >
              <div className="w-10 h-10 bg-slate-600 rounded-lg flex items-center justify-center group-hover:bg-slate-500 transition-colors">
                <MapPin className="h-5 w-5 text-slate-300" />
              </div>
              <div>
                <p className="text-white font-medium">Map View</p>
                <p className="text-slate-400 text-sm">View cached map data</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Tips */}
        <div className="mt-8 text-center">
          <p className="text-slate-500 text-sm">
            Tip: Install the app for better offline support.
            <br />
            Your reports are automatically saved as you type.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-800/80 backdrop-blur border-t border-slate-700 p-4">
        <div className="max-w-lg mx-auto flex items-center justify-center gap-2 text-slate-400 text-sm">
          <WifiOff className="h-4 w-4" />
          <span>Waiting for connection...</span>
        </div>
      </div>
    </div>
  );
}
