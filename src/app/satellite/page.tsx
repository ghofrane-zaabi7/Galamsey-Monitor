'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import { Satellite, ExternalLink, Info, Calendar, MapPin } from 'lucide-react';

const satelliteProviders = [
  {
    name: 'Sentinel Hub',
    description: 'Free access to Sentinel-2 satellite imagery with 10m resolution. Ideal for detecting land use changes.',
    url: 'https://www.sentinel-hub.com/',
    features: ['10m resolution', 'Free tier available', '5-day revisit time', 'Multi-spectral imagery'],
  },
  {
    name: 'Google Earth Engine',
    description: 'Powerful platform for analyzing satellite imagery over time. Requires Google account.',
    url: 'https://earthengine.google.com/',
    features: ['Historical imagery', 'Change detection', 'Free for research', 'Processing tools'],
  },
  {
    name: 'Planet Labs',
    description: 'Daily satellite imagery with 3m resolution. Best for real-time monitoring.',
    url: 'https://www.planet.com/',
    features: ['3m resolution', 'Daily imagery', 'API access', 'Education program'],
  },
  {
    name: 'Copernicus Open Access Hub',
    description: 'EU-funded free satellite data including Sentinel-1 (radar) and Sentinel-2 (optical).',
    url: 'https://scihub.copernicus.eu/',
    features: ['Free access', 'Radar imagery', 'Scientific use', 'Historical archive'],
  },
];

const knownHotspots = [
  { name: 'Amansie West, Ashanti', lat: 6.125, lon: -1.852, severity: 'critical' },
  { name: 'Prestea-Huni Valley, Western', lat: 5.432, lon: -2.143, severity: 'critical' },
  { name: 'Obuasi Municipal, Ashanti', lat: 6.188, lon: -1.679, severity: 'high' },
  { name: 'Tarkwa-Nsuaem, Western', lat: 5.301, lon: -1.988, severity: 'high' },
  { name: 'Birim North, Eastern', lat: 6.099, lon: -0.765, severity: 'high' },
  { name: 'Upper Denkyira East, Central', lat: 5.954, lon: -1.823, severity: 'medium' },
];

