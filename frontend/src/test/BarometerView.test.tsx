import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BarometerView } from '../components/BarometerView';
import { HOTSPOT_LOCATIONS } from '../data/mockData';

describe('BarometerView Component', () => {
  const delhi = HOTSPOT_LOCATIONS[0];

  it('renders current location AQI and smog severity level', () => {
    render(<BarometerView location={delhi} colorblindMode={false} />);

    expect(screen.getByText('384')).toBeInTheDocument();
    expect(screen.getByText(/Hazardous/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Golden Ventilation Window/i).length).toBeGreaterThan(0);
  });

  it('renders 24-hour inversion curve with Golden Window highlights', () => {
    render(<BarometerView location={delhi} colorblindMode={false} />);

    expect(
      screen.getByText(/24-Hour Winter Smog & Atmospheric Inversion Curve/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Inversion Lift AQI/i)).toBeInTheDocument();
  });

  it('renders colorblind pattern aid when colorblindMode is enabled', () => {
    render(<BarometerView location={delhi} colorblindMode={true} />);

    expect(screen.getByText(/Pattern:/i)).toBeInTheDocument();
  });
});
