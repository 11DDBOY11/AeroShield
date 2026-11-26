import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { VisionInspectorView } from '../components/VisionInspectorView';

describe('VisionInspectorView Component', () => {
  it('renders multimodal vision test samples and diagnostics', () => {
    render(<VisionInspectorView />);

    expect(screen.getByText(/Saturated HEPA \/ Fan Filter/i)).toBeInTheDocument();
    expect(screen.getByText(/Window Frame Smog Leakage Gap/i)).toBeInTheDocument();
    expect(screen.getByText(/DIY Corsi-Rosenthal Box Assembly/i)).toBeInTheDocument();
  });

  it('switches to DIY Hacks library tab', () => {
    render(<VisionInspectorView />);

    const hacksTab = screen.getByRole('button', { name: /DIY Hacks Library/i });
    fireEvent.click(hacksTab);

    expect(screen.getByText(/The Corsi-Rosenthal Air Purifier Box/i)).toBeInTheDocument();
    expect(screen.getByText(/Precision Window Weatherstripping/i)).toBeInTheDocument();
  });
});
