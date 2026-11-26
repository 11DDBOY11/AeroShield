import React, { useState, useEffect, useCallback } from 'react';
import { HOTSPOT_LOCATIONS } from './data/mockData';
import { LocationData } from './types';
import { Navbar } from './components/Navbar';
import { BarometerView } from './components/BarometerView';
import { RoutineGeneratorView } from './components/RoutineGeneratorView';
import { RoutineOptimizerView } from './components/RoutineOptimizerView';
import { VisionInspectorView } from './components/VisionInspectorView';
import { ImpactVisualizerView } from './components/ImpactVisualizerView';
import { Footer } from './components/Footer';

export const App: React.FC = () => {
  const [currentLocation, setCurrentLocation] = useState<LocationData>(HOTSPOT_LOCATIONS[0]);
  const [activeTab, setActiveTab] = useState<string>('barometer');
  const [colorblindMode, setColorblindMode] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isLive, setIsLive] = useState<boolean>(true);

  const fetchLiveAirQuality = useCallback(async (loc: LocationData) => {
    setIsRefreshing(true);
    try {
      const lat = loc.latitude ?? 28.6139;
      const lon = loc.longitude ?? 77.2090;
      const apiUrl = `/api/aqi/current?latitude=${lat}&longitude=${lon}&city=${encodeURIComponent(loc.city)}`;
      
      const res = await fetch(apiUrl, { signal: AbortSignal.timeout(3500) }).catch(() => {
        // Retry with localhost:8000 if vite proxy isn't configured
        return fetch(`http://127.0.0.1:8000${apiUrl}`, { signal: AbortSignal.timeout(3500) });
      });

      if (res.ok) {
        const data = await res.json();
        setCurrentLocation({
          ...loc,
          currentAqi: data.aqi,
          pm25: data.pollutants?.pm2_5 ?? loc.pm25,
          pm10: data.pollutants?.pm10 ?? loc.pm10,
          no2: data.pollutants?.no2 ?? loc.no2,
          temperature: data.inversion?.surface_temp_c ?? loc.temperature,
          boundaryLayerM: Math.round(data.inversion?.boundary_layer_height_m ?? (loc.boundaryLayerM || 220)),
          inversionIndex: Math.round(data.inversion?.inversion_strength_index ?? (loc.inversionIndex || 75)),
          inversionStrength:
            data.inversion?.ventilation_safety_status === 'hazardous'
              ? 'Critical'
              : data.inversion?.ventilation_safety_status === 'caution'
                ? 'Severe'
                : 'Moderate',
          ventilationWindow: {
            ...loc.ventilationWindow,
            start: data.inversion?.golden_ventilation_window?.start_time || loc.ventilationWindow.start,
            end: data.inversion?.golden_ventilation_window?.end_time || loc.ventilationWindow.end,
          },
          isLive: true,
          dataSource: data.data_source || 'Live Open-Meteo & CAMS Telemetry',
          lastUpdated: new Date().toLocaleTimeString(),
        });
        setIsLive(true);
      } else {
        setIsLive(false);
      }
    } catch {
      // Backend not currently reachable; keep baseline values gracefully
      setIsLive(false);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Sync on initial load and when switching cities
  useEffect(() => {
    fetchLiveAirQuality(currentLocation);
  }, []);

  const handleSelectLocation = (loc: LocationData) => {
    setCurrentLocation(loc);
    fetchLiveAirQuality(loc);
  };

  return (
    <div className={`min-h-screen flex flex-col bg-slate-950 text-slate-100 ${colorblindMode ? 'colorblind-enhanced' : ''}`}>
      <Navbar
        currentLocation={currentLocation}
        onSelectLocation={handleSelectLocation}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        colorblindMode={colorblindMode}
        onToggleColorblind={() => setColorblindMode((prev) => !prev)}
        isLive={isLive}
        isRefreshing={isRefreshing}
        onRefresh={() => fetchLiveAirQuality(currentLocation)}
      />

      <main id="main-content" tabIndex={-1} className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 focus:outline-none">
        {/* Tab Panels */}
        <div
          role="tabpanel"
          id="panel-barometer"
          aria-labelledby="tab-barometer"
          hidden={activeTab !== 'barometer'}
        >
          {activeTab === 'barometer' && (
            <BarometerView
              location={currentLocation}
              colorblindMode={colorblindMode}
            />
          )}
        </div>

        <div
          role="tabpanel"
          id="panel-routines"
          aria-labelledby="tab-routines"
          hidden={activeTab !== 'routines'}
        >
          {activeTab === 'routines' && (
            <RoutineGeneratorView
              colorblindMode={colorblindMode}
            />
          )}
        </div>

        <div
          role="tabpanel"
          id="panel-optimizer"
          aria-labelledby="tab-optimizer"
          hidden={activeTab !== 'optimizer'}
        >
          {activeTab === 'optimizer' && <RoutineOptimizerView />}
        </div>

        <div
          role="tabpanel"
          id="panel-inspector"
          aria-labelledby="tab-inspector"
          hidden={activeTab !== 'inspector'}
        >
          {activeTab === 'inspector' && <VisionInspectorView />}
        </div>

        <div
          role="tabpanel"
          id="panel-impact"
          aria-labelledby="tab-impact"
          hidden={activeTab !== 'impact'}
        >
          {activeTab === 'impact' && <ImpactVisualizerView />}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default App;
