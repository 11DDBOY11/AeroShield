import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { App } from '../App';

describe('App & Accessibility Component', () => {
  it('renders skip to main content link for keyboard and screen reader accessibility', () => {
    render(<App />);

    const skipLink = screen.getByText('Skip to main content');
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute('href', '#main-content');
  });

  it('renders all main navigation tabs with proper ARIA attributes', () => {
    render(<App />);

    const barometerTab = screen.getByRole('tab', { name: /Smog Barometer & Inversion/i });
    const routinesTab = screen.getByRole('tab', { name: /Personalized Routines/i });
    const optimizerTab = screen.getByRole('tab', { name: /Low-Emission Optimizer/i });
    const inspectorTab = screen.getByRole('tab', { name: /DIY Hacks & Vision Inspector/i });
    const impactTab = screen.getByRole('tab', { name: /Direct Impact & Lung Dose/i });

    expect(barometerTab).toBeInTheDocument();
    expect(routinesTab).toBeInTheDocument();
    expect(optimizerTab).toBeInTheDocument();
    expect(inspectorTab).toBeInTheDocument();
    expect(impactTab).toBeInTheDocument();

    expect(barometerTab).toHaveAttribute('aria-selected', 'true');
    expect(routinesTab).toHaveAttribute('aria-selected', 'false');
  });

  it('navigates to different tabs on click', () => {
    render(<App />);

    const impactTab = screen.getByRole('tab', { name: /Direct Impact & Lung Dose/i });
    fireEvent.click(impactTab);

    expect(impactTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText(/Interactive Lung Dose & Carbon Offset Visualizer/i)).toBeInTheDocument();
  });

  it('toggles colorblind aid mode', () => {
    render(<App />);

    const colorblindBtn = screen.getByTitle(/Toggle High-Contrast Pattern Aid/i);
    fireEvent.click(colorblindBtn);

    expect(screen.getByText('Colorblind Aid ON')).toBeInTheDocument();
  });

  it('switches hotspot location', () => {
    render(<App />);

    const select = screen.getByLabelText(/Select Air Quality Hotspot City/i);
    fireEvent.change(select, { target: { value: 'lahore' } });

    expect(screen.getByText('412')).toBeInTheDocument();
  });
});
