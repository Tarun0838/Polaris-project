# VYOM: Beyond Boundary, Beyond Limits
### Smart India Hackathon (SIH 2026)
**Ministry:** Ministry of Earth Sciences (MoES)  
**Theme:** Smart Education  
**Tagline:** *"Beyond Boundary, Beyond Limits."*  
**Alternative Supporting Line:** *"Discover. Understand. Create. Verify. Share."*

---

## 1. Executive Summary & Core Principle

**VYOM is NOT merely a document repository and NOT just an AI chatbot.**

It is an integrated polar science outreach, knowledge repository, and media dissemination ecosystem that:
1. **Organizes verified polar research metadata** from India's polar research ecosystem.
2. **Connects** stations, expeditions, research projects, in-situ datasets, technical reports, peer-reviewed publications, and media archives into a traversable relational knowledge graph.
3. **Provides powerful search & filtering** across all interconnected polar collections with real-time debounced queries.
4. **Delivers an interactive Polar Explorer** displaying India's polar stations (*Maitri, Bharati, Himadri, and Himansh*) with coordinate telemetry and live knowledge metrics.
5. **Makes scientific information understandable** for students and the general public through simplified concepts, "Why It Matters" guides, and interactive quizzes.
6. **Employs source-grounded AI** to synthesize verified research into audience-tailored outreach formats (articles, video scripts, social snapshots, factsheets).
7. **Maintains a Human-in-the-Loop verification gate** where science curators review, edit, approve, or reject AI drafts before public release.

> **Strong Project Statement:**  
> *"VYOM does not merely store polar research; it makes polar research discoverable, connected, understandable and reusable for different audiences."*

---

## 2. Core Workflow

$$\text{DISCOVER} \longrightarrow \text{CONNECT} \longrightarrow \text{UNDERSTAND} \longrightarrow \text{CREATE} \longrightarrow \text{VERIFY} \longrightarrow \text{DISSEMINATE}$$

1. **DISCOVER**: Unified search across research projects, NPDC in-situ datasets, expeditions, and stations.
2. **CONNECT**: Relational knowledge layer linking *Projects → Expeditions → Stations → Scientists → Reports → Datasets → Publications → Outreach*.
3. **UNDERSTAND**: Dedicated Student Mode ("Explain for Students") breaking down complex polar science into accessible concepts.
4. **CREATE**: AI Media Studio generating audience-targeted outreach drafts grounded strictly in official metadata.
5. **VERIFY**: Editorial curation desk where human curators audit drafts against original research citations.
6. **DISSEMINATE**: Live publication to the public outreach feed, university classrooms, and science media channels.

---

## 3. Technology Stack

- **Frontend:**
  - React (Vite, JSX, JavaScript)
  - Tailwind CSS
  - React Router DOM
  - Redux Toolkit (`@reduxjs/toolkit`, `react-redux`)
  - Axios
  - Lucide React (Official iconography)
  - React Leaflet & Leaflet (Interactive polar maps)
  - Recharts (Interactive scientific charts)
  - react-hot-toast (Instant notifications)

- **Backend:**
  - Node.js & Express.js (JavaScript)
  - MongoDB & Mongoose
  - JWT Authentication & bcryptjs password hashing
  - Dotenv & Morgan logging
  - Embedded MongoDB Memory Server fallback (ensures 100% offline hackathon jury evaluation with zero database configuration hassle)

- **AI Service Abstraction:**
  - Backend AI service (`backend/services/aiService.js`)
  - Google Gemini API integration when `AI_API_KEY` is provided in `.env`
  - High-fidelity deterministic grounded fallback generator that works completely offline if no API key is supplied, preventing hallucination and strictly citing source IDs.

---

## 4. Project Directory Structure

