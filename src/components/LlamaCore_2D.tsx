import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

export const LlamaCoreD3: React.FC = () => {
    const svgRef = useRef<SVGSVGElement>(null);
    const [health, setHealth] = React.useState(1); // Full health initially

    // Health decreasing over time
    useEffect(() => {
        const intervalId = setInterval(() => {
            setHealth((prevHealth) => Math.max(0, prevHealth - 0.01)); // Decrease health
        }, 100); // Every 100ms

        return () => clearInterval(intervalId); // Cleanup on unmount
    }, []);

    useEffect(() => {
        const svg = d3.select(svgRef.current)
            .attr('width', 800)
            .attr('height', 600);

        // Create a group for the llama
        const llamaGroup = svg.append('g')
            .attr('transform', 'translate(400, 300)');

        // Create the llama body
        llamaGroup.append('circle')
            .attr('cx', 0)
            .attr('cy', 0)
            .attr('r', 50)
            .attr('fill', 'green');

        // Create the llama teeth
        llamaGroup.append('rect')
            .attr('x', -10)
            .attr('y', -20)
            .attr('width', 20)
            .attr('height', 10)
            .attr('fill', 'white');

        // Create the llama eyes
        llamaGroup.append('circle')
            .attr('cx', -15)
            .attr('cy', -30)
            .attr('r', 5)
            .attr('fill', 'black');

        llamaGroup.append('circle')
            .attr('cx', 15)
            .attr('cy', -30)
            .attr('r', 5)
            .attr('fill', 'black');

        // Create particle system
        const numParticles = 5000;
        const particles = d3.range(numParticles).map(() => ({
            x: Math.random() * 800 - 400,
            y: Math.random() * 600 - 300,
        }));

        const particleGroup = svg.append('g');

        particleGroup.selectAll('circle')
            .data(particles)
            .enter()
            .append('circle')
            .attr('cx', d => d.x)
            .attr('cy', d => d.y)
            .attr('r', 1)
            .attr('fill', 'red');

        // Update llama color and opacity based on health
        d3.interval(() => {
            const adjustedHealth = Math.max(0, health);
            const color = d3.interpolateRgb('red', 'green')(adjustedHealth);

            llamaGroup.select('circle')
                .attr('fill', color)
                .attr('opacity', adjustedHealth);

            // Rotate particles
            particleGroup.attr('transform', `rotate(${Date.now() * 0.01}, 400, 300)`);
        }, 100);

    }, [health]);

    return (
        <svg ref={svgRef}></svg>
    );
};