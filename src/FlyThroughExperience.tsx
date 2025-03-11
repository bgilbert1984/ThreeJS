import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { Vector3, Quaternion } from 'three';
import { FeatherControls } from './controls/FeatherControls';
import { ComponentScene } from './ComponentScene';
import './FlyThroughExperience.css';

/**
 * Main component that creates the fly-through experience
 */
const FlyThroughExperience: React.FC = () => {
  const [componentsLoaded, setComponentsLoaded] = useState(false);
  const [componentNames, setComponentNames] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fetch available component names on mount
  useEffect(() => {
    // In a real environment, you might get this from an API
    // For now, simulate loading components by setting predefined names
    const loadComponentNames = async () => {
      try {
        // This would be replaced with actual component discovery
        const names = [
          'Nodes', 
          'QuestDBConnector', 
          'ParticleSystem', 
          'EnvironmentScene',
          'TextGeometry'
        ];
        
        setComponentNames(names);
        setComponentsLoaded(true);
      } catch (error) {
        console.error('Error loading components:', error);
      }
    };
    
    loadComponentNames();
  }, []);

  // Navigate to the next component
  const navigateNext = () => {
    if (currentIndex < componentNames.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  // Navigate to the previous component
  const navigatePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  return (
    <div className="fly-through-container">
      {/* Navigation UI */}
      <div className="navigation-ui">
        <button 
          className="nav-button prev" 
          onClick={navigatePrevious}
          disabled={currentIndex === 0}
        >
          ← Previous
        </button>
        <div className="component-info">
          {componentsLoaded ? (
            <h2>{componentNames[currentIndex] || 'Loading...'}</h2>
          ) : (
            <h2>Loading components...</h2>
          )}
          <div className="progress-indicator">
            {componentNames.map((_, idx) => (
              <span 
                key={idx} 
                className={`progress-dot ${idx === currentIndex ? 'active' : ''}`}
                onClick={() => setCurrentIndex(idx)}
              />
            ))}
          </div>
        </div>
        <button 
          className="nav-button next" 
          onClick={navigateNext}
          disabled={currentIndex === componentNames.length - 1 || !componentsLoaded}
        >
          Next →
        </button>
      </div>

      {/* Canvas for Three.js */}
      <Canvas shadows dpr={[1, 2]} className="canvas">
        <color attach="background" args={['#050505']} />
        <fog attach="fog" args={['#050505', 15, 30]} />
        <ambientLight intensity={0.4} />
        <directionalLight 
          position={[10, 10, 10]} 
          intensity={1} 
          castShadow 
          shadow-mapSize={[2048, 2048]} 
        />
        
        <Suspense fallback={<LoadingFallback />}>
          {componentsLoaded && (
            <Scene 
              componentName={componentNames[currentIndex]} 
              index={currentIndex}
              total={componentNames.length}
            />
          )}
        </Suspense>
        
        <CameraController 
          targetIndex={currentIndex} 
          totalComponents={componentNames.length} 
        />
      </Canvas>
      
      {/* Instructions overlay */}
      <div className="instructions">
        <p>
          <strong>WASD</strong> - Move | <strong>Mouse</strong> - Look | 
          <strong>Space</strong> - Rise | <strong>Shift</strong> - Descend
        </p>
        <p>Press <strong>F</strong> to auto-fly to next component</p>
      </div>
    </div>
  );
};

// Loading fallback component
const LoadingFallback: React.FC = () => {
  return (
    <mesh position={[0, 0, 0]}>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial color="#ffffff" wireframe />
    </mesh>
  );
};

// Camera controller with feather controls
const CameraController: React.FC<{
  targetIndex: number;
  totalComponents: number;
}> = ({ targetIndex, totalComponents }) => {
  const { camera, gl } = useThree();
  const controlsRef = useRef<any>(null);
  const targetPosition = useRef(new Vector3(0, 1.6, 0));
  
  // Initialize feather controls
  useEffect(() => {
    const controls = new FeatherControls(camera, gl.domElement);
    controlsRef.current = controls;
    
    // Enable the controls
    controls.enabled = true;
    controls.speed = 0.1;
    controls.damping = 0.1;
    controls.flySpeed = 0.5;
    
    return () => {
      controls.dispose();
    };
  }, [camera, gl]);
  
  // Update target position when component index changes
  useEffect(() => {
    if (totalComponents > 0) {
      // Position components in a circular pattern
      const angle = (targetIndex / totalComponents) * Math.PI * 2;
      const radius = 20;
      
      targetPosition.current.set(
        Math.sin(angle) * radius,
        1.6, // Eye level
        Math.cos(angle) * radius
      );
    }
  }, [targetIndex, totalComponents]);
  
  // Frame update - smooth camera movement
  useFrame(() => {
    if (controlsRef.current) {
      controlsRef.current.update();
    }
  });
  
  return null;
};

// Dynamic component scene
interface SceneProps {
  componentName: string;
  index: number;
  total: number;
}

const Scene: React.FC<SceneProps> = ({ componentName, index, total }) => {
  // Position components in a circular pattern
  const angle = (index / total) * Math.PI * 2;
  const radius = 20;
  const position: [number, number, number] = [
    Math.sin(angle) * radius,
    0,
    Math.cos(angle) * radius
  ];

  return (
    <group position={position}>
      <ComponentScene name={componentName} />
      {/* Platform/pedestal for the component */}
      <mesh position={[0, -1, 0]} receiveShadow>
        <cylinderGeometry args={[5, 5, 0.5, 32]} />
        <meshStandardMaterial color="#333" metalness={0.5} roughness={0.4} />
      </mesh>
      {/* Component name label */}
      <Billboard position={[0, -2, 0]}>
        <div className="component-label">{componentName}</div>
      </Billboard>
    </group>
  );
};

// Billboard component to face the camera
interface BillboardProps {
  children: React.ReactNode;
  position: [number, number, number];
}

const Billboard: React.FC<BillboardProps> = ({ children, position }) => {
  const ref = useRef<THREE.Group>(null);
  const { camera } = useThree();
  
  useFrame(() => {
    if (ref.current) {
      ref.current.quaternion.copy(camera.quaternion);
    }
  });
  
  return (
    <group ref={ref} position={position}>
      <Html center>{children}</Html>
    </group>
  );
};

// HTML content in 3D space
interface HtmlProps {
  children: React.ReactNode;
  center?: boolean;
}

const Html: React.FC<HtmlProps> = ({ children, center = false }) => {
  return (
    <div className={`html-content ${center ? 'center' : ''}`}>
      {children}
    </div>
  );
};

export default FlyThroughExperience;