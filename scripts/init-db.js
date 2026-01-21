const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'galamsey.db');

// Delete existing database for fresh start
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log('Removed existing database');
}

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

console.log('Creating database schema...');

// Create tables
db.exec(`
  -- Incidents table
  CREATE TABLE IF NOT EXISTS incidents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    region TEXT NOT NULL,
    district TEXT NOT NULL,
    reported_by TEXT NOT NULL,
    contact_phone TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'investigating', 'resolved')),
    severity TEXT NOT NULL CHECK(severity IN ('low', 'medium', 'high', 'critical')),
    incident_type TEXT NOT NULL CHECK(incident_type IN ('illegal_mining', 'water_pollution', 'deforestation', 'land_degradation')),
    evidence_urls TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Water quality readings table
  CREATE TABLE IF NOT EXISTS water_quality (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    water_body_name TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    region TEXT NOT NULL,
    ph_level REAL,
    turbidity_ntu REAL,
    mercury_level_ppb REAL,
    arsenic_level_ppb REAL,
    lead_level_ppb REAL,
    dissolved_oxygen_mgl REAL,
    quality_status TEXT NOT NULL CHECK(quality_status IN ('safe', 'moderate', 'polluted', 'hazardous')),
    notes TEXT,
    measured_by TEXT NOT NULL,
    measured_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Mining sites table
  CREATE TABLE IF NOT EXISTS mining_sites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    region TEXT NOT NULL,
    district TEXT NOT NULL,
    estimated_area_hectares REAL,
    first_detected DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_activity_detected DATETIME,
    status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'inactive', 'remediated')),
    satellite_image_url TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Create indexes for faster queries
  CREATE INDEX IF NOT EXISTS idx_incidents_region ON incidents(region);
  CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
  CREATE INDEX IF NOT EXISTS idx_incidents_type ON incidents(incident_type);
  CREATE INDEX IF NOT EXISTS idx_water_quality_region ON water_quality(region);
  CREATE INDEX IF NOT EXISTS idx_water_quality_status ON water_quality(quality_status);
  CREATE INDEX IF NOT EXISTS idx_mining_sites_region ON mining_sites(region);
  CREATE INDEX IF NOT EXISTS idx_mining_sites_status ON mining_sites(status);
`);

console.log('Schema created successfully!');

console.log('Inserting sample data...');

