import React, { useState } from 'react';
import { LocationData } from '../types';
import { HOURLY_24H_CURVE } from '../data/mockData';
import { AqiBadge } from './AqiBadge';
import {
  Wind,
  Sun,
  Lock,
  Unlock,
  AlertCircle,
  Thermometer,
  Droplets,
  Activity,
  Layers,
  Sparkles,
} from 'lucide-react';

interface BarometerViewProps {
  location: LocationData;
  colorblindMode: boolean;
}

export const BarometerView: React.FC<BarometerViewProps> = ({
  location,
  colorblindMode,
}) => {
  const [hoveredHour, setHoveredHour] = useState<string | null>(null);

  // SVG Chart dimensions
  const svgWidth = 800;
  const svgHeight = 220;
  const paddingX = 40;
  const paddingY = 30;

  const maxAqi = 500;
  const chartWidth = svgWidth - paddingX * 2;
  const chartHeight = svgHeight - paddingY * 2;

  const points = HOURLY_24H_CURVE.map((item, index) => {
    const x = paddingX + (index / (HOURLY_24H_CURVE.length - 1)) * chartWidth;
    const y = svgHeight - paddingY - (item.aqi / maxAqi) * chartHeight;
    return { x, y, item };
  });

  const pathD = points.reduce((acc, curr, idx) => {
    return idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
  }, '');

  // Find ventilation window indices
  const ventPoints = points.filter((p) => p.item.isVentilationWindow);
  const ventStartX = ventPoints[0]?.x || 0;
  const ventEndX = ventPoints[ventPoints.length - 1]?.x || 0;

  return (
    <div className="space-y-8 animate-fade-in relative">
      {/* Ambient Floating Air Breeze Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="air-particle w-64 h-64 top-10 left-1/4 animate-float-slow opacity-20" />
        <div className="air-particle w-96 h-96 top-1/2 right-10 animate-breeze opacity-15" />
      </div>

      {/* Top Banner: Inversion & Golden Ventilation Alert */}
      <section
        aria-labelledby="inversion-banner-title"
        className="rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/60 via-slate-900 to-sky-950/50 p-6 shadow-xl relative overflow-hidden ai-shimmer-border"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none animate-pulse-slow" />

        {/* Animated Breeze Wave SVG */}
        <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none opacity-20 overflow-hidden">
          <svg className="w-full h-full animate-breeze" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path
              d="M0,0 C150,90 350,-40 500,45 C650,130 900,10 1200,50 L1200,120 L0,120 Z"
              fill="url(#wave-gradient)"
            />
            <defs>
              <linearGradient id="wave-gradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="50%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#38bdf8" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                <Sun className="w-3.5 h-3.5 text-cyan-300" aria-hidden="true" />
                <span>Winter Thermal Inversion Tracker</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-950/70 border border-slate-700/80 text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 live-pulse-radar" />
                <span>{location.dataSource || 'Open-Meteo & CAMS Telemetry'}</span>
              </div>
            </div>
            <h2 id="inversion-banner-title" className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Golden Ventilation Window: {location.ventilationWindow.start} – {location.ventilationWindow.end}
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Nocturnal cooling traps toxic vehicular soot under a stagnant atmospheric cold lid. Between{' '}
              <span className="font-semibold text-cyan-300">{location.ventilationWindow.start}</span> and{' '}
              <span className="font-semibold text-cyan-300">{location.ventilationWindow.end}</span>, solar heating breaks the inversion layer, dropping AQI to day-low{' '}
              <strong className="text-emerald-400 font-mono">{location.ventilationWindow.minAqi}</strong>.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-700/80 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Unlock className="w-6 h-6" aria-hidden="true" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Recommended Action
                </span>
                <p className="text-base font-bold text-white">
                  Cross-Ventilate 20 mins
                </p>
                <span className="text-xs text-emerald-400 font-medium">
                  Peak Clean: {location.ventilationWindow.peakCleanHour}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-700/80 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <Lock className="w-6 h-6" aria-hidden="true" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Nocturnal Phase
                </span>
                <p className="text-base font-bold text-white">
                  Seal All Windows Tight
                </p>
                <span className="text-xs text-rose-400 font-medium">
                  6:00 PM – 11:30 AM
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Barometer Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <AqiBadge
            aqi={location.currentAqi}
            size="lg"
            showAdvice={true}
            colorblindMode={colorblindMode}
          />
        </div>

        {/* Inversion Severity Card */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                Thermal Inversion
              </span>
              <span className="px-2 py-0.5 rounded text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                {location.inversionStrength}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" aria-hidden="true" />
              Atmospheric Cold Cap
            </h3>
            <p className="text-xs text-slate-400 leading-normal">
              Surface temperature is {location.temperature}°C with {location.humidity}% humidity. Planetary Boundary Layer is capped at {location.boundaryLayerM || 210}m with Inversion Trap Index of {location.inversionIndex ? `${location.inversionIndex}/100` : '82/100'}. Ground emissions cannot disperse vertically.
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-2 gap-3 text-center">
            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
              <span className="text-[11px] text-slate-400 block">PM2.5</span>
              <span className="text-lg font-bold text-white font-mono">{location.pm25}</span>
              <span className="text-[10px] text-slate-500 block">µg/m³</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
              <span className="text-[11px] text-slate-400 block">PM10</span>
              <span className="text-lg font-bold text-white font-mono">{location.pm10}</span>
              <span className="text-[10px] text-slate-500 block">µg/m³</span>
            </div>
          </div>
        </div>
      </div>

      {/* Atmospheric Micro-sensors Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Thermometer className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium">Ambient Temp</span>
            <span className="text-lg font-bold text-white font-mono">{location.temperature}°C</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Droplets className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium">Winter Humidity</span>
            <span className="text-lg font-bold text-white font-mono">{location.humidity}%</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Activity className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium">NO2 Nitrogen Dioxide</span>
            <span className="text-lg font-bold text-white font-mono">{location.no2} ppb</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Wind className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium">Inversion Lift AQI</span>
            <span className="text-lg font-bold text-emerald-400 font-mono">{location.ventilationWindow.minAqi}</span>
          </div>
        </div>
      </div>

      {/* 24-Hour Inversion Curve Visualization */}
      <section
        aria-labelledby="inversion-curve-heading"
        className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 id="inversion-curve-heading" className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" aria-hidden="true" />
              24-Hour Winter Smog & Atmospheric Inversion Curve
            </h3>
            <p className="text-xs text-slate-400">
              Notice how ground-level AQI peaks at dawn (trapped cold smog) and drops dramatically at midday during solar ventilation window.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-500/40 border border-emerald-400" />
              <span className="text-emerald-300">Golden Ventilation Window</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-rose-500/30 border border-rose-500" />
              <span className="text-rose-300">Inversion Trapped (Seal)</span>
            </div>
          </div>
        </div>

        {/* Accessible SVG Chart */}
        <div className="overflow-x-auto pb-2">
          <div className="min-w-[680px]">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-auto overflow-visible select-none"
              role="img"
              aria-label="24-hour smog inversion curve chart showing peak pollution at dawn and lowest pollution between 12 PM and 3 PM."
            >
              {/* Golden Window Highlight Zone */}
              <rect
                x={ventStartX - 25}
                y={paddingY}
                width={ventEndX - ventStartX + 50}
                height={chartHeight}
                fill="url(#goldenWindowGradient)"
                opacity="0.35"
                rx="6"
              />

              {/* Gradients */}
              <defs>
                <linearGradient id="goldenWindowGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.2" />
                </linearGradient>
                <linearGradient id="curveGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="45%" stopColor="#f59e0b" />
                  <stop offset="55%" stopColor="#10b981" />
                  <stop offset="70%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#ef4444" />
                </linearGradient>
              </defs>

              {/* Horizontal gridlines */}
              {[100, 200, 300, 400].map((level) => {
                const y = svgHeight - paddingY - (level / maxAqi) * chartHeight;
                return (
                  <g key={level}>
                    <line
                      x1={paddingX}
                      y1={y}
                      x2={svgWidth - paddingX}
                      y2={y}
                      stroke="#334155"
                      strokeDasharray="4 4"
                      strokeWidth="1"
                    />
                    <text
                      x={paddingX - 10}
                      y={y + 4}
                      fill="#64748b"
                      fontSize="11"
                      textAnchor="end"
                      fontFamily="monospace"
                    >
                      {level}
                    </text>
                  </g>
                );
              })}

              {/* Inversion curve line */}
              <path
                d={pathD}
                fill="none"
                stroke="url(#curveGradient)"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data points */}
              {points.map(({ x, y, item }) => {
                const isHovered = hoveredHour === item.hour;
                const isVent = item.isVentilationWindow;
                return (
                  <g key={item.hour}>
                    <circle
                      cx={x}
                      cy={y}
                      r={isHovered ? 7 : isVent ? 5 : 4}
                      fill={isVent ? '#10b981' : '#ef4444'}
                      stroke="#0f172a"
                      strokeWidth="2"
                      className="cursor-pointer transition-all"
                      onMouseEnter={() => setHoveredHour(item.hour)}
                      onMouseLeave={() => setHoveredHour(null)}
                      tabIndex={0}
                      role="button"
                      aria-label={`${item.hour}: AQI ${item.aqi}, ${item.recommendedAction}`}
                    />
                    {/* Hour labels */}
                    <text
                      x={x}
                      y={svgHeight - 8}
                      fill={isVent ? '#34d399' : '#94a3b8'}
                      fontSize="11"
                      fontWeight={isVent ? 'bold' : 'normal'}
                      textAnchor="middle"
                    >
                      {item.hour}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Interactive Hover Point Details */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-cyan-400" aria-hidden="true" />
            <span className="text-sm font-semibold text-slate-200">
              Protocol Guidance:
            </span>
            <span className="text-sm text-slate-300">
              {hoveredHour
                ? `Hour ${hoveredHour}: Action is "${HOURLY_24H_CURVE.find((c) => c.hour === hoveredHour)?.recommendedAction}" (AQI: ${HOURLY_24H_CURVE.find((c) => c.hour === hoveredHour)?.aqi})`
                : 'Hover or focus on any hour above to view exact atmospheric advice.'}
            </span>
          </div>

          <div className="text-xs text-slate-400 font-mono">
            Scientific Source: Atmospheric Boundary Layer Inversion Model
          </div>
        </div>
      </section>
    </div>
  );
};
