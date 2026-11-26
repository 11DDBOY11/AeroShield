# AeroShield AI - Frontend Application

> **Winter Smog & Urban Air Pollution Assistant**  
> Built with React 18, Vite, TypeScript, Tailwind CSS, and Vitest.  
> Fully WCAG 2.1 AA Compliant with universal color-blind dual-encoding indicators.

---

## 🌟 Key Features

### 1. Real-time AQI & Winter Smog Barometer
- **Atmospheric Hotspots**: Delhi NCR, Lahore, Beijing, Salt Lake City Basin, and London.
- **24-Hour Thermal Inversion Curve**: Visualizes nocturnal ground inversion trapping toxic particulate matter at dawn, alongside the **Golden Ventilation Window** (12:30 PM – 3:45 PM) when solar warming breaks the cold cap and dilutes ground smog to the day's lowest AQI.
- **Actionable Ventilation Protocols**: Clear operational guidance on when to hermetically seal windows vs. when to conduct short cross-breeze fresh air flushes.

### 2. Personalized Daily Routine Generator
- Customizes schedule recommendations across 5 sensitive urban personas:
  - **Children (Ages 5-12)**: Mitigates high breathing frequency and proximity to ground-level tailpipe exhaust.
  - **Asthmatics / Respiratory Sensitive**: Minimizes airway hyper-reactivity, NO2 spikes, and micro-inflammation.
  - **Seniors (65+)**: Prevents cardiovascular vasoconstriction by shifting dawn walks to midday.
  - **Daily Urban Commuters**: Shields against open auto-rickshaw exhaust corridors and traffic jams.
  - **Outdoor Athletes**: High-ventilation endurance runners shielded from deep alveolar deposition.
- **Hour-by-Hour Comparative Schedule**: Baseline exposure vs. AeroShield AI optimized exposure in micrograms (µg) of PM2.5 lung dose prevented.

### 3. Low-Emission Alternatives & Routine Optimizer
- Compares transit and activity options:
  - Solo Gasoline Car
  - Electric Rapid Transit Metro
  - Shared Electric Cab (EV)
  - E-Bike + Fitted N95 Mask
- Interactive parameters: One-way commute distance, ambient smog levels, mask filtration efficiency, and vehicle cabin air recirculation mode.
- Quantifies trip-by-trip PM2.5 inhaled (µg) and carbon footprint (g CO2).

### 4. DIY IAQ Hacks & Multimodal Vision Inspector
- **AI Multimodal Vision Room/Filter Inspector**:
  - Ingests test sample photos (saturated HEPA filters, window smog leakage gaps, DIY Corsi-Rosenthal boxes) or custom user uploads.
  - Generates structural diagnostic status (Optimal, Degraded, Severe Leakage, Requires Replacement), confidence scores, particulate efficiency penalties, and step-by-step DIY remediation.
- **Curated DIY Indoor Air Quality Hacks Library**:
  - **The Corsi-Rosenthal Air Purifier Box**: 4 MERV 13 filters + box fan yielding 500+ CADR (m³/h) at ~$60 (vs $500 commercial units).
  - **Precision Window Weatherstripping**: Stops stack-effect winter infiltration.
  - **The Golden Inversion Window Protocol**: Timed 15-minute cross-ventilation burst.
  - **Zero-Resuspension Wet Mopping & Microfiber Regimen**: Captures toxic PAH particulates without electrostatic aerosolization.

### 5. Direct Impact Visualizer & Lung Dose Dosimetry
- **Scientific Formula**:
  $$\text{Dose } (\mu\text{g}) = V_E \times C_{\text{PM2.5}} \times t \times (1 - \eta_{\text{filtration}})$$
- **Berkeley Earth Equivalency**: Converts prevented particulate matter mass directly into avoided cigarette smoke equivalents ($1\text{ cigarette} \approx 22\,\mu\text{g PM2.5}$).
- **Interactive Multi-parameter Sliders**: Track household members protected, smog season days, purifier type, and low-emission transit choices.

---

## ♿ Accessibility (WCAG 2.1 AA)
- **Skip to Content Link**: Instant keyboard access to main content (`#main-content`).
- **Colorblind Aid Toggle**: High-contrast mode activating unique geometric textures (stripes, grids, crosshatches, solid dots) and descriptive text badges alongside colors.
- **ARIA Semantics**: Full `role="tablist"`, `role="tab"`, `role="tabpanel"`, `role="radiogroup"`, `aria-selected`, and `aria-live` announcements.
- **Contrast Ratios**: Verified contrast compliant with AAA/AA dark-mode standards on slate-950 surfaces.

---

## 🛠️ Verification & Build Commands

```bash
# Install dependencies
npm install

# Run Vitest test suite
npm run test

# Build production bundle with TypeScript check
npm run build
```