export default function SatellitePage() {
  const [selectedHotspot, setSelectedHotspot] = useState<typeof knownHotspots[0] | null>(null);

  const openInSentinel = (lat: number, lon: number) => {
    // Sentinel Hub EO Browser URL
    const url = `https://apps.sentinel-hub.com/eo-browser/?zoom=14&lat=${lat}&lng=${lon}&themeId=DEFAULT-THEME&visualizationUrl=https://services.sentinel-hub.com/ogc/wms/bd86bcc0-f318-402b-a145-015f85b9427e&datasetId=S2L2A&fromTime=2024-01-01T00:00:00.000Z&toTime=${new Date().toISOString().split('T')[0]}T23:59:59.999Z&layerId=1_TRUE_COLOR`;
    window.open(url, '_blank');
  };

  const openInGoogleEarth = (lat: number, lon: number) => {
    const url = `https://earth.google.com/web/@${lat},${lon},500a,5000d,35y,0h,0t,0r`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Satellite className="w-8 h-8 text-ghana-green" />
            Satellite Imagery Analysis
          </h1>
          <p className="text-gray-600 mt-2">
            Use satellite imagery to detect and monitor galamsey activities. Compare historical
            images to identify land use changes and environmental damage.
          </p>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-500 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900">How Satellite Detection Works</h3>
              <p className="text-blue-700 text-sm mt-1">
                Galamsey sites are identifiable in satellite imagery by their distinctive characteristics:
                exposed brown/orange soil, water-filled pits, cleared vegetation, and turbid water in
                nearby rivers. Multi-temporal analysis can reveal the progression of mining activity.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Known Hotspots */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Known Galamsey Hotspots</h2>
              <p className="text-gray-600 text-sm mb-4">
                Click on a location to view satellite imagery from multiple providers.
              </p>

              <div className="space-y-3">
                {knownHotspots.map((hotspot) => (
                  <div
                    key={hotspot.name}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedHotspot?.name === hotspot.name
                        ? 'border-ghana-green bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedHotspot(hotspot)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <MapPin className={`w-5 h-5 ${
                          hotspot.severity === 'critical' ? 'text-red-500' :
                          hotspot.severity === 'high' ? 'text-orange-500' :
                          'text-yellow-500'
                        }`} />
                        <div>
                          <h3 className="font-medium text-gray-900">{hotspot.name}</h3>
                          <p className="text-xs text-gray-500">
                            {hotspot.lat.toFixed(4)}, {hotspot.lon.toFixed(4)}
                          </p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        hotspot.severity === 'critical' ? 'bg-red-100 text-red-800' :
                        hotspot.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {hotspot.severity}
                      </span>
                    </div>

                    {selectedHotspot?.name === hotspot.name && (
                      <div className="mt-4 pt-4 border-t flex flex-wrap gap-2">
                        <button
                          onClick={() => openInSentinel(hotspot.lat, hotspot.lon)}
                          className="flex items-center gap-2 px-3 py-2 bg-ghana-green text-white rounded-lg text-sm hover:bg-green-700 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                          View in Sentinel Hub
                        </button>
                        <button
                          onClick={() => openInGoogleEarth(hotspot.lat, hotspot.lon)}
                          className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                          View in Google Earth
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Detection Guide */}
            <div className="bg-white rounded-xl shadow-md p-6 mt-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Visual Detection Guide</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Signs of Active Mining</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Large patches of exposed brown/orange soil</li>
                    <li>• Irregular water-filled pits</li>
                    <li>• Recently cleared vegetation</li>
                    <li>• Access roads to remote areas</li>
                    <li>• Equipment shadows in high-res imagery</li>
                  </ul>
                </div>
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Water Pollution Indicators</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Rivers turning brown/orange color</li>
                    <li>• Sediment plumes in water bodies</li>
                    <li>• Changes in river course</li>
                    <li>• Tailings near riverbanks</li>
                    <li>• Loss of vegetation along rivers</li>
                  </ul>
                </div>
              </div>

              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Best Practices for Analysis
                </h4>
                <ul className="text-sm text-gray-600 mt-2 space-y-1">
                  <li>• Compare images from different dates to detect changes</li>
                  <li>• Use dry season imagery for clearer views (November - March)</li>
                  <li>• Check cloud cover percentage before analysis</li>
                  <li>• Use NDVI (vegetation index) to detect forest loss</li>
                  <li>• Document coordinates of suspicious sites for reporting</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Satellite Providers */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Satellite Data Providers</h2>

            {satelliteProviders.map((provider) => (
              <div key={provider.name} className="bg-white rounded-xl shadow-md p-4">
                <h3 className="font-bold text-gray-900">{provider.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{provider.description}</p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {provider.features.map((feature) => (
                    <span
                      key={feature}
                      className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
                <a
                  href={provider.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1 text-ghana-green text-sm hover:underline"
                >
                  Visit {provider.name}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ))}

            {/* API Integration Note */}
            <div className="bg-ghana-green/10 border border-ghana-green/20 rounded-xl p-4">
              <h3 className="font-medium text-ghana-green">Future Integration</h3>
              <p className="text-sm text-gray-600 mt-2">
                This platform can be enhanced with direct satellite API integration for automated
                change detection and real-time monitoring. Contact us if you have access to
                satellite data APIs and want to contribute.
              </p>
            </div>
          </div>
        </div>

        {/* Custom Location Input */}
        <div className="mt-8 bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Check Custom Location</h2>
          <p className="text-gray-600 text-sm mb-4">
            Enter coordinates to view satellite imagery of any location in Ghana.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const lat = parseFloat(formData.get('lat') as string);
              const lon = parseFloat(formData.get('lon') as string);
              if (!isNaN(lat) && !isNaN(lon)) {
                openInSentinel(lat, lon);
              }
            }}
            className="flex flex-wrap gap-4 items-end"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Latitude
              </label>
              <input
                type="number"
                name="lat"
                step="any"
                placeholder="e.g., 6.1234"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ghana-green focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Longitude
              </label>
              <input
                type="number"
                name="lon"
                step="any"
                placeholder="e.g., -1.5678"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ghana-green focus:border-transparent"
                required
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-ghana-green text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              View Satellite Imagery
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
