import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ParticleEffects from './particle-effects';

// Mock Three.js components
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(cb => cb({ clock: { getElapsedTime: () => 0 } })),
  Canvas: ({ children }) => <div data-testid="canvas">{children}</div>
}));

vi.mock('three', () => ({
  BufferGeometry: vi.fn().mockImplementation(() => ({
    setAttribute: vi.fn(),
    computeBoundingSphere: vi.fn()
  })),
  BufferAttribute: vi.fn(),
  Points: vi.fn(),
  PointsMaterial: vi.fn(),
  Color: vi.fn()
}));

describe('<ParticleEffects />', () => {
  it('renders without crashing', () => {
    const { getByTestId } = render(
      <ParticleEffects count={1000} color="#ffffff" size={0.1} />
    );
    expect(getByTestId("canvas")).toBeInTheDocument();
  });
});
