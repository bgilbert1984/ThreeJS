// src/Homepage.tsx
import React, { useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import './components/three-extend'; // Import the THREE extensions

// Import custom components
import { LlamaCore } from './components/LlamaCore';
import ThreeJSErrorBoundary from './components/ErrorBoundary';
import CanvasFallback from './components/CanvasFallback';

// Portfolio sections
const sections = [
  { id: 'intro', title: 'Interactive 3D Portfolio' },
  { id: 'llama', title: 'LlamaCore Visualization' },
  { id: 'objects', title: 'Interactive Objects' },
  { id: 'monitors', title: 'Monitor Components' },
  { id: 'contact', title: 'Contact Me' },
];

const Homepage: React.FC = () => {
  const [activeSection, setActiveSection] = useState('intro');
  const sectionRefs = useRef<{[key: string]: HTMLDivElement | null}>({});

  // Scroll to section
  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = sectionRefs.current[id];
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="homepage">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full bg-black bg-opacity-75 z-50 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">3D Interactive Portfolio</h1>
          <div className="space-x-4">
            {sections.map(section => (
              <button 
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`px-3 py-1 ${activeSection === section.id ? 'bg-purple-600' : 'hover:bg-purple-700'} rounded`}
              >
                {section.title}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section 
        ref={el => sectionRefs.current['intro'] = el as HTMLDivElement}
        className="h-screen flex flex-col items-center justify-center relative bg-gray-900 text-white"
      >
        {/* Static background instead of 3D */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-purple-900"></div>
        
        <div className="container mx-auto text-center z-10 p-8 bg-black bg-opacity-50 rounded-lg">
          <h1 className="text-5xl font-bold mb-6">Interactive 3D Web Development</h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Showcasing the power of Three.js and React for creating immersive web experiences.
            Scroll down to explore interactive visualizations and components.
          </p>
          <button 
            onClick={() => scrollToSection('llama')}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-lg font-medium"
          >
            Explore Projects
          </button>
        </div>
      </section>

      {/* LlamaCore Section */}
      <section 
        ref={el => sectionRefs.current['llama'] = el as HTMLDivElement}
        className="min-h-screen py-24 bg-gradient-to-b from-gray-900 to-indigo-900 text-white"
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="p-6">
              <h2 className="text-3xl font-bold mb-4">LlamaCore Visualization</h2>
              <p className="mb-4">
                Explore this interactive 3D visualization of the LlamaCore architecture.
                The visualization changes color and behavior based on system health.
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="px-3 py-1 bg-blue-600 rounded-full text-sm">Three.js</span>
                <span className="px-3 py-1 bg-green-600 rounded-full text-sm">React</span>
                <span className="px-3 py-1 bg-yellow-600 rounded-full text-sm">Animation</span>
                <span className="px-3 py-1 bg-red-600 rounded-full text-sm">3D Modeling</span>
              </div>
            </div>
            <div className="h-[500px] relative">
              <ThreeJSErrorBoundary fallback={<CanvasFallback />}>
                <Canvas
                  gl={{
                    antialias: true,
                    alpha: true,
                    powerPreference: 'high-performance',
                    failIfMajorPerformanceCaveat: true,
                  }}
                  camera={{ position: [0, 0, 5] }}
                >
                  <ambientLight intensity={0.5} />
                  <pointLight position={[10, 10, 10]} />
                  <OrbitControls />
                  <LlamaCore />
                </Canvas>
              </ThreeJSErrorBoundary>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-gray-400 py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; {new Date().getFullYear()} 3D Interactive Portfolio. All rights reserved.</p>
          <p className="mt-2">Built with React, Three.js, and React Three Fiber</p>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;