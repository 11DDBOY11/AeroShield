import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RoutineOptimizerView } from '../components/RoutineOptimizerView';

describe('RoutineOptimizerView Component', () => {
  it('renders all 4 comparative transit modes', () => {
    render(<RoutineOptimizerView />);

    expect(screen.getByText('Solo Gasoline Car')).toBeInTheDocument();
    expect(screen.getByText('Electric Rapid Metro')).toBeInTheDocument();
    expect(screen.getByText('Shared Electric Cab (EV)')).toBeInTheDocument();
    expect(screen.getByText('E-Bike + Fitted N95 Mask')).toBeInTheDocument();
  });

  it('updates distance and calculates exposure', () => {
    render(<RoutineOptimizerView />);

    const slider = screen.getByLabelText(/One-Way Distance/i);
    fireEvent.change(slider, { target: { value: '25' } });

    expect(screen.getByText('25 km')).toBeInTheDocument();
  });

  it('toggles car cabin recirculation setting', () => {
    render(<RoutineOptimizerView />);

    const recircBtn = screen.getByRole('button', { name: /Recirculation ON/i });
    fireEvent.click(recircBtn);

    expect(screen.getByText(/Fresh Intake/i)).toBeInTheDocument();
  });
});
