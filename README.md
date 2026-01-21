# Galamsey Monitor

**A comprehensive platform for monitoring, reporting, and combating illegal small-scale mining (galamsey) in Ghana.**

[![Next.js](https://img.shields.io/badge/Next.js-16.1-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## Overview

Galamsey Monitor is a web-based platform designed to help track and combat the illegal mining crisis devastating Ghana's environment. The platform provides tools for:

- **Incident Reporting** - Citizens can anonymously report illegal mining activities with GPS coordinates
- **Real-time Mapping** - Interactive maps showing affected areas across all 16 regions of Ghana
- **Water Quality Tracking** - Monitor pollution levels in Ghana's rivers and water bodies
- **Data Visualization** - Charts and statistics revealing the scale of environmental damage
- **Satellite Integration** - Tools to analyze satellite imagery for detecting mining sites
- **Public Awareness** - Educational resources about the galamsey crisis

## The Galamsey Crisis

Galamsey (from "gather them and sell") refers to illegal small-scale gold mining operations that have caused:

- **60%** of Ghana's water bodies polluted
- **$2.2 billion** annual economic loss
- **34%** of forest cover destroyed
- **5+ million** people affected

This platform aims to empower communities, NGOs, and authorities to coordinate efforts against this environmental catastrophe.

## Features

### Dashboard
![Dashboard](https://img.shields.io/badge/Status-Active-brightgreen)
- Real-time statistics on incidents, water quality, and mining sites
- Interactive map with all reported data points
- Alert system for critical incidents
- Quick action navigation

### Incident Reporting System
- Geolocation support (auto-detect GPS coordinates)
- Anonymous reporting option
- Multiple incident types:
  - Illegal mining operations
  - Water pollution
  - Deforestation
  - Land degradation
- Severity classification (Low → Critical)
- Coverage of all 16 Ghana regions

### Water Quality Monitoring
- Track key pollutants: Mercury, Arsenic, Lead
- Monitor pH levels and turbidity
- Status indicators: Safe, Moderate, Polluted, Hazardous
- Health risk information and warnings

### Interactive Maps
- Leaflet-based mapping with OpenStreetMap
- Color-coded markers by severity
- Water quality overlay
- Mining site boundaries with area estimates
- Click for detailed information

### Statistics & Analytics
- Incidents by region (bar chart)
- Incidents by type (pie chart)
- Water quality trends over time
- Key insights and impact metrics

### Satellite Imagery Integration
- Links to Sentinel Hub, Google Earth Engine, Planet Labs
- Known galamsey hotspots with coordinates
- One-click satellite view
- Visual detection guide

### Education & Awareness
- Comprehensive information about galamsey
- Environmental and health impacts
- How citizens can help
- Emergency contacts and resources
- Legal framework information

## Tech Stack

| Technology | Purpose |
|------------|---------|
| [Next.js 16](https://nextjs.org/) | React framework with App Router |
| [TypeScript](https://www.typescriptlang.org/) | Type-safe JavaScript |
| [Tailwind CSS v4](https://tailwindcss.com/) | Utility-first styling |
| [SQLite](https://www.sqlite.org/) | Local database (better-sqlite3) |
| [Leaflet](https://leafletjs.com/) | Interactive maps |
| [Recharts](https://recharts.org/) | Data visualization |
| [Lucide React](https://lucide.dev/) | Icons |

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ghwmelite-dotcom/Galamsey-Monitor.git
   cd Galamsey-Monitor
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Initialize the database**
   ```bash
   npm run db:init
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   ```
   http://localhost:3000
   ```

### Production Build

```bash
npm run build
npm start
```

## Project Structure

```
galamsey/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API routes
│   │   │   ├── incidents/     # Incident CRUD endpoints
│   │   │   ├── water/         # Water quality endpoints
│   │   │   ├── sites/         # Mining sites endpoints
│   │   │   └── stats/         # Statistics endpoint
│   │   ├── awareness/         # Education page
│   │   ├── map/               # Full-screen map
│   │   ├── report/            # Incident reporting form
│   │   ├── satellite/         # Satellite imagery tools
│   │   ├── statistics/        # Charts and analytics
│   │   ├── water/             # Water quality dashboard
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home dashboard
│   │   └── globals.css        # Global styles
│   ├── components/            # Reusable React components
│   │   ├── DashboardStats.tsx
│   │   ├── GhanaMap.tsx
│   │   ├── Navigation.tsx
│   │   └── RecentIncidents.tsx
│   ├── lib/                   # Utilities
│   │   └── db.ts              # Database operations
│   └── types/                 # TypeScript definitions
│       └── index.ts
├── scripts/
│   └── init-db.js             # Database initialization
├── data/
│   └── galamsey.db            # SQLite database
├── public/                    # Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.ts
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/incidents` | List all incidents |
| POST | `/api/incidents` | Create new incident |
| GET | `/api/water` | List water quality readings |
| POST | `/api/water` | Add water quality reading |
| GET | `/api/sites` | List mining sites |
| POST | `/api/sites` | Add mining site |
| GET | `/api/stats` | Get dashboard statistics |

## Contributing

We welcome contributions from developers, environmental activists, and anyone passionate about protecting Ghana's environment.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Areas for Contribution

- [ ] Mobile app development (React Native)
- [ ] SMS-based reporting for areas with limited internet
- [ ] Machine learning for satellite image analysis
- [ ] Integration with government databases
- [ ] Multi-language support (Akan, Ewe, Ga, etc.)
- [ ] Real-time notifications system
- [ ] Data export and reporting tools

## Reporting Galamsey

If you witness illegal mining activities:

1. **Use this platform** to report with location details
2. **Contact authorities:**
   - Minerals Commission: +233 302 773 053
   - Environmental Protection Agency: +233 302 664 697
   - Police Emergency: 191 or 18555

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Environmental Protection Agency Ghana
- Water Resources Commission Ghana
- Minerals Commission Ghana
- All volunteers and contributors fighting galamsey

---

<p align="center">
  <strong>Together we can protect Ghana's environment for future generations.</strong>
</p>

<p align="center">
  <img src="https://flagcdn.com/w80/gh.png" alt="Ghana Flag" width="60">
</p>

<p align="center">
  Made with dedication for Ghana
</p>