```
VYOM/
├── backend/
│   ├── config/
│   │   └── db.js                 # Smart Mongo connection with embedded fallback
│   ├── controllers/
│   │   ├── authController.js     # JWT auth & demo account management
│   │   ├── searchController.js   # Unified multi-collection search
│   │   ├── stationController.js  # Maitri, Bharati, Himadri, Himansh
│   │   ├── expeditionController.js# ISEA, IAE, ISOE, Himalayan campaigns
│   │   ├── projectController.js  # Knowledge graph linking & projects
│   │   ├── datasetController.js  # NPDC in-situ datasets
│   │   ├── reportController.js   # MoES technical & annual reports
│   │   ├── publicationController.js# DOI peer-reviewed journal papers
│   │   ├── mediaController.js    # Photographic archive
│   │   ├── educationController.js# Student learning modules & quizzes
│   │   ├── contentController.js  # AI draft generation & human review loop
│   │   └── adminController.js    # Operational telemetry & chart metrics
│   ├── models/                   # Mongoose relational schemas
│   ├── routes/                   # Express REST endpoints
│   ├── middleware/               # Auth, RBAC, Centralized Error Handling
│   ├── services/
│   │   └── aiService.js          # Grounded AI generation abstraction
│   ├── seed/
│   │   ├── stations.json         # Authentic Indian polar stations
│   │   ├── expeditions.json      # ISEA 42/43, IAE 14, Southern Ocean, Himansh
│   │   ├── researchProjects.json # Flagship research initiatives
│   │   ├── datasets.json         # NPDC metadata with official provenance
│   │   ├── reports.json          # MoES technical & EIA reports
│   │   ├── publications.json     # Peer-reviewed journal papers with DOIs
│   │   ├── media.json            # Polar photographic archive
│   │   ├── educationalContent.json# Student modules with quizzes & charts
│   │   └── seedDatabase.js       # Master automated seed runner
│   ├── server.js                 # Express server entry point
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/           # Navbar, Footer, UI components (Card, Badge, Modal, etc.)
│   │   ├── layouts/              # MainLayout
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── ExplorePage.jsx
│   │   │   ├── PolarMapPage.jsx
│   │   │   ├── StationDetailPage.jsx
│   │   │   ├── ExpeditionsPage.jsx
│   │   │   ├── ExpeditionDetailPage.jsx
│   │   │   ├── ResearchProjectsPage.jsx
│   │   │   ├── ResearchProjectDetailPage.jsx
│   │   │   ├── DatasetsPage.jsx
│   │   │   ├── DatasetDetailPage.jsx
│   │   │   ├── ReportsPage.jsx
│   │   │   ├── PublicationsPage.jsx
│   │   │   ├── LearningHubPage.jsx
│   │   │   ├── MediaStudioPage.jsx
│   │   │   ├── AdminDashboardPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   └── PublicOutreachFeedPage.jsx
│   │   ├── services/             # Axios API client
│   │   ├── store/                # Redux Toolkit store & slices
│   │   ├── App.jsx               # Application routes
│   │   ├── main.jsx              # React DOM entry
│   │   └── index.css             # Tailwind styling & polar design tokens
│   ├── package.json
│   └── vite.config.js
├── README.md
└── package.json                  # Root orchestration
```

---

## 5. Demo Credentials

The database comes pre-seeded with three demo personas for instant jury evaluation:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Admin / Curator** | `admin@polaris.demo` | `polaris123` | Full access: Curation Review Queue, Approve/Reject/Publish, Add Resources, Analytics |
| **Researcher** | `researcher@polaris.demo` | `polaris123` | Create projects, submit datasets, generate AI drafts, submit for review |
| **Student** | `student@polaris.demo` | `polaris123` | Access Student Learning Hub, take quizzes, view simplified student explanations |

> **Pro-Tip for Evaluators:** The Navbar and Login page feature **1-click Role Switchers** that pre-fill credentials or switch personas in one click!

---

## 6. Installation & Quick Start

### Prerequisites
- Node.js (v18+ or v20+)
- npm (v9+)

### Step 1: Install Dependencies
```bash
# Install backend packages
cd backend
npm install

# Install frontend packages
cd ../frontend
npm install
```

### Step 2: Seed the Database
```bash
cd ../backend
npm run seed
```
*(Note: If no external MongoDB URI is set in `.env`, the system automatically starts an embedded in-memory MongoDB instance and completes seeding in seconds!)*

### Step 3: Run the Application
In terminal 1 (Backend):
```bash
cd backend
npm run dev
# Running on http://localhost:5000/api
```

In terminal 2 (Frontend):
```bash
cd frontend
npm run dev
# Running on http://localhost:5173
```

---

## 7. 5–7 Minute Jury Demonstration Script

Follow this exact walkthrough during the hackathon evaluation:

