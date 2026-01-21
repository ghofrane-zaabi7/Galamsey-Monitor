import Database from 'better-sqlite3';
import path from 'path';
import type {
  Incident,
  IncidentInput,
  WaterQualityReading,
  WaterQualityInput,
  MiningSite,
  MiningSiteInput,
  DashboardStats
} from '@/types';

const DB_PATH = path.join(process.cwd(), 'data', 'galamsey.db');

let db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
  }
  return db;
}

// Incident functions
export function getAllIncidents(): Incident[] {
  const stmt = getDb().prepare('SELECT * FROM incidents ORDER BY created_at DESC');
  return stmt.all() as Incident[];
}

export function getIncidentById(id: number): Incident | undefined {
  const stmt = getDb().prepare('SELECT * FROM incidents WHERE id = ?');
  return stmt.get(id) as Incident | undefined;
}

export function getIncidentsByRegion(region: string): Incident[] {
  const stmt = getDb().prepare('SELECT * FROM incidents WHERE region = ? ORDER BY created_at DESC');
  return stmt.all(region) as Incident[];
}

export function getIncidentsByStatus(status: string): Incident[] {
  const stmt = getDb().prepare('SELECT * FROM incidents WHERE status = ? ORDER BY created_at DESC');
  return stmt.all(status) as Incident[];
}

export function createIncident(input: IncidentInput): Incident {
  const stmt = getDb().prepare(`
    INSERT INTO incidents (title, description, latitude, longitude, region, district,
      reported_by, contact_phone, severity, incident_type, evidence_urls, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
  `);

  const result = stmt.run(
    input.title,
    input.description,
    input.latitude,
    input.longitude,
    input.region,
    input.district,
    input.reported_by,
    input.contact_phone || null,
    input.severity,
    input.incident_type,
    input.evidence_urls || null
  );

  return getIncidentById(Number(result.lastInsertRowid))!;
}

export function updateIncidentStatus(id: number, status: Incident['status']): Incident | undefined {
  const stmt = getDb().prepare(`
    UPDATE incidents SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
  `);
  stmt.run(status, id);
  return getIncidentById(id);
}

// Water Quality functions
export function getAllWaterReadings(): WaterQualityReading[] {
  const stmt = getDb().prepare('SELECT * FROM water_quality ORDER BY measured_at DESC');
  return stmt.all() as WaterQualityReading[];
}

export function getWaterReadingById(id: number): WaterQualityReading | undefined {
  const stmt = getDb().prepare('SELECT * FROM water_quality WHERE id = ?');
  return stmt.get(id) as WaterQualityReading | undefined;
}

export function getWaterReadingsByWaterBody(waterBodyName: string): WaterQualityReading[] {
  const stmt = getDb().prepare('SELECT * FROM water_quality WHERE water_body_name = ? ORDER BY measured_at DESC');
  return stmt.all(waterBodyName) as WaterQualityReading[];
}

export function createWaterReading(input: WaterQualityInput): WaterQualityReading {
  const stmt = getDb().prepare(`
    INSERT INTO water_quality (water_body_name, latitude, longitude, region,
      ph_level, turbidity_ntu, mercury_level_ppb, arsenic_level_ppb, lead_level_ppb,
      dissolved_oxygen_mgl, quality_status, notes, measured_by, measured_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `);

  const result = stmt.run(
    input.water_body_name,
    input.latitude,
    input.longitude,
    input.region,
    input.ph_level || null,
    input.turbidity_ntu || null,
    input.mercury_level_ppb || null,
    input.arsenic_level_ppb || null,
    input.lead_level_ppb || null,
    input.dissolved_oxygen_mgl || null,
    input.quality_status,
    input.notes || null,
    input.measured_by
  );

  return getWaterReadingById(Number(result.lastInsertRowid))!;
}

// Mining Site functions
export function getAllMiningSites(): MiningSite[] {
  const stmt = getDb().prepare('SELECT * FROM mining_sites ORDER BY created_at DESC');
  return stmt.all() as MiningSite[];
}

