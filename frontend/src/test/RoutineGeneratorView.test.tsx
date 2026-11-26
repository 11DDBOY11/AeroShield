import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RoutineGeneratorView } from '../components/RoutineGeneratorView';

describe('RoutineGeneratorView Component', () => {
  it('renders all 5 target personas', () => {
    render(<RoutineGeneratorView />);

    expect(screen.getAllByText(/School Child/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Asthmatic/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Senior Citizen/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Daily Urban Commuter/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Outdoor Runner/i).length).toBeGreaterThan(0);
  });

  it('switches persona when clicking Asthmatic', () => {
    render(<RoutineGeneratorView />);

    const asthmaticButton = screen.getByRole('radio', { name: /Asthmatic/i });
    fireEvent.click(asthmaticButton);

    expect(screen.getByText(/Vulnerability Profile: Asthmatic/i)).toBeInTheDocument();
    expect(screen.getByText(/Keep indoor PM2.5 strictly under 25 µg\/m³/i)).toBeInTheDocument();
  });

  it('renders side-by-side exposure comparison cards', () => {
    render(<RoutineGeneratorView />);

    expect(screen.getAllByText(/Standard Baseline Activity/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/AeroShield Optimized Activity/i).length).toBeGreaterThan(0);
  });
});
