import '@testing-library/jest-dom';

// Mock HTMLCanvasElement.getContext for JSDOM test suite
HTMLCanvasElement.prototype.getContext = (() => ({
  clearRect: () => {},
  fillRect: () => {},
  beginPath: () => {},
  moveTo: () => {},
  lineTo: () => {},
  stroke: () => {},
  fill: () => {},
  arc: () => {},
  createLinearGradient: () => ({
    addColorStop: () => {},
  }),
  setLineDash: () => {},
  fillText: () => {},
  strokeRect: () => {},
  save: () => {},
  restore: () => {},
  translate: () => {},
  rotate: () => {},
})) as any;
