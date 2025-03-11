import React, { useState, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

// Import all visualization components
import { LlamaCore } from './components/LlamaCore';
import { App as ParticleEffectsApp } from './components/particle_effects';
import { ObjectClumpScene } from './components/object-clump'; // Import the scene-only version to avoid nested Canvas issues
import { Nodes, Node } from './components/Nodes';
import { 
  ProcessingLoadBar,
  SynapticConnections,
  DataFlow,
  AnticipationIndex,
  PromptCompletionProbability 
} from './components/MonitorComponents';
import CopilotVisualization from './components/CopilotVisualization';

// Add WebGL error handling
const handleContextCreationError = (event: Event) => {
  console.error("WebGL context creation failed:", event);
  // You could display a fallback UI here
  alert("WebGL context creation failed. Please try a different browser or device.");
};

// Add WebGL context lost handling
const handleContextLost = (event: Event) => {
  console.error("WebGL context lost:", event);
  // Attempt to recover or show a friendly message
  alert("WebGL context was lost. The page will reload to recover.");
  window.location.reload();
};

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
  const canvasRefs = useRef<{[key: string]: HTMLCanvasElement | null}>({});

  // Add context lost event listeners
  useEffect(() => {
    // Add listeners to all canvas elements
    const addContextListeners = () => {
      Object.values(canvasRefs.current).forEach(canvas => {
        if (canvas) {
          canvas.addEventListener('webglcontextlost', handleContextLost);
          canvas.addEventListener('webglcontextcreationerror', handleContextCreationError);
        }
      });
    };

    // Initial setup
    setTimeout(addContextListeners, 1000);
    
    // Cleanup
    return () => {
      Object.values(canvasRefs.current).forEach(canvas => {
        if (canvas) {
          canvas.removeEventListener('webglcontextlost', handleContextLost);
          canvas.removeEventListener('webglcontextcreationerror', handleContextCreationError);
        }
      });
    };
  }, []);

  // Create node network data
  useEffect(() => {
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

  // Save canvas ref helper
  const saveCanvasRef = (id: string) => (canvas: HTMLCanvasElement) => {
    canvasRefs.current[id] = canvas;
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
        <div className="absolute inset-0">
          <Canvas onCreated={({gl}) => saveCanvasRef('intro')(gl.domElement)}>
            <OrbitControls enableZoom={false} />
            <ambientLight intensity={0.5} />
            <ParticleEffectsApp />
          </Canvas>
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
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, 
                nisl eget aliquam ultricies, nunc nisl aliquet nunc, quis aliquam nisl 
                nunc quis nisl. Nullam euismod, nisl eget aliquam ultricies, nunc nisl 
                aliquet nunc, quis aliquam nisl nunc quis nisl.
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="px-3 py-1 bg-blue-600 rounded-full text-sm">Three.js</span>
                <span className="px-3 py-1 bg-green-600 rounded-full text-sm">React</span>
                <span className="px-3 py-1 bg-yellow-600 rounded-full text-sm">Animation</span>
                <span className="px-3 py-1 bg-red-600 rounded-full text-sm">3D Modeling</span>
              </div>
            </div>
            <div className="h-[500px]">
              <Canvas camera={{ position: [0, 0, 10] }} onCreated={({gl}) => saveCanvasRef('llama')(gl.domElement)}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} />
                <OrbitControls />
                <LlamaCore />
              </Canvas>
            </div>
          </div>
        </div>
      </section>

      {/* Particle Effects Section */}
      <section 
        ref={el => sectionRefs.current['particles'] = el as HTMLDivElement}
        className="min-h-screen py-24 bg-gradient-to-b from-indigo-900 to-purple-900 text-white"
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="h-[500px] order-2 lg:order-1">
              <Canvas onCreated={({gl}) => saveCanvasRef('particles')(gl.domElement)}>
                <ParticleEffectsApp />
              </Canvas>
            </div>
            <div className="p-6 order-1 lg:order-2">
              <h2 className="text-3xl font-bold mb-4">Particle Systems</h2>
              <p className="mb-4">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, 
                nisl eget aliquam ultricies, nunc nisl aliquet nunc, quis aliquam nisl 
                nunc quis nisl. Suspendisse potenti. Donec euismod, nisl eget aliquam ultricies,
                nunc nisl aliquet nunc, quis aliquam nisl nunc quis nisl.
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="px-3 py-1 bg-blue-600 rounded-full text-sm">Particle Systems</span>
                <span className="px-3 py-1 bg-green-600 rounded-full text-sm">Post-processing</span>
                <span className="px-3 py-1 bg-yellow-600 rounded-full text-sm">Interactive</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Object Clump Section */}
      <section 
        ref={el => sectionRefs.current['objects'] = el as HTMLDivElement}
        className="min-h-screen py-24 bg-gradient-to-b from-purple-900 to-pink-900 text-white"
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="p-6">
              <h2 className="text-3xl font-bold mb-4">Interactive Physics Objects</h2>
              <p className="mb-4">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, 
                nisl eget aliquam ultricies, nunc nisl aliquet nunc, quis aliquam nisl 
                nunc quis nisl. Vestibulum ante ipsum primis in faucibus orci luctus et
                ultrices posuere cubilia curae; Donec euismod, nisl eget.
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="px-3 py-1 bg-blue-600 rounded-full text-sm">Physics</span>
                <span className="px-3 py-1 bg-green-600 rounded-full text-sm">Interaction</span>
                <span className="px-3 py-1 bg-yellow-600 rounded-full text-sm">Dynamics</span>
              </div>
            </div>
            <div className="h-[500px]">
              <Canvas 
                shadows 
                gl={{ antialias: false }} 
                dpr={[1, 1.5]} 
                camera={{ position: [0, 0, 20], fov: 35, near: 1, far: 40 }}
                onCreated={({gl}) => saveCanvasRef('objects')(gl.domElement)}
              >
                <ObjectClumpScene />
              </Canvas>
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
              <Canvas 
                orthographic 
                camera={{ zoom: 80, position: [0, 0, 100] }}
                onCreated={({gl}) => saveCanvasRef('nodes')(gl.domElement)}
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
            </div>
            <div className="p-6 order-1 lg:order-2">
              <h2 className="text-3xl font-bold mb-4">Network Visualization</h2>
              <p className="mb-4">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, 
                nisl eget aliquam ultricies, nunc nisl aliquet nunc, quis aliquam nisl 
                nunc quis nisl. Etiam euismod, nisl eget aliquam ultricies.
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

      {/* Monitor Components Section */}
      <section 
        ref={el => sectionRefs.current['monitors'] = el as HTMLDivElement}
        className="min-h-screen py-24 bg-gradient-to-b from-red-900 to-yellow-900 text-white"
      >
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">Monitor Components</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Processing Load */}
            <div className="bg-black bg-opacity-30 rounded-lg p-6">
              <h3 className="text-xl font-medium mb-4">Processing Load</h3>
              <div className="h-[200px]">
                <Canvas onCreated={({gl}) => saveCanvasRef('monitor1')(gl.domElement)}>
                  <ambientLight />
                  <pointLight position={[10, 10, 10]} />
                  <ProcessingLoadBar value={0.7} label="Processing Load" color="red" />
                  <OrbitControls />
                </Canvas>
              </div>
              <p className="mt-4">
                Real-time processing load visualization with dynamic color changes.
              </p>
            </div>

            {/* Synaptic Connections */}
            <div className="bg-black bg-opacity-30 rounded-lg p-6">
              <h3 className="text-xl font-medium mb-4">Synaptic Connections</h3>
              <div className="h-[200px]">
                <Canvas camera={{position: [0,0,5]}} onCreated={({gl}) => saveCanvasRef('monitor2')(gl.domElement)}>
                  <ambientLight />
                  <pointLight position={[10, 10, 10]} />
                  <SynapticConnections value={0.5} label="Synaptic Connections" />
                  <OrbitControls />
                </Canvas>
              </div>
              <p className="mt-4">
                Visualizing dynamic connections between neural network nodes.
              </p>
            </div>

            {/* Data Flow */}
            <div className="bg-black bg-opacity-30 rounded-lg p-6">
              <h3 className="text-xl font-medium mb-4">Data Flow</h3>
              <div className="h-[200px]">
                <Canvas camera={{position: [0,0,5]}} onCreated={({gl}) => saveCanvasRef('monitor3')(gl.domElement)}>
                  <ambientLight />
                  <pointLight position={[10, 10, 10]} />
                  <DataFlow value={0.8} label="Data Flow" />
                  <OrbitControls />
                </Canvas>
              </div>
              <p className="mt-4">
                Animated particle system representing data flow through a system.
              </p>
            </div>

            {/* Anticipation Index */}
            <div className="bg-black bg-opacity-30 rounded-lg p-6">
              <h3 className="text-xl font-medium mb-4">Anticipation Index</h3>
              <div className="h-[200px]">
                <Canvas camera={{position: [0,0,3]}} onCreated={({gl}) => saveCanvasRef('monitor4')(gl.domElement)}>
                  <ambientLight />
                  <pointLight position={[10, 10, 10]} />
                  <AnticipationIndex value={0.3} label="Anticipation Index" />
                  <OrbitControls />
                </Canvas>
              </div>
              <p className="mt-4">
                Circular visualization for tracking anticipation metrics.
              </p>
            </div>

            {/* Prompt Completion */}
            <div className="bg-black bg-opacity-30 rounded-lg p-6">
              <h3 className="text-xl font-medium mb-4">Prompt Completion</h3>
              <div className="h-[200px]">
                <Canvas camera={{position: [0,0,3]}} onCreated={({gl}) => saveCanvasRef('monitor5')(gl.domElement)}>
                  <ambientLight />
                  <pointLight position={[10, 10, 10]} />
                  <PromptCompletionProbability value={.9} label='Prompt Completion' color="magenta"/>
                  <OrbitControls />
                </Canvas>
              </div>
              <p className="mt-4">
                Progress indicator for prompt completion probability.
              </p>
            </div>

            {/* Copilot Visualization */}
            <div className="bg-black bg-opacity-30 rounded-lg p-6">
              <h3 className="text-xl font-medium mb-4">Copilot Visualization</h3>
              <div className="h-[200px]">
                <Canvas onCreated={({gl}) => saveCanvasRef('monitor6')(gl.domElement)}>
                  <CopilotVisualization />
                </Canvas>
              </div>
              <p className="mt-4">
                Voxel-based representation of GitHub Copilot's neural architecture.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section 
        ref={el => sectionRefs.current['contact'] = el as HTMLDivElement}
        className="min-h-screen py-24 bg-gradient-to-b from-yellow-900 to-black text-white"
      >
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8">Get In Touch</h2>
          <p className="text-xl mb-12 max-w-2xl mx-auto">
            Interested in incorporating interactive 3D visualizations in your next project?
            Let's talk about how we can bring your data and ideas to life!
          </p>
          
          <div className="flex justify-center space-x-6 mb-12">
            <a href="#" className="p-4 bg-blue-600 hover:bg-blue-700 rounded-full">
              <span className="sr-only">LinkedIn</span>
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.454C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z"/>
              </svg>
            </a>
            <a href="#" className="p-4 bg-gray-600 hover:bg-gray-700 rounded-full">
              <span className="sr-only">GitHub</span>
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
            </a>
            <a href="#" className="p-4 bg-red-600 hover:bg-red-700 rounded-full">
              <span className="sr-only">Email</span>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </a>
          </div>
          
          <div className="bg-black bg-opacity-50 p-8 rounded-lg max-w-lg mx-auto">
            <h3 className="text-xl font-bold mb-4">Send me a message</h3>
            <form className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-left mb-1">Name</label>
                <input type="text" id="name" className="w-full px-4 py-2 bg-gray-800 rounded" />
              </div>
              <div>
                <label htmlFor="email" className="block text-left mb-1">Email</label>
                <input type="email" id="email" className="w-full px-4 py-2 bg-gray-800 rounded" />
              </div>
              <div>
                <label htmlFor="message" className="block text-left mb-1">Message</label>
                <textarea id="message" rows={4} className="w-full px-4 py-2 bg-gray-800 rounded"></textarea>
              </div>
              <button type="submit" className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded">
                Send Message
              </button>
            </form>
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

// Module declarations for components that don't have TypeScript types
declare module './components/particle_effects' {
  // Use a different name in the declaration to avoid conflicts
  export const App: React.ComponentType;
}