1. **Home Landing Page (`/`):**
   - Present the header showing India's Ministry of Earth Sciences (MoES) identity.
   - Show the 4 permanent stations (*Maitri, Bharati, Himadri, Himansh*).
   - Point out the **Research-to-Outreach Engine** pipeline banner.

2. **Explore Knowledge Repository (`/explore`):**
   - Type `"glacier"` or `"permafrost"` in the search bar.
   - Observe live debounced multi-collection search displaying active filters and result count (*e.g., "X resources found"*).

3. **Polar Explorer Interactive Map (`/map`):**
   - Click on the **Maitri** or **Himadri** station marker.
   - Open popup with telemetry, description, and click **[Explore Station Details]**.

4. **Station Detail Page (`/stations/maitri`):**
   - Review live connected stats (*Projects, Datasets, Reports, Publications, Expeditions*).
   - Toggle through clean tabs to see interconnected datasets and technical reports.

5. **Research Project & Knowledge Graph (`/research/POL-PRJ-2023-01`):**
   - Open *"Long-term Permafrost Active Layer & Glacial Geomorphology Dynamics in Schirmacher Oasis"*.
   - **Show the Knowledge Relationship Visual Diagram**:
     $$\text{Project} \longrightarrow \text{Station (Maitri)} \longrightarrow \text{Expedition (43rd ISEA)} \longrightarrow \text{NPDC Datasets} \longrightarrow \text{Reports} \longrightarrow \text{Publications} \longrightarrow \text{Outreach}$$
   - Click **[Explain for Students]**: Display the interactive student drawer explaining concepts (*Permafrost, Active Layer, Fun Facts*) grounded strictly in the project metadata.

6. **NPDC Dataset Detail (`/datasets/NPDC-DS-2023-ANT-01`):**
   - Inspect parameters, format (NetCDF/CSV), and access notice:
     *"Access through official NPDC source. User registration on National Polar Data Centre portal required under MoES Data Policy."*
   - Click **[Open Official Source (NPDC Portal)]**.

7. **AI Media Studio (`/media-studio`):**
   - The selected research project is loaded as Source.
   - Select Audience: **College Student** (or School Student).
   - Select Format: **Website Article** (or Social Media Post / Short Video Script).
   - Click **[Step 4: Generate Outreach Draft]**.
   - Show the generated content with **Key Verified Facts** and **Verified Source Citations**.
   - Click **[Submit for Curator Review]** (sets status to `in_review`).

8. **Admin Operations & Curation Queue (`/admin`):**
   - Switch persona or login as `admin@polaris.demo`.
   - Open the **AI Outreach Curation Queue**.
   - Audit the submitted draft against source citations.
   - Click **[Approve & Publish to Outreach]**.
   - Show the update in the live analytics chart and see it published on the **Public Outreach Portal (`/outreach`)**!

---

## 8. Data Source & Provenance Policy

VYOM enforces strict scientific provenance:
- **No Web Scraping Violations:** Uses structured metadata and direct official links to NPDC (`https://npdc.ncpor.res.in`) and NCPOR (`https://ncpor.res.in`).
- **No Copyright Infringements:** Academic papers are referenced via official persistent DOIs; restricted datasets clearly display *"Access via official NPDC source"*.
- **No Uncontrolled Hallucination:** System prompts enforce deterministic citations; if data is unavailable, the system explicitly reports it.

---

## 9. Future Scope

1. **Semantic & Vector Search:** Integration of domain-specific vector embeddings for multilingual polar scientific inquiry.
2. **Multilingual Dissemination:** Automated translation of curator-approved outreach into 22 official Indian languages (Hindi, Tamil, Bengali, Marathi, etc.).
3. **Automated Metadata Harvesting:** Direct OAI-PMH / ISO 19115 compliant metadata sync with NCPOR and MoES institutional repositories.
4. **Mobile Fieldwork Companion:** Progressive Web App (PWA) with offline caching for expedition scientists deploying in low-bandwidth polar environments.
5. **Interactive 3D Glacier & Station Models:** WebGL-based visualization of ice sheet cross-sections and station modular habitats.

---

## 10. License & Acknowledgements

Developed for **Smart India Hackathon (SIH 2026)**.  
Data schema and institutional workflows designed with reference to the **Ministry of Earth Sciences (MoES)**, Government of India, and the **National Centre for Polar and Ocean Research (NCPOR)**, Goa.
