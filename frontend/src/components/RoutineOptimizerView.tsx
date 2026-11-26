import React, { useState } from 'react';
import { calculateLungDose, pm25ToCigarettes } from '../utils/calculator';
import {
  Car,
  Train,
  Bike,
  Users,
  Leaf,
  Zap,
} from 'lucide-react';

interface TransitMode {
  id: string;
  name: string;
  icon: any;
  cabinPm25Factor: number; // multiplier of outdoor PM2.5 in vehicle cabin
  co2GramsPerKm: number;
  speedKmh: number;
  exerciseMultiplier: number; // higher ventilation rate if pedaling/walking
  description: string;
}

const MODES: TransitMode[] = [
  {
    id: 'car-gas',
    name: 'Solo Gasoline Car',
    icon: Car,
    cabinPm25Factor: 0.75, // without high-grade HEPA cabin filter
    co2GramsPerKm: 192,
    speedKmh: 24, // winter traffic jam average
    exerciseMultiplier: 1.0,
    description: 'High idling emissions in stagnant cold air; traps exhaust in traffic queues.',
  },
  {
    id: 'metro',
    name: 'Electric Rapid Metro',
    icon: Train,
    cabinPm25Factor: 0.25, // sealed AC cars with industrial central filtration
    co2GramsPerKm: 28,
    speedKmh: 42,
    exerciseMultiplier: 1.1,
    description: 'Fastest transit corridor; bypasses ground thermal inversion smog.',
  },
  {
    id: 'carpool-ev',
    name: 'Shared Electric Cab (EV)',
    icon: Users,
    cabinPm25Factor: 0.4,
    co2GramsPerKm: 45,
    speedKmh: 26,
    exerciseMultiplier: 1.0,
    description: 'Shared footprint; zero tailpipe emissions trapping at street level.',
  },
  {
    id: 'ebike-n95',
    name: 'E-Bike + Fitted N95 Mask',
    icon: Bike,
    cabinPm25Factor: 0.05, // 95% mask filtration
    co2GramsPerKm: 6,
    speedKmh: 20,
    exerciseMultiplier: 1.6,
    description: 'Zero emissions; fitted N95 protects airways from ambient particulates.',
  },
];

