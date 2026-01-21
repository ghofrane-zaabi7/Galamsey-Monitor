'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import { MapPin, Send, AlertCircle, CheckCircle } from 'lucide-react';
import { GHANA_REGIONS } from '@/types';

const incidentTypes = [
  { value: 'illegal_mining', label: 'Illegal Mining Operation' },
  { value: 'water_pollution', label: 'Water Pollution' },
  { value: 'deforestation', label: 'Deforestation/Forest Clearing' },
  { value: 'land_degradation', label: 'Land Degradation' },
];

const severityLevels = [
  { value: 'low', label: 'Low - Minor activity observed', color: 'bg-green-100 text-green-800' },
  { value: 'medium', label: 'Medium - Moderate damage', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'high', label: 'High - Significant damage', color: 'bg-orange-100 text-orange-800' },
  { value: 'critical', label: 'Critical - Severe/ongoing destruction', color: 'bg-red-100 text-red-800' },
];

export default function ReportPage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    latitude: '',
    longitude: '',
    region: '',
    district: '',
    reported_by: '',
    contact_phone: '',
    severity: 'medium',
    incident_type: 'illegal_mining',
  });

  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData({
          ...formData,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6),
        });
        setGettingLocation(false);
      },
      (err) => {
        setError('Unable to get location: ' + err.message);
        setGettingLocation(false);
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit report');
      }

      setSuccess(true);
      setFormData({
        title: '',
        description: '',
        latitude: '',
        longitude: '',
        region: '',
        district: '',
        reported_by: '',
        contact_phone: '',
        severity: 'medium',
        incident_type: 'illegal_mining',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="max-w-2xl mx-auto px-4 py-16">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Report Submitted Successfully!</h2>
            <p className="text-gray-600 mb-6">
              Thank you for helping protect Ghana&apos;s environment. Your report has been received
              and will be reviewed by our team.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setSuccess(false)}
                className="px-6 py-2 bg-ghana-green text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Submit Another Report
              </button>
              <a
                href="/"
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back to Dashboard
              </a>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Report an Incident</h1>
          <p className="text-gray-600 mt-2">
            Help us track illegal mining activities. Your report can make a difference in protecting
            our environment.
          </p>
        </div>

        {/* Anonymous Reporting Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5 mr-3" />
            <div>
              <h4 className="font-medium text-blue-900">Anonymous Reporting Available</h4>
              <p className="text-sm text-blue-700 mt-1">
                You can submit reports anonymously. Contact information is optional but helps us
                follow up if needed.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 space-y-6">
          {/* Incident Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type of Incident *
            </label>
            <div className="grid grid-cols-2 gap-3">
              {incidentTypes.map((type) => (
                <label
                  key={type.value}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    formData.incident_type === type.value
                      ? 'border-ghana-green bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="incident_type"
                    value={type.value}
                    checked={formData.incident_type === type.value}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <span className="text-sm">{type.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Brief Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="e.g., Illegal mining near River Pra"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ghana-green focus:border-transparent"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Detailed Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              placeholder="Describe what you observed, including any equipment, number of people, extent of damage, etc."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ghana-green focus:border-transparent"
            />
          </div>

          {/* Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-2">
                Latitude *
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  id="latitude"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                  required
                  step="any"
                  placeholder="e.g., 6.1234"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ghana-green focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-2">
                Longitude *
              </label>
              <input
                type="number"
                id="longitude"
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
                required
                step="any"
                placeholder="e.g., -1.5678"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ghana-green focus:border-transparent"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={getCurrentLocation}
            disabled={gettingLocation}
            className="flex items-center gap-2 text-ghana-green hover:text-green-700 text-sm font-medium"
          >
            <MapPin className="w-4 h-4" />
            {gettingLocation ? 'Getting location...' : 'Use my current location'}
          </button>

          {/* Region & District */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-2">
                Region *
              </label>
              <select
                id="region"
                name="region"
                value={formData.region}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ghana-green focus:border-transparent"
              >
                <option value="">Select region</option>
                {GHANA_REGIONS.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-2">
                District *
              </label>
              <input
                type="text"
                id="district"
                name="district"
                value={formData.district}
                onChange={handleChange}
                required
                placeholder="e.g., Amansie West"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ghana-green focus:border-transparent"
              />
            </div>
          </div>

          {/* Severity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Severity Level *
            </label>
            <div className="space-y-2">
              {severityLevels.map((level) => (
                <label
                  key={level.value}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    formData.severity === level.value
                      ? 'border-ghana-green bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="severity"
                    value={level.value}
                    checked={formData.severity === level.value}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <span className={`status-badge ${level.color} mr-3`}>
                    {level.value}
                  </span>
                  <span className="text-sm text-gray-700">{level.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Contact Info */}
          <div className="border-t pt-6">
            <h3 className="font-medium text-gray-900 mb-4">Contact Information (Optional)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="reported_by" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  id="reported_by"
                  name="reported_by"
                  value={formData.reported_by}
                  onChange={handleChange}
                  placeholder="Anonymous"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ghana-green focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="contact_phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="contact_phone"
                  name="contact_phone"
                  value={formData.contact_phone}
                  onChange={handleChange}
                  placeholder="+233..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ghana-green focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-ghana-green text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {loading ? (
              'Submitting...'
            ) : (
              <>
                <Send className="w-5 h-5" />
                Submit Report
              </>
            )}
          </button>
        </form>
      </main>
    </div>
  );
}
