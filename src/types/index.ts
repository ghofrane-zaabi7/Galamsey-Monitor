// Incident Types
export interface Incident {
  id: number;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  region: string;
  district: string;
  reported_by: string;
  contact_phone?: string;
  status: 'active' | 'investigating' | 'resolved';
  severity: 'low' | 'medium' | 'high' | 'critical';
  incident_type: 'illegal_mining' | 'water_pollution' | 'deforestation' | 'land_degradation';
  evidence_urls?: string;
  created_at: string;
  updated_at: string;
}

export interface IncidentInput {
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  region: string;
  district: string;
  reported_by: string;
  contact_phone?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  incident_type: 'illegal_mining' | 'water_pollution' | 'deforestation' | 'land_degradation';
  evidence_urls?: string;
}

// Water Quality Types
export interface WaterQualityReading {
  id: number;
  water_body_name: string;
  latitude: number;
  longitude: number;
  region: string;
  ph_level?: number;
  turbidity_ntu?: number;
  mercury_level_ppb?: number;
  arsenic_level_ppb?: number;
  lead_level_ppb?: number;
  dissolved_oxygen_mgl?: number;
  quality_status: 'safe' | 'moderate' | 'polluted' | 'hazardous';
  notes?: string;
  measured_by: string;
  measured_at: string;
  created_at: string;
}

export interface WaterQualityInput {
  water_body_name: string;
  latitude: number;
  longitude: number;
  region: string;
  ph_level?: number;
  turbidity_ntu?: number;
  mercury_level_ppb?: number;
  arsenic_level_ppb?: number;
  lead_level_ppb?: number;
  dissolved_oxygen_mgl?: number;
  quality_status: 'safe' | 'moderate' | 'polluted' | 'hazardous';
  notes?: string;
  measured_by: string;
}

// Mining Site Types
export interface MiningSite {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  region: string;
  district: string;
  estimated_area_hectares?: number;
  first_detected: string;
  last_activity_detected?: string;
  status: 'active' | 'inactive' | 'remediated';
  satellite_image_url?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface MiningSiteInput {
  name: string;
  latitude: number;
  longitude: number;
  region: string;
  district: string;
  estimated_area_hectares?: number;
  status: 'active' | 'inactive' | 'remediated';
  satellite_image_url?: string;
  notes?: string;
}

// Statistics Types
export interface DashboardStats {
  totalIncidents: number;
  activeIncidents: number;
  affectedWaterBodies: number;
  pollutedWaterBodies: number;
  totalMiningSites: number;
  activeMiningSites: number;
  incidentsByRegion: { region: string; count: number }[];
  incidentsByType: { type: string; count: number }[];
  waterQualityTrend: { date: string; safe: number; polluted: number }[];
  recentIncidents: Incident[];
}

// Ghana Regions
export const GHANA_REGIONS = [
  'Ashanti',
  'Brong-Ahafo',
  'Central',
  'Eastern',
  'Greater Accra',
  'Northern',
  'Upper East',
  'Upper West',
  'Volta',
  'Western',
  'Ahafo',
  'Bono East',
  'North East',
  'Oti',
  'Savannah',
  'Western North',
] as const;

export type GhanaRegion = (typeof GHANA_REGIONS)[number];

// Map center for Ghana
export const GHANA_CENTER: [number, number] = [7.9465, -1.0232];
export const GHANA_BOUNDS: [[number, number], [number, number]] = [
  [4.5, -3.5],
  [11.5, 1.5],
];
