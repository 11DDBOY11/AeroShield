import { PersonaType } from '../types';

export const PERSONA_VENTILATION_RATES: Record<PersonaType, { resting: number; active: number; weight: number }> = {
  child: { resting: 0.35, active: 0.9, weight: 25 }, // m3/hour
  asthmatic: { resting: 0.55, active: 1.2, weight: 65 },
  elderly: { resting: 0.45, active: 0.8, weight: 60 },
  commuter: { resting: 0.6, active: 1.4, weight: 70 },
  athlete: { resting: 0.65, active: 3.2, weight: 70 },
};

/**
 * Calculates PM2.5 lung dose in micrograms (ug)
 * Formula: Dose (ug) = VentRate (m3/h) * Concentration (ug/m3) * Duration (h) * (1 - MaskEfficiency)
 */
export function calculateLungDose(
  ventRateM3H: number,
  pm25Concentration: number,
  durationHours: number,
  maskEfficiency: number = 0 // 0 to 1
): number {
  const dose = ventRateM3H * pm25Concentration * durationHours * (1 - maskEfficiency);
  return Math.round(dose * 10) / 10;
}

/**
 * Berkeley Earth equivalence: 1 cigarette ≈ 22 ug PM2.5 inhaled
 */
export function pm25ToCigarettes(pm25Ug: number): number {
  return Math.round((pm25Ug / 22) * 10) / 10;
}

/**
 * Calculate AQI classification and accessibility data
 */
export function getAQIClassification(aqi: number): {
  level: string;
  category: 'good' | 'moderate' | 'sensitive' | 'unhealthy' | 'very-unhealthy' | 'hazardous';
  bgClass: string;
  textClass: string;
  borderClass: string;
  ariaPattern: string;
  healthAdvice: string;
  iconName: string;
} {
  if (aqi <= 50) {
    return {
      level: 'Good',
      category: 'good',
      bgClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
      textClass: 'text-emerald-400',
      borderClass: 'border-emerald-500',
      ariaPattern: 'Solid circles pattern - Clean air',
      healthAdvice: 'Air quality is satisfactory. Ideal time for outdoor activity and continuous fresh ventilation.',
      iconName: 'ShieldCheck',
    };
  } else if (aqi <= 100) {
    return {
      level: 'Moderate',
      category: 'moderate',
      bgClass: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
      textClass: 'text-amber-400',
      borderClass: 'border-amber-500',
      ariaPattern: 'Diagonal stripes pattern - Acceptable quality',
      healthAdvice: 'Acceptable air quality. Unusually sensitive individuals should limit prolonged outdoor exertion.',
      iconName: 'Info',
    };
  } else if (aqi <= 150) {
    return {
      level: 'Unhealthy for Sensitive Groups',
      category: 'sensitive',
      bgClass: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
      textClass: 'text-orange-400',
      borderClass: 'border-orange-500',
      ariaPattern: 'Crosshatch pattern - Warning for children, seniors, asthmatics',
      healthAdvice: 'Children, active adults, and people with respiratory disease should reduce prolonged outdoor exertion.',
      iconName: 'AlertTriangle',
    };
  } else if (aqi <= 200) {
    return {
      level: 'Unhealthy',
      category: 'unhealthy',
      bgClass: 'bg-rose-500/20 text-rose-400 border-rose-500/40',
      textClass: 'text-rose-400',
      borderClass: 'border-rose-500',
      ariaPattern: 'Dense grid pattern - High risk for general public',
      healthAdvice: 'Everyone begins to experience health effects; sensitive groups experience more serious effects. Wear N95 outdoors.',
      iconName: 'AlertOctagon',
    };
  } else if (aqi <= 300) {
    return {
      level: 'Very Unhealthy',
      category: 'very-unhealthy',
      bgClass: 'bg-purple-500/20 text-purple-400 border-purple-500/40',
      textClass: 'text-purple-400',
      borderClass: 'border-purple-500',
      ariaPattern: 'Diamond mesh pattern - Severe smog alert',
      healthAdvice: 'Health alert: risk of health effects increased for everyone. Seal windows, run HEPA or DIY Corsi-Rosenthal boxes indoors.',
      iconName: 'Flame',
    };
  } else {
    return {
      level: 'Hazardous (Emergency Smog)',
      category: 'hazardous',
      bgClass: 'bg-rose-950/60 text-red-300 border-red-700',
      textClass: 'text-rose-300',
      borderClass: 'border-red-700',
      ariaPattern: 'Zig-zag hazard stripes pattern - Emergency conditions',
      healthAdvice: 'Health warnings of emergency conditions. The entire population is likely to be severely affected. Avoid all outdoor physical activity.',
      iconName: 'Biohazard',
    };
  }
}
