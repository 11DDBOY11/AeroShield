import { describe, it, expect } from 'vitest';
import {
  calculateLungDose,
  pm25ToCigarettes,
  getAQIClassification,
  PERSONA_VENTILATION_RATES,
} from '../utils/calculator';

describe('Scientific Air Quality & Dosimetry Calculators', () => {
  it('calculates accurate PM2.5 lung dose in micrograms', () => {
    // 0.6 m3/h ventilation rate, 100 ug/m3, 2 hours, 0% mask
    const dose = calculateLungDose(0.6, 100, 2, 0);
    expect(dose).toBe(120);

    // With 95% N95 mask: dose should drop to 5%
    const maskedDose = calculateLungDose(0.6, 100, 2, 0.95);
    expect(maskedDose).toBe(6);
  });

  it('converts PM2.5 dose to Berkeley Earth cigarette equivalents', () => {
    // 22 ug PM2.5 = 1 cigarette
    expect(pm25ToCigarettes(22)).toBe(1);
    expect(pm25ToCigarettes(44)).toBe(2);
    expect(pm25ToCigarettes(110)).toBe(5);
  });

  it('properly classifies AQI categories with accessible pattern tags', () => {
    const good = getAQIClassification(42);
    expect(good.category).toBe('good');
    expect(good.level).toBe('Good');

    const moderate = getAQIClassification(85);
    expect(moderate.category).toBe('moderate');

    const sensitive = getAQIClassification(135);
    expect(sensitive.category).toBe('sensitive');

    const unhealthy = getAQIClassification(180);
    expect(unhealthy.category).toBe('unhealthy');

    const veryUnhealthy = getAQIClassification(250);
    expect(veryUnhealthy.category).toBe('very-unhealthy');

    const hazardous = getAQIClassification(450);
    expect(hazardous.category).toBe('hazardous');
    expect(hazardous.iconName).toBe('Biohazard');
  });

  it('verifies physiological ventilation rates for all target personas', () => {
    expect(PERSONA_VENTILATION_RATES.child.resting).toBeLessThan(PERSONA_VENTILATION_RATES.athlete.active);
    expect(PERSONA_VENTILATION_RATES.athlete.active).toBeGreaterThan(3.0);
  });
});