export const RoutineOptimizerView: React.FC = () => {
  const [distanceKm, setDistanceKm] = useState<number>(14);
  const [ambientPm25, setAmbientPm25] = useState<number>(280);
  const [maskType, setMaskType] = useState<'none' | 'cloth' | 'n95'>('none');
  const [recircEnabled, setRecircEnabled] = useState<boolean>(true);

  // Mask filtration rates
  const maskEff = maskType === 'n95' ? 0.95 : maskType === 'cloth' ? 0.25 : 0;

  // Baseline resting ventilation rate: 0.7 m3/h
  const baseVentRate = 0.7;

  const modeResults = MODES.map((mode) => {
    const travelTimeHours = distanceKm / mode.speedKmh;
    const travelTimeMinutes = Math.round(travelTimeHours * 60);

    // If car and recirc is disabled, cabin factor jumps
    let effectiveCabinFactor = mode.cabinPm25Factor;
    if (mode.id === 'car-gas' && !recircEnabled) {
      effectiveCabinFactor = 0.95; // draws in bumper-to-bumper soot
    }

    // Inhalation concentration
    const cabinPm25 = ambientPm25 * effectiveCabinFactor;
    const ventRate = baseVentRate * mode.exerciseMultiplier;
    const lungDoseUg = calculateLungDose(ventRate, cabinPm25, travelTimeHours, maskEff);
    const co2TotalGrams = Math.round(distanceKm * mode.co2GramsPerKm);

    return {
      ...mode,
      travelTimeMinutes,
      lungDoseUg,
      co2TotalGrams,
      cigarettesEquiv: pm25ToCigarettes(lungDoseUg),
    };
  });

  const baselineCar = modeResults.find((m) => m.id === 'car-gas') || modeResults[0];
  const bestEco = modeResults.find((m) => m.id === 'metro') || modeResults[1];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
          <Leaf className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Low-Emission Transit & Exposure Optimizer</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Urban Commute & Activity Optimizer
        </h2>
        <p className="text-slate-400 text-sm max-w-3xl">
          Idling in winter traffic jams inside unsealed cars exposes commuters to extreme toxic ultrafine soot.
          Compare the health exposure and carbon footprint across transit modes in real time.
        </p>
      </div>

      {/* Interactive Control Panel */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-5 rounded-2xl border border-slate-800 bg-slate-900/70">
        {/* Distance Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <label htmlFor="distance-slider" className="font-semibold text-slate-300">
              One-Way Distance
            </label>
            <span className="font-mono font-bold text-cyan-400">{distanceKm} km</span>
          </div>
          <input
            id="distance-slider"
            type="range"
            min="2"
            max="40"
            step="1"
            value={distanceKm}
            onChange={(e) => setDistanceKm(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
        </div>

        {/* Ambient PM2.5 Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <label htmlFor="pm25-slider" className="font-semibold text-slate-300">
              Ambient PM2.5
            </label>
            <span className="font-mono font-bold text-rose-400">{ambientPm25} µg/m³</span>
          </div>
          <input
            id="pm25-slider"
            type="range"
            min="50"
            max="500"
            step="10"
            value={ambientPm25}
            onChange={(e) => setAmbientPm25(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-400"
          />
        </div>

        {/* Mask Protection */}
        <div className="space-y-2">
          <label htmlFor="mask-select" className="text-xs font-semibold text-slate-300 block">
            Personal Mask Protection
          </label>
          <select
            id="mask-select"
            value={maskType}
            onChange={(e) => setMaskType(e.target.value as any)}
            className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="none">No Mask (0% filtration)</option>
            <option value="cloth">Cloth / Bandana (25% filtration)</option>
            <option value="n95">N95 / FFP2 Tight-Seal (95% filtration)</option>
          </select>
        </div>

        {/* Cabin Recirculation Toggle */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 block">
            Car Cabin Air Mode
          </label>
          <button
            type="button"
            onClick={() => setRecircEnabled(!recircEnabled)}
            className={`w-full py-1.5 px-3 rounded-lg text-sm font-semibold border transition text-left flex items-center justify-between ${
              recircEnabled
                ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300'
                : 'bg-rose-500/15 border-rose-500/40 text-rose-300'
            }`}
          >
            <span>{recircEnabled ? 'Recirculation ON' : 'Fresh Intake (Smog In)'}</span>
            <span className="text-xs font-mono">
              {recircEnabled ? 'Filtered' : 'Toxic'}
            </span>
          </button>
        </div>
      </div>

      {/* Comparison Highlights Banner */}
      <div className="p-5 rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 to-slate-900 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-4 h-4" /> Recommended Shift: Solo Car → Metro Rapid Rail
          </span>
          <h3 className="text-xl font-bold text-white">
            Save {Math.round(baselineCar.lungDoseUg - bestEco.lungDoseUg)} µg PM2.5 Lung Dose and{' '}
            {((baselineCar.co2TotalGrams - bestEco.co2TotalGrams) / 1000).toFixed(2)} kg CO2 Every Trip!
          </h3>
          <p className="text-xs text-slate-400">
            Electric rail cabins feature sealed HEPA/pre-filtration HVAC with 4x cleaner air than idling traffic jams.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 uppercase block">Travel Time</span>
            <span className="text-lg font-bold text-white font-mono">
              {bestEco.travelTimeMinutes} min vs {baselineCar.travelTimeMinutes} min
            </span>
          </div>
        </div>
      </div>

      {/* Modes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {modeResults.map((mode) => {
          const Icon = mode.icon;
          const isWinner = mode.id === 'metro';
          return (
            <div
              key={mode.id}
              className={`rounded-xl border p-5 flex flex-col justify-between transition-all ${
                isWinner
                  ? 'border-emerald-500/50 bg-emerald-950/20 ring-1 ring-emerald-500/30 shadow-lg shadow-emerald-500/5'
                  : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div
                    className={`p-2.5 rounded-lg ${
                      isWinner ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </div>
                  {isWinner && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500 text-slate-950 uppercase tracking-wider">
                      Optimal
                    </span>
                  )}
                </div>

                <div>
                  <h4 className="font-bold text-base text-white">{mode.name}</h4>
                  <p className="text-xs text-slate-400 mt-0.5 leading-snug">{mode.description}</p>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Inhaled Dose:</span>
                  <span
                    className={`font-mono font-bold ${
                      mode.lungDoseUg > 50 ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    {mode.lungDoseUg} µg PM2.5
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Trip Emissions:</span>
                  <span className="font-mono font-bold text-cyan-300">
                    {mode.co2TotalGrams} g CO2
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Trip Duration:</span>
                  <span className="font-mono text-slate-200">
                    {mode.travelTimeMinutes} mins
                  </span>
                </div>

                {/* Progress bar of exposure relative to baseline */}
                <div className="space-y-1">
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full ${
                        isWinner ? 'bg-emerald-500' : mode.id === 'car-gas' ? 'bg-rose-500' : 'bg-cyan-500'
                      }`}
                      style={{
                        width: `${Math.min(100, Math.max(10, (mode.lungDoseUg / baselineCar.lungDoseUg) * 100))}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
