import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ImpactVisualizerView } from '../components/ImpactVisualizerView';

describe('ImpactVisualizerView Component', () => {
  it('renders direct impact metrics and dosimetry formula', () => {
    render(<ImpactVisualizerView />);

    expect(screen.getByText(/PM2.5 Lung Dose Prevented/i)).toBeInTheDocument();
    expect(screen.getByText(/Cigarette Equivalents Blocked/i)).toBeInTheDocument();
    expect(screen.getByText(/CO2 Emissions Offset/i)).toBeInTheDocument();
    expect(screen.getByText(/Underlying Inhalation & Dosimetry Physics/i)).toBeInTheDocument();
  });

  it('updates calculation dynamically when household slider changes', () => {
    render(<ImpactVisualizerView />);

    const membersSlider = screen.getByLabelText(/Household Members Protected/i);
    fireEvent.change(membersSlider, { target: { value: '5' } });

    expect(screen.getByText('5 People')).toBeInTheDocument();
  });
});
