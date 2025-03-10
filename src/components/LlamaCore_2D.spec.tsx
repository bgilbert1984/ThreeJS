import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom'; // Import matchers from jest-dom
import { LlamaCoreD3 } from './LlamaCore_2D';

describe('<LlamaCoreD3 />', () => {
    it('renders without crashing', () => {
        const { container } = render(<LlamaCoreD3 />);
        const svgElement = container.querySelector('svg');
        expect(svgElement).toBeInTheDocument();
    });

    it('creates particles with positions', async () => {
        const { container } = render(<LlamaCoreD3 />);
        const svgElement = container.querySelector('svg');
        expect(svgElement).toBeInTheDocument();
        
        // Wait for D3 to create elements (using waitFor instead of setTimeout)
        await waitFor(() => {
            const particleElements = container.querySelectorAll('circle');
            expect(particleElements.length).toBeGreaterThan(0);
        }, { timeout: 1000 }); // Allow up to 1 second for elements to appear
    });
});