// src/components/DampedOscillation.tsx
import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { Slider } from '@mui/material'; // Import Slider

interface DampedOscillationProps {
  // Add any props here if needed
}

const DampedOscillation: React.FC<DampedOscillationProps> = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [gamma, setGamma] = useState(0.1); // Damping coefficient
  const [omega, setOmega] = useState(1.0); // Angular frequency
  const [t0, setT0] = useState(0.0);       // Initial Phase

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000); // Set background color to black
    mountRef.current.appendChild(renderer.domElement);

    // --- Complex Plane ---
    const planeGeometry = new THREE.PlaneGeometry(10, 10);
    const planeMaterial = new THREE.MeshBasicMaterial({ color: 0x222222, side: THREE.DoubleSide });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    scene.add(plane);

    // Add axes
    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);


    // --- Spiral ---
    const createSpiral = (gammaVal: number, omegaVal: number, t0Val: number) => {
        const points = [];
        const numPoints = 500;
        for (let i = 0; i < numPoints; i++) {
          const t = i * 0.1;
          const x = Math.exp(-gammaVal * (t - t0Val)) * Math.cos(omegaVal * t);
          const y = Math.exp(-gammaVal * (t- t0Val)) * Math.sin(omegaVal * t);
          const z = 0; // Keep the spiral on the complex plane (z=0)
          points.push(new THREE.Vector3(x, y, z));
        }

        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({ color: 0xffffff });
        const spiral = new THREE.Line(geometry, material);
		    return spiral;
    };

    let spiral = createSpiral(gamma, omega, t0);
    scene.add(spiral);


    // --- Time-Domain Waveforms ---
    const createWaveform = (isReal: boolean, gammaVal: number, omegaVal: number, t0Val: number) => {
        const points = [];
        const numPoints = 200;

        for (let i = 0; i < numPoints; i++) {
          const t = i * 0.1;
          const value = isReal
            ? Math.exp(-gammaVal * (t-t0Val)) * Math.cos(omegaVal * t)
            : Math.exp(-gammaVal * (t - t0Val)) * Math.sin(omegaVal * t);

          const x = t - 10;  // Shift the waveform along the x-axis
          const y = value - (isReal ? 3 : -3); //Separate up and down.
          points.push(new THREE.Vector3(x, y, 0));
        }
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({ color: isReal ? 0x00ff00 : 0x0000ff });
      const waveform = new THREE.Line(geometry, material);
      return waveform;
    };

    let realWaveform = createWaveform(true, gamma, omega, t0);
    let imaginaryWaveform = createWaveform(false, gamma, omega, t0);
    scene.add(realWaveform);
    scene.add(imaginaryWaveform);

    // --- Animation Loop ---
    const animate = () => {

      // Remove old objects
      scene.remove(spiral);
      scene.remove(realWaveform);
      scene.remove(imaginaryWaveform);

      // Create new with parameters
      spiral = createSpiral(gamma, omega, t0);
      realWaveform = createWaveform(true, gamma, omega, t0);
      imaginaryWaveform = createWaveform(false, gamma, omega, t0);

      scene.add(spiral);
      scene.add(realWaveform);
      scene.add(imaginaryWaveform);

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    animate();

    // --- Cleanup ---
    return () => {
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      // Dispose of resources to prevent memory leaks
      planeGeometry.dispose();
      planeMaterial.dispose();
      axesHelper.dispose();

    };
  }, [gamma, omega, t0]); // Re-run effect if parameters change

  return (
    <div ref={mountRef} className="w-full h-full">
      <div className="absolute top-4 left-4 z-10 flex flex-col space-y-2">
          <div>
              <label htmlFor="gamma">Gamma (Damping): {gamma.toFixed(2)}</label>
              <Slider
              value={gamma}
              min={0}
              max={0.5}
              step={0.01}
              onChange={(_, value) => setGamma(value as number)}
              />
          </div>
          <div>
              <label htmlFor="omega">Omega (Frequency): {omega.toFixed(2)}</label>
              <Slider
              value={omega}
              min={0.1}
              max={5}
              step={0.1}
              onChange={(_, value) => setOmega(value as number)}
              />
          </div>
          <div>
              <label htmlFor="omega">Phase (t0): {t0.toFixed(2)}</label>
              <Slider
              value={t0}
              min={-5}
              max={5}
              step={0.1}
              onChange={(_, value) => setT0(value as number)}
              />
          </div>
      </div>
    </div>
    );
};

export default DampedOscillation;