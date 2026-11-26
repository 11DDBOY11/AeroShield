import React from 'react';
import { HOTSPOT_LOCATIONS } from '../data/mockData';
import { LocationData } from '../types';
import { Shield, Eye, MapPin, Wind, Sparkles, RotateCw } from 'lucide-react';

interface NavbarProps {
  currentLocation: LocationData;
  onSelectLocation: (loc: LocationData) => void;
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  colorblindMode: boolean;
  onToggleColorblind: () => void;
  isLive?: boolean;
  isRefreshing?: boolean;
  onRefresh?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentLocation,
  onSelectLocation,
  activeTab,
  onSelectTab,
  colorblindMode,
  onToggleColorblind,
  isLive = true,
  isRefreshing = false,
  onRefresh,
}) => {
  const tabs = [
    { id: 'barometer', label: 'Smog Barometer & Inversion', icon: Wind },
    { id: 'routines', label: 'Personalized Routines', icon: Sparkles },
    { id: 'optimizer', label: 'Low-Emission Optimizer', icon: Shield },
    { id: 'inspector', label: 'DIY Hacks & Vision Inspector', icon: Eye },
    { id: 'impact', label: 'Direct Impact & Lung Dose', icon: MapPin },
  ];

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Ambient Atmospheric Breeze Stream */}
      <div className="absolute top-0 left-0 right-0 h-32 overflow-hidden pointer-events-none z-0 opacity-40">
        <svg className="w-full h-full animate-breeze" viewBox="0 0 1440 120" fill="none" preserveAspectRatio="none">
          <path
            d="M0,32L60,42.7C120,53,240,75,360,74.7C480,75,600,53,720,48C840,43,960,53,1080,64C1200,75,1320,85,1380,90.7L1440,96L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z"
            fill="url(#breeze-gradient)"
          />
          <defs>
            <linearGradient id="breeze-gradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.15" />
              <stop offset="50%" stopColor="#10b981" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.15" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-sky-400 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 animate-glow-pulse">
                <Shield className="w-6 h-6" aria-hidden="true" />
              </div>
              <div>
                <span className="font-extrabold text-xl tracking-tight text-white flex items-center gap-1.5">
                  AeroShield <span className="text-cyan-400 font-mono text-sm px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/60 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-cyan-300" /> AI
                  </span>
                </span>
                <p className="text-xs text-slate-400 hidden sm:block">
                  Winter Smog & Urban Inversion Shield
                </p>
              </div>
            </div>

            {/* Controls: Location Selector + Live Radar + Colorblind Mode */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Location Selector */}
              <div className="relative flex items-center">
                <MapPin className="w-4 h-4 text-cyan-400 absolute left-3 pointer-events-none" aria-hidden="true" />
                <label htmlFor="hotspot-select" className="sr-only">
                  Select Air Quality Hotspot City
                </label>
                <select
                  id="hotspot-select"
                  value={currentLocation.id}
                  onChange={(e) => {
                    const found = HOTSPOT_LOCATIONS.find((loc) => loc.id === e.target.value);
                    if (found) onSelectLocation(found);
                  }}
                  className="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg pl-9 pr-8 py-1.5 focus:ring-2 focus:ring-cyan-500 focus:outline-none cursor-pointer hover:border-slate-600 transition"
                >
                  <optgroup label="🇮🇳 Indian Winter Smog Hubs">
                    {HOTSPOT_LOCATIONS.filter((l) => l.country === 'India').map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.city} - AQI {loc.currentAqi}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="🌍 Global Inversion Hotspots">
                    {HOTSPOT_LOCATIONS.filter((l) => l.country !== 'India').map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.city} ({loc.country}) - AQI {loc.currentAqi}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {/* Live Telemetry Status Pill */}
              <div className="hidden lg:flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950/70 border border-emerald-500/40 text-emerald-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 live-pulse-radar" aria-hidden="true" />
                  <span>{isLive ? 'Live Sensor Sync' : 'Cached Model'}</span>
                </div>
                {onRefresh && (
                  <button
                    type="button"
                    onClick={onRefresh}
                    disabled={isRefreshing}
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-cyan-300 hover:bg-slate-700 border border-slate-700 transition"
                    title="Refresh Live Atmospheric Telemetry"
                    aria-label="Refresh live atmospheric data"
                  >
                    <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
                  </button>
                )}
              </div>

              {/* Colorblind Aid Toggle */}
              <button
                type="button"
                onClick={onToggleColorblind}
                aria-pressed={colorblindMode}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                  colorblindMode
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750 hover:text-white'
                }`}
                title="Toggle High-Contrast Pattern Aid for Color Blindness"
              >
                <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">{colorblindMode ? 'Colorblind Aid ON' : 'Colorblind Aid'}</span>
                <span className="sm:hidden">A11y</span>
              </button>
            </div>
          </div>

          {/* Navigation Bar */}
          <nav
            role="tablist"
            aria-label="AeroShield AI Feature Sections"
            className="flex space-x-1 sm:space-x-4 overflow-x-auto py-2 scrollbar-none border-t border-slate-800/60"
          >
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  id={`tab-${tab.id}`}
                  aria-selected={isActive}
                  aria-controls={`panel-${tab.id}`}
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => onSelectTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} aria-hidden="true" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>
    </>
  );
};