// Sample incidents data for Ghana
const incidents = [
  {
    title: 'Large-scale illegal mining operation detected',
    description: 'Multiple excavators and washing plants spotted in forest reserve. Significant land degradation observed over approximately 50 hectares.',
    latitude: 6.1256,
    longitude: -1.8521,
    region: 'Ashanti',
    district: 'Amansie West',
    reported_by: 'Community Leader',
    severity: 'critical',
    incident_type: 'illegal_mining',
    status: 'active'
  },
  {
    title: 'River Ankobra pollution incident',
    description: 'Water has turned brown/orange color. Fish deaths reported downstream. Local fishermen unable to work.',
    latitude: 5.2156,
    longitude: -2.1234,
    region: 'Western',
    district: 'Prestea-Huni Valley',
    reported_by: 'Fisherman Association',
    severity: 'high',
    incident_type: 'water_pollution',
    status: 'investigating'
  },
  {
    title: 'Forest clearing for mining',
    description: 'Approximately 20 hectares of forest cleared for galamsey activities. Native trees destroyed.',
    latitude: 6.3521,
    longitude: -2.0123,
    region: 'Western North',
    district: 'Bibiani-Anhwiaso-Bekwai',
    reported_by: 'Environmental NGO',
    severity: 'high',
    incident_type: 'deforestation',
    status: 'active'
  },
  {
    title: 'Farmland destroyed by mining',
    description: 'Cocoa farm completely destroyed by illegal miners. Farmer lost entire livelihood. Deep pits left unfilled.',
    latitude: 6.5432,
    longitude: -1.6234,
    region: 'Ashanti',
    district: 'Obuasi Municipal',
    reported_by: 'Affected Farmer',
    severity: 'medium',
    incident_type: 'land_degradation',
    status: 'active'
  },
  {
    title: 'Night-time mining operations',
    description: 'Illegal mining activities continuing at night using generators and lights. Community disturbed.',
    latitude: 5.9876,
    longitude: -1.9543,
    region: 'Central',
    district: 'Upper Denkyira East',
    reported_by: 'Anonymous',
    severity: 'medium',
    incident_type: 'illegal_mining',
    status: 'active'
  },
  {
    title: 'River Pra contamination',
    description: 'Heavy metal contamination detected in River Pra. Children reported skin rashes after contact with water.',
    latitude: 5.7654,
    longitude: -1.5678,
    region: 'Central',
    district: 'Twifo-Atti Morkwa',
    reported_by: 'Health Worker',
    severity: 'critical',
    incident_type: 'water_pollution',
    status: 'investigating'
  },
  {
    title: 'Excavator operation near school',
    description: 'Mining excavators operating within 500 meters of primary school. Safety concerns for children.',
    latitude: 6.0123,
    longitude: -2.3456,
    region: 'Western',
    district: 'Tarkwa-Nsuaem',
    reported_by: 'School Headmaster',
    severity: 'high',
    incident_type: 'illegal_mining',
    status: 'active'
  },
  {
    title: 'Resolved site now active again',
    description: 'Previously closed mining site has resumed operations. New workers and equipment observed.',
    latitude: 6.4321,
    longitude: -1.8765,
    region: 'Ashanti',
    district: 'Bekwai Municipal',
    reported_by: 'District Assembly Member',
    severity: 'medium',
    incident_type: 'illegal_mining',
    status: 'active'
  },
  {
    title: 'Birim River heavily polluted',
    description: 'Birim River water unusable. Color changed to muddy brown. Community water source destroyed.',
    latitude: 6.1789,
    longitude: -0.6543,
    region: 'Eastern',
    district: 'Birim North',
    reported_by: 'Water Company',
    severity: 'critical',
    incident_type: 'water_pollution',
    status: 'active'
  },
  {
    title: 'Mining in protected forest',
    description: 'Illegal mining activities detected inside Atewa Forest Reserve. Endangered species habitat threatened.',
    latitude: 6.2234,
    longitude: -0.5789,
    region: 'Eastern',
    district: 'Atewa',
    reported_by: 'Forest Guard',
    severity: 'critical',
    incident_type: 'deforestation',
    status: 'investigating'
  }
];

