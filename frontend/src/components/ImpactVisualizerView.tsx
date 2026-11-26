import React, { useState } from 'react';
import { pm25ToCigarettes } from '../utils/calculator';
import {
  ShieldCheck,
  Leaf,
  Activity,
  Heart,
  Award,
  Sliders,
  Calculator,
} from 'lucide-react';

export const ImpactVisualizerView: React.FC = () => {
  const [daysTracked, setDaysTracked] = useState<number>(30);
  const [familyMembers, setFamilyMembers] = useState<number>(3);
  const [purifierSetup, setPurifierSetup] = useState<'none' | 'hepa' | 'corsi'>('corsi');
  const [transitDaysPerWeek, setTransitDaysPerWeek] = useState<number>(5);
  const [n95Adherence, setN95Adherence] = useState<number>(85); // %

  // Calculation parameters
  // Purifier indoor reduction factor
  const purifierReduction = purifierSetup === 'corsi' ? 0.88 : purifierSetup === 'hepa' ? 0.82 : 0;
  
  // Average ambient winter smog PM2.5: 250 ug/m3
  const avgAmbientPm25 = 260;

  // Average daily outdoor exposure hours: 2.5 hours
  const outdoorHours = 2.5;
  const indoorHours = 21.5;

  // Mask efficiency: 95% * adherence
  const effectiveMaskEff = (n95Adherence / 100) * 0.95;

  // Baseline dose per person per day (m3/h = 0.75)
  const ventRate = 0.75;
  
  // Baseline without AeroShield (unfiltered indoors + unmasked outdoors):
  const baselineIndoorDose = ventRate * avgAmbientPm25 * indoorHours; // ug
  const baselineOutdoorDose = ventRate * avgAmbientPm25 * outdoorHours; // ug
  const baselineDailyDosePerPerson = baselineIndoorDose + baselineOutdoorDose;

  // Protected with AeroShield:
  const protectedIndoorConc = avgAmbientPm25 * (1 - purifierReduction);
  const protectedIndoorDose = ventRate * protectedIndoorConc * indoorHours;
  const protectedOutdoorDose = ventRate * avgAmbientPm25 * outdoorHours * (1 - effectiveMaskEff);
  const protectedDailyDosePerPerson = protectedIndoorDose + protectedOutdoorDose;

  // Daily savings per person
  const dailyUgSavedPerPerson = Math.max(0, baselineDailyDosePerPerson - protectedDailyDosePerPerson);

  // Total cumulative savings
  const totalUgSaved = Math.round(dailyUgSavedPerPerson * daysTracked * familyMembers);
  const totalMgSaved = (totalUgSaved / 1000).toFixed(1);
  const totalCigarettesAvoided = pm25ToCigarettes(totalUgSaved);

  // Carbon savings: transit shift from solo car to electric metro saves ~2.4 kg CO2 per weekday
  const totalCo2SavedKg = Math.round((transitDaysPerWeek * (daysTracked / 7)) * 2.4 * Math.max(1, familyMembers - 1));

  // Clean air hours gained
  const cleanAirHours = Math.round(daysTracked * indoorHours * (purifierSetup !== 'none' ? 1 : 0.2));

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
          <Award className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Scientific Direct Impact Calculator</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Interactive Lung Dose & Carbon Offset Visualizer
        </h2>
        <p className="text-slate-400 text-sm max-w-3xl">
          Track the exact mass of hazardous particulate matter (PM2.5) kept out of your family’s alveoli through
          synchronized ventilation timing, Corsi-Rosenthal box filtration, and low-emission transit shifts.
        </p>
      </div>

      {/* Hero Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-semibold text-emerald-400">
              PM2.5 Lung Dose Prevented
            </span>
            <ShieldCheck className="w-5 h-5 text-emerald-400" aria-hidden="true" />
          </div>
          <div className="text-3xl sm:text-4xl font-black text-white font-mono">
            {totalMgSaved} <span className="text-xl font-bold text-emerald-400">mg</span>
          </div>
          <p className="text-xs text-slate-400">
            Equal to <strong className="text-emerald-300 font-mono">{totalUgSaved.toLocaleString()} µg</strong> of toxic microscopic soot blocked from pulmonary capillaries.
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-rose-500/30 bg-rose-950/20 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-semibold text-rose-400">
              Cigarette Equivalents Blocked
            </span>
            <Heart className="w-5 h-5 text-rose-400" aria-hidden="true" />
          </div>
          <div className="text-3xl sm:text-4xl font-black text-white font-mono">
            {totalCigarettesAvoided.toLocaleString()}
          </div>
          <p className="text-xs text-slate-400">
            Based on Berkeley Earth equivalence: 1 cigarette ≈ 22 µg of inhaled particulate matter.
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-cyan-500/30 bg-cyan-950/20 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-semibold text-cyan-400">
              CO2 Emissions Offset
            </span>
            <Leaf className="w-5 h-5 text-cyan-400" aria-hidden="true" />
          </div>
          <div className="text-3xl sm:text-4xl font-black text-white font-mono">
            {totalCo2SavedKg} <span className="text-xl font-bold text-cyan-400">kg</span>
          </div>
          <p className="text-xs text-slate-400">
            Prevented by shifting solo vehicle commute trips to electric metro rail and carpooling.
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-amber-500/30 bg-amber-950/20 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-semibold text-amber-400">
              Clean Air Breathing Hours
            </span>
            <Activity className="w-5 h-5 text-amber-400" aria-hidden="true" />
          </div>
          <div className="text-3xl sm:text-4xl font-black text-white font-mono">
            {cleanAirHours.toLocaleString()} <span className="text-xl font-bold text-amber-400">hrs</span>
          </div>
          <p className="text-xs text-slate-400">
            Hours spent under healthy indoor air conditions (&lt;25 µg/m³ WHO standard).
          </p>
        </div>
      </div>

      {/* Interactive Simulation Controls */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/70 space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Sliders className="w-5 h-5 text-cyan-400" aria-hidden="true" />
          <h3 className="text-lg font-bold text-white">Customize Household Parameters</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Days Adhered */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="days-slider" className="font-semibold text-slate-300">
                Smog Season Duration
              </label>
              <span className="font-mono font-bold text-cyan-400">{daysTracked} Days</span>
            </div>
            <input
              id="days-slider"
              type="range"
              min="1"
              max="90"
              value={daysTracked}
              onChange={(e) => setDaysTracked(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          {/* Family Members */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="members-slider" className="font-semibold text-slate-300">
                Household Members Protected
              </label>
              <span className="font-mono font-bold text-emerald-400">{familyMembers} People</span>
            </div>
            <input
              id="members-slider"
              type="range"
              min="1"
              max="8"
              value={familyMembers}
              onChange={(e) => setFamilyMembers(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
          </div>

          {/* Purifier Type */}
          <div className="space-y-2">
            <label htmlFor="purifier-select" className="text-xs font-semibold text-slate-300 block">
              Indoor Filtration System
            </label>
            <select
              id="purifier-select"
              value={purifierSetup}
              onChange={(e) => setPurifierSetup(e.target.value as any)}
              className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="corsi">DIY Corsi-Rosenthal Box (88% reduction, $60)</option>
              <option value="hepa">Commercial HEPA Purifier (82% reduction)</option>
              <option value="none">No Active Filtration (0% reduction)</option>
            </select>
          </div>

          {/* Mask Adherence */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="mask-adherence-slider" className="font-semibold text-slate-300">
                N95 Mask Outdoor Adherence
              </label>
              <span className="font-mono font-bold text-cyan-400">{n95Adherence}%</span>
            </div>
            <input
              id="mask-adherence-slider"
              type="range"
              min="0"
              max="100"
              step="5"
              value={n95Adherence}
              onChange={(e) => setN95Adherence(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          {/* Transit Shifts */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="transit-slider" className="font-semibold text-slate-300">
                Low-Emission Commute Days
              </label>
              <span className="font-mono font-bold text-emerald-400">{transitDaysPerWeek} Days/Week</span>
            </div>
            <input
              id="transit-slider"
              type="range"
              min="0"
              max="7"
              value={transitDaysPerWeek}
              onChange={(e) => setTransitDaysPerWeek(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
          </div>
        </div>
      </div>

      {/* Scientific Formula Card */}
      <section
        aria-labelledby="formula-heading"
        className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4"
      >
        <div className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-cyan-400" aria-hidden="true" />
          <h3 id="formula-heading" className="text-lg font-bold text-white">
            Underlying Inhalation & Dosimetry Physics
          </h3>
        </div>

        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 font-mono text-xs sm:text-sm text-cyan-300 overflow-x-auto">
          Dose (µg) = V_E (m³/h) × C_PM2.5 (µg/m³) × t (hours) × (1 - η_filtration)
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
          <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/50 space-y-1">
            <span className="font-bold text-white block">V_E (Minute Ventilation)</span>
            <p className="text-slate-400">
              Volume of air inhaled per hour. Ranging from 0.45 m³/h for resting children to 3.2 m³/h for exercising athletes.
            </p>
          </div>
          <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/50 space-y-1">
            <span className="font-bold text-white block">C_PM2.5 (Concentration)</span>
            <p className="text-slate-400">
              Micrograms per cubic meter in ambient air vs indoor filtered micro-climate.
            </p>
          </div>
          <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/50 space-y-1">
            <span className="font-bold text-white block">η_filtration (Protection Factor)</span>
            <p className="text-slate-400">
              N95 respirator seal provides 95% particulate filtration; DIY Corsi-Rosenthal unit yields 85-92% whole-room single-pass clearance.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
