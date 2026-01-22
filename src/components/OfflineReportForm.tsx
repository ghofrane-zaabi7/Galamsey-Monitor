'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  MapPin,
  Mic,
  MicOff,
  Camera,
  Upload,
  X,
  Loader2,
  CheckCircle,
  AlertTriangle,
  WifiOff,
  Globe,
  Navigation,
  ChevronDown,
  Info,
  Trash2,
  Volume2,
} from 'lucide-react';
import { useVoiceInput, SUPPORTED_LANGUAGES, type LanguageCode } from '@/hooks/useVoiceInput';
import {
  savePendingIncident,
  saveDraft,
  getDraft,
  deleteDraft,
  fileToStoredFile,
  getPendingIncidentsCount,
  type IncidentFormData,
  type StoredFile,
} from '@/lib/offline-storage';
import { isOnline, triggerSync } from '@/lib/sync-manager';
import { GHANA_REGIONS } from '@/types';

// District data (simplified - would be fetched from API in production)
const DISTRICTS_BY_REGION: Record<string, string[]> = {
  'Ashanti': ['Kumasi Metro', 'Obuasi Municipal', 'Amansie Central', 'Amansie West', 'Adansi North', 'Adansi South'],
  'Western': ['Sekondi-Takoradi Metro', 'Tarkwa-Nsuaem', 'Prestea-Huni Valley', 'Wassa East', 'Wassa Amenfi'],
  'Eastern': ['Birim North', 'Birim Central', 'Birim South', 'Denkyembour', 'Atiwa East', 'Atiwa West'],
  'Central': ['Cape Coast Metro', 'Upper Denkyira East', 'Upper Denkyira West', 'Twifo Atti Morkwa'],
};

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

interface FormState extends Partial<IncidentFormData> {
  evidenceFiles: File[];
}

