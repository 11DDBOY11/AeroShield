import React, { useState } from 'react';
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

  return (
    <div className={`min-h-screen flex flex-col ${colorblindMode ? 'colorblind-enhanced' : ''}`}>
      <Navbar
        currentLocation={currentLocation}
        onSelectLocation={setCurrentLocation}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        colorblindMode={colorblindMode}
        onToggleColorblind={() => setColorblindMode((prev) => !prev)}
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
