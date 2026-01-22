'use client';

/**
 * PWA Install Prompt Component
 * Shows install banner and handles PWA installation
 */

import { useState, useEffect, useCallback } from 'react';
import { X, Download, Smartphone, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { getPendingIncidentsCount } from '@/lib/offline-storage';
import { triggerSync, isSyncInProgress, SYNC_EVENT } from '@/lib/sync-manager';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showOfflineIndicator, setShowOfflineIndicator] = useState(false);

  // Check if already installed
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if running as PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

    setIsInstalled(isStandalone);

    // Listen for install prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Show banner after delay if not dismissed before
      const dismissed = localStorage.getItem('pwa-banner-dismissed');
      if (!dismissed) {
        setTimeout(() => setShowBanner(true), 3000);
      }
    };

    // Listen for app installed
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowBanner(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Monitor online status
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineIndicator(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineIndicator(true);
    };

    setIsOnline(navigator.onLine);
    setShowOfflineIndicator(!navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Monitor pending incidents
  useEffect(() => {
    const updatePendingCount = async () => {
      try {
        const count = await getPendingIncidentsCount();
        setPendingCount(count);
      } catch (error) {
        console.error('Failed to get pending count:', error);
      }
    };

    updatePendingCount();
    const interval = setInterval(updatePendingCount, 10000);

    return () => clearInterval(interval);
  }, []);

  // Listen for sync events
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleSyncEvent = (e: CustomEvent) => {
      const { type, status } = e.detail;
      setIsSyncing(status === 'syncing');

      if (type === 'complete') {
        // Refresh pending count
        getPendingIncidentsCount().then(setPendingCount);
      }
    };

    window.addEventListener(SYNC_EVENT, handleSyncEvent as EventListener);
    return () => window.removeEventListener(SYNC_EVENT, handleSyncEvent as EventListener);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setIsInstalled(true);
    }

    setDeferredPrompt(null);
    setShowBanner(false);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('pwa-banner-dismissed', 'true');
  };

  const handleSync = useCallback(async () => {
    if (isSyncInProgress() || !isOnline) return;

    setIsSyncing(true);
    try {
      await triggerSync();
    } finally {
      setIsSyncing(false);
      const count = await getPendingIncidentsCount();
      setPendingCount(count);
    }
  }, [isOnline]);

  return (
    <>
      {/* Offline Indicator */}
      {showOfflineIndicator && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-amber-950 py-2 px-4 text-center text-sm font-medium flex items-center justify-center gap-2 animate-fade-in-up">
          <WifiOff className="h-4 w-4" />
          <span>You&apos;re offline. Reports will be saved and synced when you&apos;re back online.</span>
        </div>
      )}

      {/* Pending Sync Indicator */}
      {pendingCount > 0 && isOnline && (
        <div className="fixed bottom-20 right-4 z-40">
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center gap-2 bg-ghana-green text-white px-4 py-2 rounded-full shadow-lg hover:bg-ghana-green/90 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span className="text-sm font-medium">
              {isSyncing ? 'Syncing...' : `Sync ${pendingCount} report${pendingCount > 1 ? 's' : ''}`}
            </span>
          </button>
        </div>
      )}

      {/* Install Banner */}
      {showBanner && !isInstalled && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-fade-in-up">
          <div className="max-w-lg mx-auto bg-gradient-to-r from-ghana-green to-forest-700 rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-4 sm:p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Smartphone className="h-6 w-6 text-white" />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold text-lg">
                    Install Galamsey Monitor
                  </h3>
                  <p className="text-white/80 text-sm mt-1">
                    Install the app for quick access, offline reporting, and instant notifications.
                  </p>

                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <span className="inline-flex items-center gap-1 text-xs text-white/70 bg-white/10 px-2 py-1 rounded-full">
                      <Wifi className="h-3 w-3" />
                      Works offline
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-white/70 bg-white/10 px-2 py-1 rounded-full">
                      <Download className="h-3 w-3" />
                      Fast &amp; lightweight
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleDismiss}
                  className="flex-shrink-0 text-white/60 hover:text-white transition-colors"
                  aria-label="Dismiss"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleInstall}
                  className="flex-1 bg-white text-ghana-green font-semibold py-3 px-4 rounded-xl hover:bg-white/90 transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Install App
                </button>
                <button
                  onClick={handleDismiss}
                  className="px-4 py-3 text-white/80 hover:text-white transition-colors font-medium"
                >
                  Not now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Online status hook for other components
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

// Pending reports hook
export function usePendingReports() {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const updateCount = async () => {
      try {
        const pendingCount = await getPendingIncidentsCount();
        setCount(pendingCount);
      } catch (error) {
        console.error('Failed to get pending count:', error);
      } finally {
        setLoading(false);
      }
    };

    updateCount();

    // Listen for sync events
    const handleSyncEvent = () => {
      updateCount();
    };

    window.addEventListener(SYNC_EVENT, handleSyncEvent);
    return () => window.removeEventListener(SYNC_EVENT, handleSyncEvent);
  }, []);

  return { count, loading };
}
