// src/Homepage.tsx
import React, { useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import './components/three-extend'; // Import the THREE extensions

// Import custom components
import { LlamaCore } from './components/LlamaCore';
import { ObjectClumpScene } from './components/object-clump'; 
import { Nodes, Node } from './components/Nodes';
import { ParticleEffects } from './components/particle_effects';
import { 
  ProcessingLoadBar,
  SynapticConnections,
  DataFlow,
  AnticipationIndex,
  PromptCompletionProbability 
} from './components/MonitorComponents';
import CopilotVisualization from './components/CopilotVisualization';

// Import error handling components
import ThreeJSErrorBoundary from './components/ErrorBoundary';
import WebGLContextHandler from './components/WebGLContextHandler';

// Portfolio sections
const sections = [
  { id: 'intro', title: 'Interactive 3D Portfolio' },
  { id: 'llama', title: 'LlamaCore Visualization' },
  { id: 'particles', title: 'Particle Effects' },
  { id: 'objects', title: 'Interactive Objects' },
  { id: 'nodes', title: 'Network Visualization' },
  { id: 'monitors', title: 'Monitor Components' },
  { id: 'contact', title: 'Contact Me' },
];

const Homepage: React.FC = () => {
  const [activeSection, setActiveSection] = useState('intro');
  const [nodeRefs, setNodeRefs] = useState<React.RefObject<any>[]>([]);
  const [nodesData, setNodesData] = useState<any[]>([]);
  const sectionRefs = useRef<{[key: string]: HTMLDivElement | null}>({});
  
  // Create node network data
  React.useEffect(() => {
    const generateNodes = () => {
      const nodes = [];
      const refs: React.RefObject<any>[] = [];
      
      for (let i = 0; i < 8; i++) {
        nodes.push({
          name: `Node ${i+1}`,
          color: `hsl(${(i * 45) % 360}, 70%, 60%)`,
          position: [(Math.random() * 6) - 3, (Math.random() * 6) - 3, 0] as [number, number, number],
          connectedTo: [] as number[],
        });
        refs.push(React.createRef());
      }
      
      // Create connections
      nodes.forEach((node, index) => {
        if (index > 0) node.connectedTo.push(index - 1);
        if (index < nodes.length - 1) node.connectedTo.push(index + 1);
        if (index % 3 === 0 && index + 3 < nodes.length) node.connectedTo.push(index + 3);
      });
      
      setNodesData(nodes);
      setNodeRefs(refs);
    };
    
    generateNodes();
  }, []);

  // Scroll to section
  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = sectionRefs.current[id];
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <WebGLContextHandler>
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
          <div className="absolute inset-0">
            <ThreeJSErrorBoundary>
              <Canvas
                gl={{
                  antialias: true,
                  alpha: true,
                  powerPreference: 'high-performance',
                  failIfMajorPerformanceCaveat: true,
                  preserveDrawingBuffer: false,
                  logarithmicDepthBuffer: false,
                }}
                frameloop="demand"
                flat={true}
              >
                <OrbitControls enableZoom={false} />
                <ambientLight intensity={0.5} />
                <ParticleEffects />
              </Canvas>
            </ThreeJSErrorBoundary>
          </div>
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
              <div className="h-[500px]">
                <ThreeJSErrorBoundary>
                  <Canvas
                    gl={{
                      antialias: true,
                      alpha: true,
                      powerPreference: 'high-performance',
                      failIfMajorPerformanceCaveat: true,
                      preserveDrawingBuffer: false,
                      logarithmicDepthBuffer: false,
                    }}
                    frameloop="demand"
                    flat={true}
                    camera={{ position: [0, 0, 10] }}
                    data-testid="llamacore-canvas"
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

        {/* Interactive Objects Section */}
        <section 
          ref={el => sectionRefs.current['objects'] = el as HTMLDivElement}
          className="min-h-screen py-24 bg-gradient-to-b from-purple-900 to-pink-900 text-white"
        >
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="p-6">
                <h2 className="text-3xl font-bold mb-4">Interactive Physics Objects</h2>
                <p className="mb-4">
                  Experience interactive physics simulations with dynamic objects that respond to
                  your mouse movements. The particles are attracted to the center point while 
                  also being influenced by your cursor.
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="px-3 py-1 bg-blue-600 rounded-full text-sm">Physics</span>
                  <span className="px-3 py-1 bg-green-600 rounded-full text-sm">Interaction</span>
                  <span className="px-3 py-1 bg-yellow-600 rounded-full text-sm">Dynamics</span>
                </div>
              </div>
              <div className="h-[500px]">
                <ThreeJSErrorBoundary>
                  <Canvas
                    gl={{
                      antialias: true,
                      alpha: true,
                      powerPreference: 'high-performance',
                      failIfMajorPerformanceCaveat: true,
                      preserveDrawingBuffer: false,
                      logarithmicDepthBuffer: false,
                    }}
                    frameloop="demand"
                    flat={true}
                    shadows 
                    dpr={[1, 1.5]} 
                    camera={{ position: [0, 0, 20], fov: 35, near: 1, far: 40 }}
                  >
                    <ObjectClumpScene />
                  </Canvas>
                </ThreeJSErrorBoundary>
              </div>
            </div>
          </div>
        </section>

        {/* Network Nodes Section */}
        <section 
          ref={el => sectionRefs.current['nodes'] = el as HTMLDivElement}
          className="min-h-screen py-24 bg-gradient-to-b from-pink-900 to-red-900 text-white"
        >
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="h-[500px] order-2 lg:order-1">
                <ThreeJSErrorBoundary>
                  <Canvas
                    gl={{
                      antialias: true,
                      alpha: true,
                      powerPreference: 'high-performance',
                      failIfMajorPerformanceCaveat: true,
                      preserveDrawingBuffer: false,
                      logarithmicDepthBuffer: false,
                    }}
                    frameloop="demand"
                    flat={true}
                    orthographic 
                    camera={{ zoom: 80, position: [0, 0, 100] }}
                  >
                    <color attach="background" args={['#1a1a2e']} />
                    <ambientLight intensity={0.8} />
                    <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
                    <OrbitControls />
                    <Nodes nodeRefs={nodeRefs}>
                      {nodesData.map((node, index) => (
                        <Node
                          key={node.name}
                          ref={nodeRefs[index]}
                          name={node.name}
                          color={node.color}
                          position={node.position}
                          connectedTo={node.connectedTo.map((targetIndex: number) => nodeRefs[targetIndex])}
                        />
                      ))}
                    </Nodes>
                  </Canvas>
                </ThreeJSErrorBoundary>
              </div>
              <div className="p-6 order-1 lg:order-2">
                <h2 className="text-3xl font-bold mb-4">Network Visualization</h2>
                <p className="mb-4">
                  Interactive network visualization showing connected nodes in a 3D space.
                  The nodes represent data points that can be updated in real-time
                  while maintaining their connections.
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="px-3 py-1 bg-blue-600 rounded-full text-sm">Nodes</span>
                  <span className="px-3 py-1 bg-green-600 rounded-full text-sm">Connections</span>
                  <span className="px-3 py-1 bg-yellow-600 rounded-full text-sm">Data Visualization</span>
                </div>
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
    </WebGLContextHandler>
  );
};

export default Homepage;