// src/Homepage.tsx
import React, { useState, useRef, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import './components/three-extend'; // Import the THREE extensions
import { NodeRef } from './types'; // Import NodeRef type

// Import custom components
import { LlamaCore } from './components/LlamaCore';
import { LlamaCoreD3 } from './components/LlamaCore_2D';
import { App as ParticleEffectsApp } from './components/particle_effects';
import { App as ObjectClumpApp } from './components/object-clump';
import { Nodes, Node } from './components/Nodes';
import { ProcessingLoadBar, SynapticConnections, DataFlow, AnticipationIndex, PromptCompletionProbability } from './components/MonitorComponents';
import CopilotVisualization from './components/CopilotVisualization';
import RadarVisualization from './components/RadarVisualization';
import TerrainRadarMapping from './components/TerrainRadarMapping';
import GrokVisualization from './components/GrokVisualization';
import NeuralNetworkVisualization from './components/InteractiveNeuralNetwork';
import ThreeJSErrorBoundary from './components/ErrorBoundary';
import CanvasFallback from './components/CanvasFallback';
import WebGLContextHandler from './components/WebGLContextHandler';

// Portfolio sections
const sections = [
  { id: 'intro', title: 'Interactive 3D Portfolio' },
  { id: 'llama', title: 'LlamaCore Visualization' },
  { id: 'particles', title: 'Particle Effects' },
  { id: 'objects', title: 'Interactive Objects' },
  { id: 'network', title: 'Network Visualization' },
  { id: 'monitors', title: 'Monitor Components' },
  { id: 'visualizations', title: 'AI Visualizations' },
  { id: 'contact', title: 'Contact Me' },
];

const Homepage: React.FC = () => {
  const [activeSection, setActiveSection] = useState('intro');
  const sectionRefs = useRef<{[key: string]: HTMLDivElement | null}>({});

  // Scroll to section
  const scrollToSection = useCallback((id: string) => {
    setActiveSection(id);
    const element = sectionRefs.current[id];
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  // Create refs for nodes example
  const nodeRefs = useRef<Array<React.RefObject<NodeRef>>>(
    Array(5).fill(0).map(() => React.createRef<NodeRef>())
  );

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
        ref={(el: HTMLDivElement | null) => sectionRefs.current['intro'] = el}
        className="h-screen flex flex-col items-center justify-center relative bg-gray-900 text-white"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-purple-900"></div>
        
        <div className="container mx-auto text-center z-10 p-8 bg-black bg-opacity-50 rounded-lg">
          <h1 className="text-5xl font-bold mb-6">Interactive 3D Web Development</h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Showcasing the power of Three.js and React for creating immersive web experiences.
            Explore real-time 3D visualizations, AI-powered components, and interactive demonstrations.
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
        ref={(el: HTMLDivElement | null) => sectionRefs.current['llama'] = el}
        className="min-h-screen py-24 bg-gradient-to-b from-gray-900 to-indigo-900 text-white"
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="p-6">
              <h2 className="text-3xl font-bold mb-4">LlamaCore Visualization</h2>
              <p className="mb-4">
                This interactive 3D visualization demonstrates real-time data rendering with dynamic color changes based on system health metrics.
                The visualization changes color and behavior based on health status, providing intuitive visual feedback.
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="px-3 py-1 bg-blue-600 rounded-full text-sm">Three.js</span>
                <span className="px-3 py-1 bg-green-600 rounded-full text-sm">React</span>
                <span className="px-3 py-1 bg-yellow-600 rounded-full text-sm">Animation</span>
                <span className="px-3 py-1 bg-red-600 rounded-full text-sm">3D Modeling</span>
              </div>
              <div className="mt-6">
                <h3 className="text-xl font-semibold mb-2">2D Version</h3>
                <p className="mb-4">Compare with the D3-powered 2D version:</p>
                <div className="h-[200px] bg-gray-800 rounded-lg overflow-hidden">
                  <LlamaCoreD3 />
                </div>
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
                  data-testid="llama-core-canvas"
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

      {/* Particle Effects Section */}
      <section 
        ref={(el: HTMLDivElement | null) => sectionRefs.current['particles'] = el}
        className="min-h-screen py-24 bg-gradient-to-b from-indigo-900 to-purple-900 text-white"
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="h-[500px] relative order-2 lg:order-1">
              <ThreeJSErrorBoundary fallback={<CanvasFallback />}>
                <WebGLContextHandler>
                  <Canvas
                    gl={{
                      antialias: true,
                      alpha: true,
                      powerPreference: 'high-performance',
                    }}
                    camera={{ position: [0, 0, 10] }}
                    data-testid="particle-effects-canvas"
                  >
                    <ParticleEffectsApp />
                  </Canvas>
                </WebGLContextHandler>
              </ThreeJSErrorBoundary>
            </div>
            <div className="p-6 order-1 lg:order-2">
              <h2 className="text-3xl font-bold mb-4">Particle Effects</h2>
              <p className="mb-4">
                Advanced particle systems with post-processing effects demonstrate how to create immersive visual experiences.
                These particle systems use adaptive rendering techniques and bloom effects to create a vibrant and dynamic visual representation.
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="px-3 py-1 bg-blue-600 rounded-full text-sm">Three.js</span>
                <span className="px-3 py-1 bg-green-600 rounded-full text-sm">Particles</span>
                <span className="px-3 py-1 bg-yellow-600 rounded-full text-sm">Post-processing</span>
                <span className="px-3 py-1 bg-red-600 rounded-full text-sm">WebGL</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Objects Section */}
      <section 
        ref={(el: HTMLDivElement | null) => sectionRefs.current['objects'] = el}
        className="min-h-screen py-24 bg-gradient-to-b from-purple-900 to-blue-900 text-white"
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="p-6">
              <h2 className="text-3xl font-bold mb-4">Interactive Objects</h2>
              <p className="mb-4">
                Physics-based interactions using React Three Fiber and Cannon.js. This demo uses instanced rendering for performance
                and adds dynamic force fields that respond to user interaction. The spheres maintain a cohesive cluster while
                being influenced by physical forces.
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="px-3 py-1 bg-blue-600 rounded-full text-sm">Physics</span>
                <span className="px-3 py-1 bg-green-600 rounded-full text-sm">Instancing</span>
                <span className="px-3 py-1 bg-yellow-600 rounded-full text-sm">Interaction</span>
                <span className="px-3 py-1 bg-red-600 rounded-full text-sm">Performance</span>
              </div>
            </div>
            <div className="h-[500px] relative">
              <ThreeJSErrorBoundary fallback={<CanvasFallback />}>
                <Canvas
                  gl={{
                    antialias: true,
                    alpha: true,
                    powerPreference: 'high-performance',
                  }}
                  camera={{ position: [0, 0, 10] }}
                  data-testid="object-clump-canvas"
                >
                  <ObjectClumpApp />
                </Canvas>
              </ThreeJSErrorBoundary>
            </div>
          </div>
        </div>
      </section>

      {/* Network Visualization Section */}
      <section 
        ref={(el: HTMLDivElement | null) => sectionRefs.current['network'] = el}
        className="min-h-screen py-24 bg-gradient-to-b from-blue-900 to-teal-900 text-white"
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="h-[500px] relative order-2 lg:order-1">
              <ThreeJSErrorBoundary fallback={<CanvasFallback />}>
                <Canvas
                  camera={{ position: [0, 0, 10], fov: 50 }}
                  data-testid="network-vis-canvas"
                >
                  <ambientLight intensity={0.5} />
                  <pointLight position={[10, 10, 10]} />
                  <Nodes>
                    {Array(5).fill(0).map((_, i) => (
                      <Node
                        key={i}
                        ref={nodeRefs.current[i]}
                        name={`node-${i}`}
                        color={`hsl(${i * 70}, 70%, 60%)`}
                        position={[
                          Math.cos((i / 5) * Math.PI * 2) * 2,
                          Math.sin((i / 5) * Math.PI * 2) * 2,
                          0
                        ]}
                        connectedTo={[]}
                      />
                    ))}
                  </Nodes>
                  <OrbitControls />
                </Canvas>
              </ThreeJSErrorBoundary>
            </div>
            <div className="p-6 order-1 lg:order-2">
              <h2 className="text-3xl font-bold mb-4">Network Visualization</h2>
              <p className="mb-4">
                Dynamic network visualization with connected nodes that can be used for visualizing complex systems, neural networks,
                or data relationships. The component is designed for real-time updates and can integrate with QuestDB for processing
                time-series data.
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="px-3 py-1 bg-blue-600 rounded-full text-sm">Nodes</span>
                <span className="px-3 py-1 bg-green-600 rounded-full text-sm">Connections</span>
                <span className="px-3 py-1 bg-yellow-600 rounded-full text-sm">Data Visualization</span>
                <span className="px-3 py-1 bg-red-600 rounded-full text-sm">Time-series</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Monitor Components Section */}
      <section 
        ref={(el: HTMLDivElement | null) => sectionRefs.current['monitors'] = el}
        className="min-h-screen py-24 bg-gradient-to-b from-teal-900 to-green-900 text-white"
      >
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Monitor Components</h2>
          <p className="text-lg max-w-3xl mx-auto text-center mb-12">
            A suite of 3D monitor components for visualizing various metrics and data streams in real-time.
            These components combine aesthetic appeal with functional data representation.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Processing Load */}
            <div className="bg-gray-800 bg-opacity-50 rounded-lg overflow-hidden">
              <h3 className="text-xl font-semibold p-4">Processing Load</h3>
              <div className="h-[200px] relative">
                <ThreeJSErrorBoundary fallback={<CanvasFallback />}>
                  <Canvas>
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} />
                    <ProcessingLoadBar value={0.7} label="Processing Load" color="red" />
                    <OrbitControls />
                  </Canvas>
                </ThreeJSErrorBoundary>
              </div>
            </div>
            
            {/* Synaptic Connections */}
            <div className="bg-gray-800 bg-opacity-50 rounded-lg overflow-hidden">
              <h3 className="text-xl font-semibold p-4">Synaptic Connections</h3>
              <div className="h-[200px] relative">
                <ThreeJSErrorBoundary fallback={<CanvasFallback />}>
                  <Canvas camera={{position: [0, 0, 5]}}>
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} />
                    <SynapticConnections value={0.5} label="Connections" />
                    <OrbitControls />
                  </Canvas>
                </ThreeJSErrorBoundary>
              </div>
            </div>
            
            {/* Data Flow */}
            <div className="bg-gray-800 bg-opacity-50 rounded-lg overflow-hidden">
              <h3 className="text-xl font-semibold p-4">Data Flow</h3>
              <div className="h-[200px] relative">
                <ThreeJSErrorBoundary fallback={<CanvasFallback />}>
                  <Canvas camera={{position: [0, 0, 5]}}>
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} />
                    <DataFlow value={0.8} label="Data Flow" />
                    <OrbitControls />
                  </Canvas>
                </ThreeJSErrorBoundary>
              </div>
            </div>
            
            {/* Anticipation Index */}
            <div className="bg-gray-800 bg-opacity-50 rounded-lg overflow-hidden">
              <h3 className="text-xl font-semibold p-4">Anticipation Index</h3>
              <div className="h-[200px] relative">
                <ThreeJSErrorBoundary fallback={<CanvasFallback />}>
                  <Canvas camera={{position: [0, 0, 3]}}>
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} />
                    <AnticipationIndex value={0.3} label="Anticipation" />
                    <OrbitControls />
                  </Canvas>
                </ThreeJSErrorBoundary>
              </div>
            </div>
            
            {/* Prompt Completion */}
            <div className="bg-gray-800 bg-opacity-50 rounded-lg overflow-hidden">
              <h3 className="text-xl font-semibold p-4">Prompt Completion</h3>
              <div className="h-[200px] relative">
                <ThreeJSErrorBoundary fallback={<CanvasFallback />}>
                  <Canvas camera={{position: [0, 0, 3]}}>
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} />
                    <PromptCompletionProbability value={0.9} label="Completion" color="magenta" />
                    <OrbitControls />
                  </Canvas>
                </ThreeJSErrorBoundary>
              </div>
            </div>
            
            {/* Copilot Visualization */}
            <div className="bg-gray-800 bg-opacity-50 rounded-lg overflow-hidden">
              <h3 className="text-xl font-semibold p-4">Copilot Visualization</h3>
              <div className="h-[200px] relative">
                <ThreeJSErrorBoundary fallback={<CanvasFallback />}>
                  <CopilotVisualization />
                </ThreeJSErrorBoundary>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Visualizations Section */}
      <section 
        ref={(el: HTMLDivElement | null) => sectionRefs.current['visualizations'] = el}
        className="min-h-screen py-24 bg-gradient-to-b from-green-900 to-yellow-900 text-white"
      >
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">AI Visualizations</h2>
          <p className="text-lg max-w-3xl mx-auto text-center mb-12">
            Specialized visualizations for AI models and systems. These components provide intuitive
            representations of complex AI concepts and data processing.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Neural Network */}
            <div className="bg-gray-800 bg-opacity-50 rounded-lg overflow-hidden">
              <h3 className="text-xl font-semibold p-4">Neural Network Visualization</h3>
              <div className="h-[300px] relative">
                <ThreeJSErrorBoundary fallback={<CanvasFallback />}>
                  <NeuralNetworkVisualization />
                </ThreeJSErrorBoundary>
              </div>
              <div className="p-4">
                <p>Interactive neural network visualization with dynamic activations and signal propagation. Click on neurons to see activation patterns.</p>
              </div>
            </div>
            
            {/* Grok Visualization */}
            <div className="bg-gray-800 bg-opacity-50 rounded-lg overflow-hidden">
              <h3 className="text-xl font-semibold p-4">Grok Visualization</h3>
              <div className="h-[300px] relative">
                <ThreeJSErrorBoundary fallback={<CanvasFallback />}>
                  <GrokVisualization />
                </ThreeJSErrorBoundary>
              </div>
              <div className="p-4">
                <p>Abstract representation of AI reasoning processes with dynamic node connections and interactive elements.</p>
              </div>
            </div>
            
            {/* Radar Visualization */}
            <div className="bg-gray-800 bg-opacity-50 rounded-lg overflow-hidden">
              <h3 className="text-xl font-semibold p-4">Radar Visualization</h3>
              <div className="h-[300px] relative">
                <ThreeJSErrorBoundary fallback={<CanvasFallback />}>
                  <Canvas camera={{ position: [0, 5, 8], fov: 50 }}>
                    <ambientLight intensity={0.3} />
                    <pointLight position={[10, 10, 10]} intensity={0.8} />
                    <RadarVisualization range={5} scanSpeed={0.5} />
                    <OrbitControls />
                  </Canvas>
                </ThreeJSErrorBoundary>
              </div>
              <div className="p-4">
                <p>Real-time radar visualization with scanning and detection capabilities for monitoring systems and data feeds.</p>
              </div>
            </div>
            
            {/* Terrain Radar Mapping */}
            <div className="bg-gray-800 bg-opacity-50 rounded-lg overflow-hidden">
              <h3 className="text-xl font-semibold p-4">Terrain Radar Mapping</h3>
              <div className="h-[300px] relative">
                <ThreeJSErrorBoundary fallback={<CanvasFallback />}>
                  <Canvas camera={{ position: [5, 7, 5], fov: 50 }}>
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} intensity={0.8} />
                    <TerrainRadarMapping terrainType="mountains" resolution={64} scanSpeed={0.5} heightScale={1.5} />
                    <OrbitControls />
                  </Canvas>
                </ThreeJSErrorBoundary>
              </div>
              <div className="p-4">
                <p>Advanced terrain mapping visualization with dynamic scanning and topographical representation capabilities.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section 
        ref={(el: HTMLDivElement | null) => sectionRefs.current['contact'] = el}
        className="min-h-screen py-24 bg-gradient-to-b from-yellow-900 to-gray-900 text-white"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto bg-gray-800 bg-opacity-50 rounded-lg p-8">
            <h2 className="text-3xl font-bold mb-6 text-center">Contact Me</h2>
            <p className="text-center mb-8">
              Interested in working together? Have questions about Three.js implementations or AI visualizations?
              Send me a message and I'll get back to you as soon as possible.
            </p>
            
            <form className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  id="name"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:border-purple-500"
                  placeholder="Your name"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  id="email"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:border-purple-500"
                  placeholder="your.email@example.com"
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-1">Message</label>
                <textarea
                  id="message"
                  rows={5}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:border-purple-500"
                  placeholder="Your message here..."
                ></textarea>
              </div>
              
              <button 
                type="submit" 
                className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-lg font-medium"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-gray-400 py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; {new Date().getFullYear()} Ben Gilderp. All rights reserved.</p>
          <p className="mt-2">Built with React, Three.js, React Three Fiber, and Anthropic's Claude 3.7 Sonnet</p>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;