export function getMiningSiteById(id: number): MiningSite | undefined {
  const stmt = getDb().prepare('SELECT * FROM mining_sites WHERE id = ?');
  return stmt.get(id) as MiningSite | undefined;
}

export function getActiveMiningSites(): MiningSite[] {
  const stmt = getDb().prepare("SELECT * FROM mining_sites WHERE status = 'active' ORDER BY created_at DESC");
  return stmt.all() as MiningSite[];
}

export function createMiningSite(input: MiningSiteInput): MiningSite {
  const stmt = getDb().prepare(`
    INSERT INTO mining_sites (name, latitude, longitude, region, district,
      estimated_area_hectares, status, satellite_image_url, notes, first_detected)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `);

  const result = stmt.run(
    input.name,
    input.latitude,
    input.longitude,
    input.region,
    input.district,
    input.estimated_area_hectares || null,
    input.status,
    input.satellite_image_url || null,
    input.notes || null
  );

  return getMiningSiteById(Number(result.lastInsertRowid))!;
}

export function updateMiningSiteStatus(id: number, status: MiningSite['status']): MiningSite | undefined {
  const stmt = getDb().prepare(`
    UPDATE mining_sites SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
  `);
  stmt.run(status, id);
  return getMiningSiteById(id);
}

// Dashboard Statistics
export function getDashboardStats(): DashboardStats {
  const db = getDb();

  // Total and active incidents
  const totalIncidents = (db.prepare('SELECT COUNT(*) as count FROM incidents').get() as { count: number }).count;
  const activeIncidents = (db.prepare("SELECT COUNT(*) as count FROM incidents WHERE status = 'active'").get() as { count: number }).count;

  // Water body stats
  const affectedWaterBodies = (db.prepare('SELECT COUNT(DISTINCT water_body_name) as count FROM water_quality').get() as { count: number }).count;
  const pollutedWaterBodies = (db.prepare("SELECT COUNT(DISTINCT water_body_name) as count FROM water_quality WHERE quality_status IN ('polluted', 'hazardous')").get() as { count: number }).count;

  // Mining site stats
  const totalMiningSites = (db.prepare('SELECT COUNT(*) as count FROM mining_sites').get() as { count: number }).count;
  const activeMiningSites = (db.prepare("SELECT COUNT(*) as count FROM mining_sites WHERE status = 'active'").get() as { count: number }).count;

  // Incidents by region
  const incidentsByRegion = db.prepare(`
    SELECT region, COUNT(*) as count FROM incidents GROUP BY region ORDER BY count DESC
  `).all() as { region: string; count: number }[];

  // Incidents by type
  const incidentsByType = db.prepare(`
    SELECT incident_type as type, COUNT(*) as count FROM incidents GROUP BY incident_type ORDER BY count DESC
  `).all() as { type: string; count: number }[];

  // Water quality trend (last 30 days)
  const waterQualityTrend = db.prepare(`
    SELECT
      DATE(measured_at) as date,
      SUM(CASE WHEN quality_status = 'safe' THEN 1 ELSE 0 END) as safe,
      SUM(CASE WHEN quality_status IN ('polluted', 'hazardous') THEN 1 ELSE 0 END) as polluted
    FROM water_quality
    WHERE measured_at >= DATE('now', '-30 days')
    GROUP BY DATE(measured_at)
    ORDER BY date ASC
  `).all() as { date: string; safe: number; polluted: number }[];

  // Recent incidents
  const recentIncidents = db.prepare(`
    SELECT * FROM incidents ORDER BY created_at DESC LIMIT 5
  `).all() as Incident[];

  return {
    totalIncidents,
    activeIncidents,
    affectedWaterBodies,
    pollutedWaterBodies,
    totalMiningSites,
    activeMiningSites,
    incidentsByRegion,
    incidentsByType,
    waterQualityTrend,
    recentIncidents,
  };
}

export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}
