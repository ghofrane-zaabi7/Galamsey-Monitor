'use client';

/**
 * Service Worker Registration Component
 * Handles registering the service worker and update prompts
 */

import { useEffect, useState } from 'react';
import { RefreshCw, X } from 'lucide-react';

export function ServiceWorkerRegistration() {
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    const registerServiceWorker = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });

        console.log('[SW] Service Worker registered:', registration.scope);

        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker available
              setWaitingWorker(newWorker);
              setShowUpdatePrompt(true);
            }
          });
        });

        // Check if there's already a waiting worker
        if (registration.waiting) {
          setWaitingWorker(registration.waiting);
          setShowUpdatePrompt(true);
        }
      } catch (error) {
        console.error('[SW] Registration failed:', error);
      }
    };

    // Register after page load
    if (document.readyState === 'complete') {
      registerServiceWorker();
    } else {
      window.addEventListener('load', registerServiceWorker);
      return () => window.removeEventListener('load', registerServiceWorker);
    }
  }, []);

  const handleUpdate = () => {
    if (waitingWorker) {
      // Tell the waiting worker to skip waiting
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });

      // Reload page when the new worker takes control
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
    }
    setShowUpdatePrompt(false);
  };

  const handleDismiss = () => {
    setShowUpdatePrompt(false);
  };

  if (!showUpdatePrompt) return null;

  return (
    <div className="fixed top-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-50 animate-fade-in-up">
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <RefreshCw className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-900">Update Available</h3>
              <p className="text-slate-600 text-sm mt-1">
                A new version of Galamsey Monitor is available. Refresh to get the latest features.
              </p>
            </div>
            <button
              onClick={handleDismiss}
              className="text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0"
              aria-label="Dismiss"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={handleUpdate}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Update Now
            </button>
            <button
              onClick={handleDismiss}
              className="px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors font-medium"
            >
              Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
