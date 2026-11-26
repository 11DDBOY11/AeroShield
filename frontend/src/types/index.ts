export type AQILevel = 'good' | 'moderate' | 'sensitive' | 'unhealthy' | 'very-unhealthy' | 'hazardous';

export interface LocationData {
  id: string;
  city: string;
  country: string;
  currentAqi: number;
  pm25: number; // ug/m3
  pm10: number; // ug/m3
  no2: number; // ppb
  temperature: number; // C
  humidity: number; // %
  inversionStrength: 'Low' | 'Moderate' | 'Severe' | 'Critical';
  ventilationWindow: {
    start: string;
    end: string;
    status: 'Upcoming' | 'Active' | 'Closed';
    peakCleanHour: string;
    minAqi: number;
  };
  latitude?: number;
  longitude?: number;
  inversionIndex?: number;
  boundaryLayerM?: number;
  isLive?: boolean;
  lastUpdated?: string;
  dataSource?: string;
}

export interface HourlyForecast {
  hour: string; // e.g. "06:00"
  aqi: number;
  pm25: number;
  inversionTrapped: boolean;
  isVentilationWindow: boolean;
  recommendedAction: 'Seal Indoors' | 'Filter High' | 'Golden Window (Ventilate)' | 'Pre-seal';
}

export type PersonaType = 'child' | 'asthmatic' | 'elderly' | 'commuter' | 'athlete';

export interface PersonaInfo {
  id: PersonaType;
  name: string;
  icon: string;
  description: string;
  breathingRateM3H: number; // m3/hour baseline
  vulnerabilityFactor: number; // relative risk multiplier
  priorityAdvice: string;
}

export interface RoutineItem {
  id: string;
  time: string;
  originalActivity: string;
  originalExposureUgd: number; // PM2.5 dose in ug
  optimizedActivity: string;
  optimizedExposureUgd: number;
  lowEmissionOption: string;
  co2SavedGrams: number;
  gearRequired: string;
  badge: 'Critical Shift' | 'Low-Emission Transit' | 'Ventilation Timing' | 'Indoor Safe';
}

export interface DIYHack {
  id: string;
  title: string;
  category: 'Purification' | 'Sealing' | 'Ventilation' | 'Humidity';
  costTier: '$' | '$$' | '$$$';
  effectiveness: string; // e.g. "85% PM2.5 reduction"
  prepTime: string;
  supplies: string[];
  steps: string[];
  proTip: string;
  scientificPrinciple: string;
}

export interface VisionInspectionSample {
  id: string;
  name: string;
  category: 'filter' | 'window' | 'corsi-rosenthal' | 'room';
  imageUrl: string;
  mockAnalysis: {
    status: 'Optimal' | 'Degraded' | 'Severe Leakage' | 'Requires Replacement';
    confidence: number; // 0-100%
    findings: string[];
    pm25EfficiencyPenalty: string;
    actionItems: string[];
    diyFixRecommendation: string;
  };
}

export interface ImpactStats {
  pm25AvoidedUg: number;
  cigarettesEquivalentAvoided: number;
  co2SavedKg: number;
  cleanAirHoursGained: number;
}