const insertIncident = db.prepare(`
  INSERT INTO incidents (title, description, latitude, longitude, region, district, reported_by, severity, incident_type, status)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

for (const incident of incidents) {
  insertIncident.run(
    incident.title,
    incident.description,
    incident.latitude,
    incident.longitude,
    incident.region,
    incident.district,
    incident.reported_by,
    incident.severity,
    incident.incident_type,
    incident.status
  );
}

console.log(`Inserted ${incidents.length} sample incidents`);

// Sample water quality data
const waterReadings = [
  {
    water_body_name: 'River Pra',
    latitude: 5.8234,
    longitude: -1.4567,
    region: 'Central',
    ph_level: 5.2,
    turbidity_ntu: 450,
    mercury_level_ppb: 8.5,
    arsenic_level_ppb: 12.3,
    quality_status: 'hazardous',
    measured_by: 'Water Resources Commission'
  },
  {
    water_body_name: 'River Ankobra',
    latitude: 5.1567,
    longitude: -2.0876,
    region: 'Western',
    ph_level: 6.1,
    turbidity_ntu: 280,
    mercury_level_ppb: 4.2,
    arsenic_level_ppb: 6.7,
    quality_status: 'polluted',
    measured_by: 'EPA Ghana'
  },
  {
    water_body_name: 'River Birim',
    latitude: 6.1234,
    longitude: -0.6789,
    region: 'Eastern',
    ph_level: 5.8,
    turbidity_ntu: 520,
    mercury_level_ppb: 11.2,
    arsenic_level_ppb: 15.8,
    quality_status: 'hazardous',
    measured_by: 'EPA Ghana'
  },
  {
    water_body_name: 'River Offin',
    latitude: 6.5678,
    longitude: -1.7890,
    region: 'Ashanti',
    ph_level: 6.5,
    turbidity_ntu: 180,
    mercury_level_ppb: 2.1,
    arsenic_level_ppb: 3.2,
    quality_status: 'moderate',
    measured_by: 'Community Monitor'
  },
  {
    water_body_name: 'Lake Bosomtwe',
    latitude: 6.5039,
    longitude: -1.4125,
    region: 'Ashanti',
    ph_level: 7.2,
    turbidity_ntu: 15,
    mercury_level_ppb: 0.3,
    arsenic_level_ppb: 0.5,
    quality_status: 'safe',
    measured_by: 'Tourism Authority'
  },
  {
    water_body_name: 'River Tano',
    latitude: 7.0123,
    longitude: -2.5678,
    region: 'Bono',
    ph_level: 6.8,
    turbidity_ntu: 95,
    mercury_level_ppb: 1.5,
    arsenic_level_ppb: 2.1,
    quality_status: 'moderate',
    measured_by: 'Water Resources Commission'
  },
  {
    water_body_name: 'River Densu',
    latitude: 5.7890,
    longitude: -0.3456,
    region: 'Greater Accra',
    ph_level: 6.2,
    turbidity_ntu: 220,
    mercury_level_ppb: 3.8,
    arsenic_level_ppb: 5.2,
    quality_status: 'polluted',
    measured_by: 'EPA Ghana'
  },
  {
    water_body_name: 'River Bia',
    latitude: 6.2345,
    longitude: -3.0123,
    region: 'Western North',
    ph_level: 5.5,
    turbidity_ntu: 380,
    mercury_level_ppb: 7.2,
    arsenic_level_ppb: 9.8,
    quality_status: 'hazardous',
    measured_by: 'NGO WaterAid'
  }
];

const insertWaterReading = db.prepare(`
  INSERT INTO water_quality (water_body_name, latitude, longitude, region, ph_level, turbidity_ntu, mercury_level_ppb, arsenic_level_ppb, quality_status, measured_by)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

for (const reading of waterReadings) {
  insertWaterReading.run(
    reading.water_body_name,
    reading.latitude,
    reading.longitude,
    reading.region,
    reading.ph_level,
    reading.turbidity_ntu,
    reading.mercury_level_ppb,
    reading.arsenic_level_ppb,
    reading.quality_status,
    reading.measured_by
  );
}

console.log(`Inserted ${waterReadings.length} water quality readings`);

// Sample mining sites
const miningSites = [
  {
    name: 'Amansie West Site A',
    latitude: 6.1234,
    longitude: -1.8765,
    region: 'Ashanti',
    district: 'Amansie West',
    estimated_area_hectares: 45.5,
    status: 'active'
  },
  {
    name: 'Prestea Mining Zone',
    latitude: 5.4321,
    longitude: -2.1432,
    region: 'Western',
    district: 'Prestea-Huni Valley',
    estimated_area_hectares: 78.2,
    status: 'active'
  },
  {
    name: 'Obuasi Illegal Site',
    latitude: 6.1876,
    longitude: -1.6789,
    region: 'Ashanti',
    district: 'Obuasi Municipal',
    estimated_area_hectares: 32.8,
    status: 'active'
  },
  {
    name: 'Tarkwa Forest Site',
    latitude: 5.3012,
    longitude: -1.9876,
    region: 'Western',
    district: 'Tarkwa-Nsuaem',
    estimated_area_hectares: 55.0,
    status: 'active'
  },
  {
    name: 'Birim River Zone',
    latitude: 6.0987,
    longitude: -0.7654,
    region: 'Eastern',
    district: 'Birim North',
    estimated_area_hectares: 28.3,
    status: 'active'
  },
  {
    name: 'Denkyira East Site',
    latitude: 5.9543,
    longitude: -1.8234,
    region: 'Central',
    district: 'Upper Denkyira East',
    estimated_area_hectares: 41.7,
    status: 'active'
  },
  {
    name: 'Remediated Bekwai Site',
    latitude: 6.4567,
    longitude: -1.5678,
    region: 'Ashanti',
    district: 'Bekwai Municipal',
    estimated_area_hectares: 22.1,
    status: 'remediated'
  },
  {
    name: 'Inactive Atiwa Site',
    latitude: 6.2567,
    longitude: -0.6123,
    region: 'Eastern',
    district: 'Atewa',
    estimated_area_hectares: 18.5,
    status: 'inactive'
  }
];

const insertMiningSite = db.prepare(`
  INSERT INTO mining_sites (name, latitude, longitude, region, district, estimated_area_hectares, status)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

for (const site of miningSites) {
  insertMiningSite.run(
    site.name,
    site.latitude,
    site.longitude,
    site.region,
    site.district,
    site.estimated_area_hectares,
    site.status
  );
}

console.log(`Inserted ${miningSites.length} mining sites`);

db.close();

console.log('\nDatabase initialization complete!');
console.log(`Database file: ${dbPath}`);
