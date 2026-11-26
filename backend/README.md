# AeroShield AI — Enterprise Backend Engine

AeroShield AI is an enterprise-grade backend service built with **Python 3.11**, **FastAPI**, **Pydantic v2**, and **Google Gemini 1.5**, engineered specifically for winter smog mitigation, planetary boundary layer dynamics, and personal lung dose reduction.

---

## Key Architectural Modules

### 1. Atmospheric Boundary Layer & Inversion Engine (`app/services/aqi_service.py`)
- Real-time telemetry integration with **Open-Meteo Air Quality & CAMS Telemetry**, **OpenAQ**, and **WAQI**.
- Scientific modeling of winter radiation inversions and persistent cold-air pools (PCAPs).
- High-fidelity modeling for global winter smog hotspots:
  - **Delhi NCR (India)**: Radiation inversion over the Indo-Gangetic basin with trapped agricultural biomass and vehicular particulate.
  - **Lahore (Pakistan)**: Transboundary stagnant haze with capping inversion at ~180m.
  - **Beijing (China)**: Mountain-valley cold pool circulation and winter district heating surge.
  - **Salt Lake City (USA)**: Persistent Cold-Air Pool (PCAP) topography trapping fine particulate matter.
- **Golden Ventilation Window Detection**: Identifies diurnal convective boundary layer lift (typically 12:30–15:30) for safe building purge flushes.

### 2. Gemini GenAI Engine (`app/services/gemini_service.py`)
- **Routine Planner**: Generates exposure-minimized schedules tailored by sensitive persona (`child`, `asthmatic`, `elderly`, `commuter`, `outdoor_worker`, `athlete`).
- **Low-Emission Transit Optimizer**: Calculates PM2.5 exposure differences and CO2 offsets when shifting from private ICE vehicles to electric metro or active transit.
- **IAQ Hacks Advisor**: Provides engineering blueprints for **Corsi-Rosenthal Boxes**, draft proofing, weatherstripping, and relative humidity optimization.
- **Multimodal Vision Inspector**: Ingests room, window, or DIY purifier photos to evaluate filter seal integrity, air bypass leaks, cardboard shroud presence, and fire safety.

### 3. Pure Mathematical & Physical Impact Engine (`app/services/math_engine.py`)
- **Inhaled & Deposited Lung Dose**:
  $$\text{Dose } (\mu g) = \sum_{i} \left[ C_i \times V_E \times t_i \times (1 - \eta_{\text{mask}}) \right] \times DF$$
  where $V_E$ is breathing volume based on EPA Exposure Factors, $\eta_{\text{mask}}$ is certified mask filtration efficiency, and $DF = 0.50$ is the ICRP 66 pulmonary deposition fraction.
- **Cigarette Equivalence**: Calculated against the Berkeley Earth environmental health benchmark ($22\,\mu g \text{ inhaled } PM_{2.5} \approx 1 \text{ cigarette}$).
- **Corsi-Rosenthal Box Aerodynamics**: Models Clean Air Delivery Rate (CADR in CFM), shroud velocity enhancement (+38%), and Air Changes per Hour (ACH).

### 4. Enterprise Security & Hardening (`app/main.py`)
- **Pydantic v2 Schemas**: Strict type checking, value bounds enforcement, and input sanitization stripping XSS/HTML tags.
- **Security Headers**: HSTS, Content-Security-Policy, X-Content-Type-Options: nosniff, X-Frame-Options: DENY, X-XSS-Protection.
- **Rate Limiting**: Configured with `slowapi` to protect against denial-of-service.
- **CORS Support**: Strict origin verification.

---

## API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | System health check and Gemini AI status |
| `GET` | `/api/aqi/hotspots` | Curated winter smog hotspots and meteorological drivers |
| `GET` | `/api/aqi/hotspots/{id}` | Detailed inversion profile for a hotspot |
| `GET` | `/api/aqi/current` | Real-time AQI, pollutants, and 24h boundary layer forecast |
| `GET` | `/api/aqi/inversion` | Boundary layer height, Inversion Strength Index, and Golden Window |
| `POST` | `/api/routines/generate` | Persona-based exposure-minimized daily routine |
| `POST` | `/api/routines/transit-alternatives` | Low-emission transit comparisons and route adjustments |
| `POST` | `/api/hacks/iaq-advisor` | DIY air cleaner CADR calculation and draft proofing hacks |
| `GET` | `/api/hacks/corsi-rosenthal-blueprint` | Verified Bill of Materials and assembly guidelines |
| `GET` | `/api/hacks/ventilation-window` | Real-time window flushing advice |
| `POST` | `/api/vision/inspect` | Base64 multimodal visual leak and seal inspection |
| `POST` | `/api/vision/upload-inspect` | Multipart file upload visual inspection |
| `POST` | `/api/impact/calculate-dose` | Exact mathematical lung dose prevented and CO2 saved |
| `GET` | `/api/impact/community-offset` | Collective community exposure reduction and offsets |

---

## Running Locally

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and optionally set your Gemini API key:
```bash
cp .env.example .env
```

### 3. Start the Server
```bash
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```
Interactive Swagger docs: `http://localhost:8000/docs`

---

## Running Test Suite

```bash
pytest backend/tests/ -v
```
All tests cover unit math, external mock resilience, security headers, XSS sanitization, and API endpoints.