export default function OfflineReportForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState<FormState>({
    title: '',
    description: '',
    latitude: 0,
    longitude: 0,
    region: '',
    district: '',
    severity: 'medium',
    incident_type: 'illegal_mining',
    reported_by: '',
    contact_phone: '',
    evidenceFiles: [],
  });

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'offline-queued' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');
  const [online, setOnline] = useState(true);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [showVoicePanel, setShowVoicePanel] = useState(false);
  const [activeVoiceField, setActiveVoiceField] = useState<'title' | 'description' | null>(null);
  const [draftId, setDraftId] = useState<string | null>(null);

  // Voice input hook
  const {
    isListening,
    transcript,
    interimTranscript,
    error: voiceError,
    isSupported: voiceSupported,
    confidence,
    language,
    startListening,
    stopListening,
    resetTranscript,
    setLanguage,
  } = useVoiceInput({
    continuous: true,
    onResult: (text) => {
      if (activeVoiceField) {
        setFormData((prev) => ({
          ...prev,
          [activeVoiceField]: prev[activeVoiceField] ? `${prev[activeVoiceField]} ${text}` : text,
        }));
      }
    },
  });

  // Check online status
  useEffect(() => {
    setOnline(isOnline());

    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load pending count
  useEffect(() => {
    getPendingIncidentsCount().then(setPendingCount);
  }, []);

  // Auto-save draft
  useEffect(() => {
    const saveDraftDebounced = setTimeout(async () => {
      if (formData.title || formData.description) {
        const storedFiles: StoredFile[] = [];
        for (const file of formData.evidenceFiles) {
          storedFiles.push(await fileToStoredFile(file));
        }
        const id = await saveDraft(formData, storedFiles, draftId || undefined);
        if (!draftId) setDraftId(id);
      }
    }, 2000);

    return () => clearTimeout(saveDraftDebounced);
  }, [formData, draftId]);

  // Get current location
  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationStatus('error');
      return;
    }

    setLocationStatus('loading');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const locData: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        };
        setLocationData(locData);
        setFormData((prev) => ({
          ...prev,
          latitude: locData.latitude,
          longitude: locData.longitude,
          locationAccuracy: locData.accuracy,
        }));
        setLocationStatus('success');
      },
      (error) => {
        console.error('Geolocation error:', error);
        setLocationStatus('error');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  }, []);

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData((prev) => ({
      ...prev,
      evidenceFiles: [...prev.evidenceFiles, ...files].slice(0, 5), // Max 5 files
    }));
  };

  // Remove file
  const removeFile = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      evidenceFiles: prev.evidenceFiles.filter((_, i) => i !== index),
    }));
  };

  // Start voice input for field
  const startVoiceInput = (field: 'title' | 'description') => {
    setActiveVoiceField(field);
    setShowVoicePanel(true);
    resetTranscript();
    startListening();
  };

  // Stop voice input
  const stopVoiceInput = () => {
    stopListening();
    setShowVoicePanel(false);
    setActiveVoiceField(null);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Validate required fields
      if (!formData.title || !formData.description || !formData.region || !formData.reported_by) {
        throw new Error('Please fill in all required fields');
      }

      if (!formData.latitude || !formData.longitude) {
        throw new Error('Please capture your location');
      }

      // Prepare incident data
      const incidentData: IncidentFormData = {
        title: formData.title!,
        description: formData.description!,
        latitude: formData.latitude!,
        longitude: formData.longitude!,
        locationAccuracy: formData.locationAccuracy,
        region: formData.region!,
        district: formData.district || '',
        severity: formData.severity || 'medium',
        incident_type: formData.incident_type || 'illegal_mining',
        reported_by: formData.reported_by!,
        contact_phone: formData.contact_phone,
        voiceTranscript: transcript || undefined,
        language: language,
      };

      // Convert files to stored format
      const storedFiles: StoredFile[] = [];
      for (const file of formData.evidenceFiles) {
        storedFiles.push(await fileToStoredFile(file));
      }

      if (online) {
        // Try online submission
        const formDataToSend = new FormData();
        Object.entries(incidentData).forEach(([key, value]) => {
          if (value !== undefined) formDataToSend.append(key, String(value));
        });
        formData.evidenceFiles.forEach((file) => {
          formDataToSend.append('evidence', file);
        });

        const response = await fetch('/api/incidents', {
          method: 'POST',
          body: formDataToSend,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to submit report');
        }

        setSubmitStatus('success');
        setSubmitMessage('Report submitted successfully!');

        // Delete draft
        if (draftId) await deleteDraft(draftId);

        // Redirect after delay
        setTimeout(() => router.push('/'), 2000);
      } else {
        // Save for offline sync
        await savePendingIncident(incidentData, storedFiles);
        setPendingCount((prev) => prev + 1);

        setSubmitStatus('offline-queued');
        setSubmitMessage('You\'re offline. Report saved and will be submitted when you\'re back online.');

        // Delete draft
        if (draftId) await deleteDraft(draftId);
      }
    } catch (error) {
      setSubmitStatus('error');
      setSubmitMessage(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Available districts based on selected region
  const availableDistricts = formData.region ? DISTRICTS_BY_REGION[formData.region] || [] : [];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Offline indicator */}
      {!online && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-2xl flex items-center gap-3">
          <WifiOff className="w-5 h-5 text-yellow-600" />
          <div>
            <p className="font-medium text-yellow-800">You&apos;re offline</p>
            <p className="text-sm text-yellow-600">Your report will be saved and submitted when you&apos;re back online</p>
          </div>
        </div>
      )}

      {/* Pending reports indicator */}
      {pendingCount > 0 && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Upload className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-blue-800">{pendingCount} pending report{pendingCount > 1 ? 's' : ''}</p>
              <p className="text-sm text-blue-600">Waiting to sync</p>
            </div>
          </div>
          {online && (
            <button
              onClick={() => triggerSync()}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Sync Now
            </button>
          )}
        </div>
      )}

      {/* Success/Error status */}
      {submitStatus !== 'idle' && (
        <div
          className={`mb-6 p-4 rounded-2xl flex items-center gap-3 ${
            submitStatus === 'success'
              ? 'bg-green-50 border border-green-200'
              : submitStatus === 'offline-queued'
              ? 'bg-blue-50 border border-blue-200'
              : 'bg-red-50 border border-red-200'
          }`}
        >
          {submitStatus === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : submitStatus === 'offline-queued' ? (
            <WifiOff className="w-5 h-5 text-blue-600" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-red-600" />
          )}
          <p
            className={`font-medium ${
              submitStatus === 'success'
                ? 'text-green-800'
                : submitStatus === 'offline-queued'
                ? 'text-blue-800'
                : 'text-red-800'
            }`}
          >
            {submitMessage}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Location Section */}
        <div className="bg-white rounded-2xl shadow-card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-ghana-green" />
            Location
          </h3>

          <div className="space-y-4">
            <button
              type="button"
              onClick={getCurrentLocation}
              disabled={locationStatus === 'loading'}
              className={`w-full p-4 rounded-xl border-2 border-dashed transition-all flex items-center justify-center gap-3 ${
                locationStatus === 'success'
                  ? 'border-green-300 bg-green-50'
                  : locationStatus === 'error'
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-300 hover:border-ghana-green hover:bg-ghana-green/5'
              }`}
            >
              {locationStatus === 'loading' ? (
                <Loader2 className="w-5 h-5 animate-spin text-ghana-green" />
              ) : locationStatus === 'success' ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <Navigation className="w-5 h-5 text-ghana-green" />
              )}
              <span className="font-medium">
                {locationStatus === 'loading'
                  ? 'Getting location...'
                  : locationStatus === 'success'
                  ? 'Location captured'
                  : locationStatus === 'error'
                  ? 'Failed - tap to retry'
                  : 'Capture Current Location'}
              </span>
            </button>

            {locationData && (
              <div className="p-3 bg-gray-50 rounded-lg text-sm">
                <p className="text-gray-600">
                  📍 {locationData.latitude.toFixed(6)}, {locationData.longitude.toFixed(6)}
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  Accuracy: ±{Math.round(locationData.accuracy)}m
                </p>
              </div>
            )}

            {/* Region & District */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Region *</label>
                <div className="relative">
                  <select
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value, district: '' })}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl appearance-none focus:ring-2 focus:ring-ghana-green/20 focus:border-ghana-green"
                    required
                  >
                    <option value="">Select region</option>
                    {GHANA_REGIONS.map((region) => (
                      <option key={region} value={region}>
                        {region}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                <div className="relative">
                  <select
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl appearance-none focus:ring-2 focus:ring-ghana-green/20 focus:border-ghana-green"
                    disabled={!formData.region}
                  >
                    <option value="">Select district</option>
                    {availableDistricts.map((district) => (
                      <option key={district} value={district}>
                        {district}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Incident Details */}
        <div className="bg-white rounded-2xl shadow-card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-ghana-red" />
            Incident Details
          </h3>

          <div className="space-y-4">
            {/* Title with voice input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Brief title of the incident"
                  className="w-full p-3 pr-12 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-ghana-green/20 focus:border-ghana-green"
                  required
                />
                {voiceSupported && (
                  <button
                    type="button"
                    onClick={() => startVoiceInput('title')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-ghana-green hover:bg-ghana-green/10 rounded-lg transition-colors"
                  >
                    <Mic className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Description with voice input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <div className="relative">
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe what you observed in detail..."
                  rows={4}
                  className="w-full p-3 pr-12 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-ghana-green/20 focus:border-ghana-green resize-none"
                  required
                />
                {voiceSupported && (
                  <button
                    type="button"
                    onClick={() => startVoiceInput('description')}
                    className="absolute right-3 top-3 p-1.5 text-gray-400 hover:text-ghana-green hover:bg-ghana-green/10 rounded-lg transition-colors"
                  >
                    <Mic className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Type and Severity */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                <div className="relative">
                  <select
                    value={formData.incident_type}
                    onChange={(e) => setFormData({ ...formData, incident_type: e.target.value as IncidentFormData['incident_type'] })}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl appearance-none focus:ring-2 focus:ring-ghana-green/20 focus:border-ghana-green"
                  >
                    <option value="illegal_mining">Illegal Mining</option>
                    <option value="water_pollution">Water Pollution</option>
                    <option value="deforestation">Deforestation</option>
                    <option value="land_degradation">Land Degradation</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Severity *</label>
                <div className="relative">
                  <select
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value as IncidentFormData['severity'] })}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl appearance-none focus:ring-2 focus:ring-ghana-green/20 focus:border-ghana-green"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Evidence Section */}
        <div className="bg-white rounded-2xl shadow-card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Camera className="w-5 h-5 text-blue-500" />
            Evidence (Optional)
          </h3>

          <div className="space-y-4">
            {/* Upload buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="flex-1 p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-ghana-green hover:bg-ghana-green/5 transition-all flex items-center justify-center gap-2"
              >
                <Camera className="w-5 h-5 text-gray-500" />
                <span className="font-medium text-gray-700">Take Photo</span>
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-ghana-green hover:bg-ghana-green/5 transition-all flex items-center justify-center gap-2"
              >
                <Upload className="w-5 h-5 text-gray-500" />
                <span className="font-medium text-gray-700">Upload</span>
              </button>
            </div>

            {/* Hidden file inputs */}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileUpload}
              className="hidden"
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />

            {/* File previews */}
            {formData.evidenceFiles.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {formData.evidenceFiles.map((file, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                    {file.type.startsWith('image/') ? (
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Evidence ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-xs text-gray-500">{file.name}</span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <p className="text-xs text-gray-400 flex items-center gap-1">
              <Info className="w-3 h-3" />
              Max 5 files. Photos will include GPS metadata for verification.
            </p>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-2xl shadow-card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Name *</label>
              <input
                type="text"
                value={formData.reported_by}
                onChange={(e) => setFormData({ ...formData, reported_by: e.target.value })}
                placeholder="Enter your name (or 'Anonymous')"
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-ghana-green/20 focus:border-ghana-green"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number (Optional)</label>
              <input
                type="tel"
                value={formData.contact_phone}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                placeholder="For follow-up questions"
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-ghana-green/20 focus:border-ghana-green"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 bg-gradient-to-r from-ghana-green to-forest-700 text-white font-semibold rounded-xl hover:shadow-glow-green transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Submitting...
            </>
          ) : !online ? (
            <>
              <WifiOff className="w-5 h-5" />
              Save for Later
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5" />
              Submit Report
            </>
          )}
        </button>
      </form>

      {/* Voice Input Panel */}
      {showVoicePanel && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">
                Voice Input: {activeVoiceField === 'title' ? 'Title' : 'Description'}
              </h3>
              <button
                onClick={stopVoiceInput}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Language selector */}
            <div className="flex gap-2 mb-6">
              {Object.entries(SUPPORTED_LANGUAGES).map(([code, lang]) => (
                <button
                  key={code}
                  onClick={() => setLanguage(code as LanguageCode)}
                  className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-colors ${
                    language === code
                      ? 'bg-ghana-green text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Globe className="w-4 h-4 inline mr-2" />
                  {lang.nativeName}
                </button>
              ))}
            </div>

            {/* Transcript display */}
            <div className="bg-gray-50 rounded-xl p-4 min-h-[120px] mb-6">
              <p className="text-gray-800">{transcript}</p>
              {interimTranscript && (
                <p className="text-gray-400 italic">{interimTranscript}</p>
              )}
              {!transcript && !interimTranscript && !isListening && (
                <p className="text-gray-400">Tap the microphone to start speaking...</p>
              )}
            </div>

            {/* Error display */}
            {voiceError && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-xl text-sm">
                {voiceError}
              </div>
            )}

            {/* Microphone button */}
            <div className="flex justify-center mb-4">
              <button
                onClick={isListening ? stopListening : startListening}
                className={`p-6 rounded-full transition-all ${
                  isListening
                    ? 'bg-ghana-red text-white animate-pulse'
                    : 'bg-ghana-green text-white hover:bg-ghana-green/90'
                }`}
              >
                {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
              </button>
            </div>

            <p className="text-center text-sm text-gray-500">
              {isListening ? 'Listening... Tap to stop' : 'Tap microphone to speak'}
            </p>

            {/* Confidence indicator */}
            {confidence > 0 && (
              <p className="text-center text-xs text-gray-400 mt-2">
                Confidence: {Math.round(confidence * 100)}%
              </p>
            )}

            {/* Done button */}
            <button
              onClick={stopVoiceInput}
              className="w-full mt-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
