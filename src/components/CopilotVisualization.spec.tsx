import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ResizeObserver from 'resize-observer-polyfill';

// Mock modules before importing the component
// Mock @react-three/drei
vi.mock('@react-three/drei', () => {
  return {
    Box: ({ children, ...props }) => (
      <div role="generic" data-testid="box" {...props}>
        {children}
      </div>
    ),
  };
});

// Mock @react-three/fiber
vi.mock('@react-three/fiber', () => {
  return {
    Canvas: ({ children }) => (
      <div data-testid="canvas">
        {children}
        <canvas />
      </div>
    ),
  };
});

// Now import the component after mocking
import CopilotVisualization from './CopilotVisualization';

// Mock ResizeObserver
window.ResizeObserver = ResizeObserver;

// Create spy functions to track component renders
const BoxSpy = vi.fn();
const AmbientLightSpy = vi.fn();
const PointLightSpy = vi.fn();

// Mock the specific components we want to track
vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual,
    createElement: (type, props, ...children) => {
      // Track calls to our components of interest
      if (props && props['data-testid'] === 'ambientLight') {
        AmbientLightSpy();
      }
      if (props && props['data-testid'] === 'pointLight') {
        PointLightSpy();
      }
      if (type.name === 'Box' || (typeof type === 'string' && type === 'Box')) {
        BoxSpy();
      }
      return actual.createElement(type, props, ...children);
    }
  };
});

describe('CopilotVisualization Component', () => {
  beforeEach(() => {
    // Reset spy counts before each test
    BoxSpy.mockReset();
    AmbientLightSpy.mockReset();
    PointLightSpy.mockReset();
  });

  it('renders a Canvas component', () => {
    const { container } = render(<CopilotVisualization />);
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('renders Box components for voxels', () => {
    render(<CopilotVisualization />);
    // Check for Box elements via the data-testid
    const boxElements = screen.getAllByTestId('box');
    expect(boxElements.length).toBe(100);
  });

  it('contains ambient and point lights', () => {
    render(<CopilotVisualization />);
    // We can check that our divs with the specific data-testids are in the document
    expect(screen.getByTestId('ambientLight')).toBeInTheDocument();
    expect(screen.getByTestId('pointLight')).toBeInTheDocument();
  });
});