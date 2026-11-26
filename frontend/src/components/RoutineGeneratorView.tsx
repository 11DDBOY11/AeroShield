import React, { useState } from 'react';
import { PersonaType } from '../types';
import { PERSONAS, ROUTINE_DATABASE } from '../data/mockData';
import { pm25ToCigarettes } from '../utils/calculator';
import {
  Baby,
  HeartPulse,
  Activity,
  Briefcase,
  Dumbbell,
  CheckCircle2,
  Clock,
  Shield,
  Share2,
  Sparkles,
  Leaf,
  AlertTriangle,
} from 'lucide-react';

interface RoutineGeneratorViewProps {
  colorblindMode?: boolean;
}

export const RoutineGeneratorView: React.FC<RoutineGeneratorViewProps> = () => {
  const [selectedPersona, setSelectedPersona] = useState<PersonaType>('child');
  const [copySuccess, setCopySuccess] = useState(false);

  const personaObj = PERSONAS.find((p) => p.id === selectedPersona) || PERSONAS[0];
  const routines = ROUTINE_DATABASE[selectedPersona] || [];

  // Calculate total exposure saved for this routine
  const totalOriginalUg = routines.reduce((acc, curr) => acc + curr.originalExposureUgd, 0);
  const totalOptimizedUg = routines.reduce((acc, curr) => acc + curr.optimizedExposureUgd, 0);
  const totalUgSaved = Math.round(totalOriginalUg - totalOptimizedUg);
  const totalCo2SavedG = routines.reduce((acc, curr) => acc + curr.co2SavedGrams, 0);
  const percentReduced = Math.round(((totalOriginalUg - totalOptimizedUg) / totalOriginalUg) * 100);

  const getPersonaIcon = (id: PersonaType) => {
    switch (id) {
      case 'child':
        return <Baby className="w-5 h-5" aria-hidden="true" />;
      case 'asthmatic':
        return <HeartPulse className="w-5 h-5" aria-hidden="true" />;
      case 'elderly':
        return <Activity className="w-5 h-5" aria-hidden="true" />;
      case 'commuter':
        return <Briefcase className="w-5 h-5" aria-hidden="true" />;
      case 'athlete':
        return <Dumbbell className="w-5 h-5" aria-hidden="true" />;
    }
  };

  const handleCopyRoutine = () => {
    const text = routines
      .map(
        (r) =>
          `[${r.time}] Shifted: ${r.optimizedActivity} | Gear: ${r.gearRequired} | Dose Saved: ${Math.round(
            r.originalExposureUgd - r.optimizedExposureUgd
          )} ug`
      )
      .join('\n');

    navigator.clipboard?.writeText(
      `AeroShield AI Optimized Daily Routine for ${personaObj.name}:\n\n${text}\n\nTotal Daily PM2.5 Prevented: ${totalUgSaved} µg (${percentReduced}% exposure reduction).`
    );
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Description */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
          <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Generative AI Winter Routine Planner</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Personalized Daily Smog Shield Routine
        </h2>
        <p className="text-slate-400 text-sm max-w-3xl">
          Standard routines force sensitive lungs outdoors during the worst 7:00 AM – 10:00 AM nocturnal inversion trap.
          AeroShield dynamically rearranges high-exertion activities into the Golden Midday Ventilation Window.
        </p>
      </div>

      {/* Persona Selection Tabs */}
      <div
        role="radiogroup"
        aria-label="Select Family Persona"
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3"
      >
        {PERSONAS.map((p) => {
          const isSelected = selectedPersona === p.id;
          return (
            <button
              key={p.id}
              role="radio"
              aria-checked={isSelected}
              onClick={() => setSelectedPersona(p.id)}
              className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                isSelected
                  ? 'bg-cyan-500/15 border-cyan-400 text-white shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-400'
                  : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-850'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <div
                  className={`p-2 rounded-lg ${
                    isSelected ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-cyan-400'
                  }`}
                >
                  {getPersonaIcon(p.id)}
                </div>
                {isSelected && <CheckCircle2 className="w-4 h-4 text-cyan-400" aria-hidden="true" />}
              </div>
              <span className="font-bold text-sm block leading-tight">{p.name}</span>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Vent Rate: {p.breathingRateM3H} m³/h
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Persona Summary Card */}
      <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-semibold text-cyan-400">
              Vulnerability Profile: {personaObj.name}
            </span>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
              {personaObj.vulnerabilityFactor}x Exposure Risk
            </span>
          </div>
          <p className="text-sm text-slate-300">{personaObj.description}</p>
          <div className="flex items-center gap-1.5 text-xs text-amber-300 font-medium pt-1">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" aria-hidden="true" />
            <span>{personaObj.priorityAdvice}</span>
          </div>
        </div>

        {/* Aggregate Savings Pill */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-6">
          <div>
            <span className="text-xs text-slate-400 block">Daily Inhaled PM2.5 Prevented</span>
            <div className="text-2xl font-black text-emerald-400 font-mono">
              -{totalUgSaved} µg
            </div>
            <span className="text-[11px] text-slate-400">
              ≈ {pm25ToCigarettes(totalUgSaved)} cigarettes avoided/day
            </span>
          </div>
          <div className="h-10 w-px bg-slate-800" />
          <div>
            <span className="text-xs text-slate-400 block">Daily Reduction</span>
            <div className="text-2xl font-black text-cyan-400 font-mono">
              {percentReduced}%
            </div>
            <span className="text-[11px] text-slate-400">
              +{totalCo2SavedG}g CO2 saved
            </span>
          </div>
        </div>
      </div>

      {/* Routine Timeline Comparison */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-cyan-400" aria-hidden="true" />
            Comparative Hourly Exposure Schedule
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyRoutine}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              <Share2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{copySuccess ? 'Copied to Clipboard!' : 'Share Routine'}</span>
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {routines.map((item) => {
            const doseSaved = Math.round(item.originalExposureUgd - item.optimizedExposureUgd);
            return (
              <div
                key={item.id}
                className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 hover:border-slate-700 transition space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-slate-800 text-cyan-300 border border-slate-700">
                      {item.time}
                    </span>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                        item.badge === 'Critical Shift'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : item.badge === 'Ventilation Timing'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      }`}
                    >
                      {item.badge}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-400">Dose Avoided:</span>
                    <span className="font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">
                      -{doseSaved} µg PM2.5
                    </span>
                    {item.co2SavedGrams > 0 && (
                      <span className="font-mono font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/50 flex items-center gap-1">
                        <Leaf className="w-3 h-3" /> -{item.co2SavedGrams}g CO2
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Baseline / High Exposure */}
                  <div className="p-3.5 rounded-lg bg-rose-950/20 border border-rose-900/40 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-rose-400 uppercase tracking-wider">
                        Standard Baseline Activity
                      </span>
                      <span className="font-mono font-bold text-rose-300">
                        {item.originalExposureUgd} µg dose
                      </span>
                    </div>
                    <p className="text-sm text-slate-300">{item.originalActivity}</p>
                  </div>

                  {/* AeroShield Optimized Shift */}
                  <div className="p-3.5 rounded-lg bg-emerald-950/20 border border-emerald-800/40 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                        <Shield className="w-3.5 h-3.5" /> AeroShield Optimized Activity
                      </span>
                      <span className="font-mono font-bold text-emerald-300">
                        {item.optimizedExposureUgd} µg dose
                      </span>
                    </div>
                    <p className="text-sm text-slate-200 font-medium">{item.optimizedActivity}</p>
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                      <span className="text-slate-400">Gear:</span>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 font-semibold border border-slate-700">
                        {item.gearRequired}
                      </span>
                      {item.lowEmissionOption && (
                        <span className="text-cyan-300 italic">
                          ({item.lowEmissionOption})
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
