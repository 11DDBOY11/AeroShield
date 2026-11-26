import React from 'react';
import { HOTSPOT_LOCATIONS } from '../data/mockData';
import { LocationData } from '../types';
import { Shield, Eye, MapPin, Wind, Sparkles } from 'lucide-react';

interface NavbarProps {
  currentLocation: LocationData;
  onSelectLocation: (loc: LocationData) => void;
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  colorblindMode: boolean;
  onToggleColorblind: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentLocation,
  onSelectLocation,
  activeTab,
  onSelectTab,
  colorblindMode,
  onToggleColorblind,
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

      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-sky-400 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
                <Shield className="w-6 h-6" aria-hidden="true" />
              </div>
              <div>
                <span className="font-extrabold text-xl tracking-tight text-white flex items-center gap-1.5">
                  AeroShield <span className="text-cyan-400 font-mono text-sm px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/60">AI</span>
                </span>
                <p className="text-xs text-slate-400 hidden sm:block">
                  Winter Smog & Urban Inversion Shield
                </p>
              </div>
            </div>

            {/* Controls: Location Selector + Colorblind Mode */}
            <div className="flex items-center gap-3">
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
                  {HOTSPOT_LOCATIONS.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.city} ({loc.country}) - AQI {loc.currentAqi}
                    </option>
                  ))}
                </select>
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
                <span>{colorblindMode ? 'Colorblind Aid ON' : 'Colorblind Aid'}</span>
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
                  onClick={() => onSelectTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
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
