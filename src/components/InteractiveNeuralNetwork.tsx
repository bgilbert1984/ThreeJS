import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';

interface NeuronProps {
  position: [number, number, number];
  size?: number;
  color?: string;
  active?: boolean;
  onActivate?: () => void;
}

const Neuron: React.FC<NeuronProps> = ({ 
  position, 
  size = 0.4, 
  color = "white", 
  active = false,
  onActivate
}) => {
  const mesh = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  
  // Animation
  useFrame(() => {
    if (!mesh.current) return;
    
    // Pulse effect when active
    if (active) {
      mesh.current.scale.x = THREE.MathUtils.lerp(mesh.current.scale.x, 1.2, 0.1);
      mesh.current.scale.y = THREE.MathUtils.lerp(mesh.current.scale.y, 1.2, 0.1);
      mesh.current.scale.z = THREE.MathUtils.lerp(mesh.current.scale.z, 1.2, 0.1);
    } else {
      mesh.current.scale.x = THREE.MathUtils.lerp(mesh.current.scale.x, 1, 0.1);
      mesh.current.scale.y = THREE.MathUtils.lerp(mesh.current.scale.y, 1, 0.1);
      mesh.current.scale.z = THREE.MathUtils.lerp(mesh.current.scale.z, 1, 0.1);
    }
    
    // Rotation effect
    mesh.current.rotation.x += 0.01;
    mesh.current.rotation.y += 0.01;
  });
  
  return (
    <mesh
      ref={mesh}
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        setClicked(!clicked);
        if (onActivate) onActivate();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(false);
      }}
    >
      <sphereGeometry args={[size, 32, 32]} />
      <meshStandardMaterial 
        color={active ? "#ff9900" : hovered ? "#0088ff" : color} 
        emissive={active ? "#ff5500" : "black"}
        emissiveIntensity={active ? 2 : 0}
        roughness={0.2} 
        metalness={0.8} 
      />
    </mesh>
  );
};

interface ConnectionProps {
  start: [number, number, number];
  end: [number, number, number];
  active?: boolean;
  width?: number;
}

const Connection: React.FC<ConnectionProps> = ({ 
  start, 
  end, 
  active = false,
  width = 0.05
}) => {
  const ref = useRef<THREE.Mesh>(null);
  
  // Calculate direction and length
  const direction = new THREE.Vector3(
    end[0] - start[0],
    end[1] - start[1],
    end[2] - start[2]
  );
  const length = direction.length();
  
  // Calculate center point and orientation
  const center = [
    (start[0] + end[0]) / 2,
    (start[1] + end[1]) / 2,
    (start[2] + end[2]) / 2
  ];
  
  // Animation for active connections
  useFrame(() => {
    if (!ref.current) return;
    
    if (active) {
      // Change color or opacity when active
      const material = ref.current.material as THREE.MeshStandardMaterial;
      material.opacity = THREE.MathUtils.lerp(material.opacity, 1, 0.1);
      material.emissiveIntensity = THREE.MathUtils.lerp(material.emissiveIntensity, 1.5, 0.1);
    } else {
      const material = ref.current.material as THREE.MeshStandardMaterial;
      material.opacity = THREE.MathUtils.lerp(material.opacity, 0.5, 0.1);
      material.emissiveIntensity = THREE.MathUtils.lerp(material.emissiveIntensity, 0, 0.1);
    }
  });
  
  // Create a cylinder rotated to connect the points
  return (
    <group position={center as [number, number, number]}>
      <mesh
        ref={ref}
        rotation={[
          Math.atan2(
            Math.sqrt(direction.x * direction.x + direction.z * direction.z),
            direction.y
          ) - Math.PI / 2,
          0,
          Math.atan2(direction.z, direction.x)
        ]}
      >
        <cylinderGeometry args={[width, width, length, 8]} />
        <meshStandardMaterial
          color={active ? "#ff5500" : "#444444"}
          transparent={true}
          opacity={active ? 1 : 0.5}
          emissive={active ? "#ff9900" : "#222222"}
          emissiveIntensity={active ? 1.5 : 0}
          roughness={0.3}
        />
      </mesh>
    </group>
  );
};

// Types for our neural network
interface NetworkLayer {
  neurons: number;
  name: string;
}

interface NeuralNetworkProps {
  layers: NetworkLayer[];
  layerSpacing?: number;
  neuronSpacing?: number;
  onActivationChange?: (activations: boolean[][]) => void;
}

const NeuralNetwork: React.FC<NeuralNetworkProps> = ({ 
  layers, 
  layerSpacing = 2.5,
  neuronSpacing = 1.2,
  onActivationChange
}) => {
  const [activations, setActivations] = useState<boolean[][]>([]);
  const [neuronPositions, setNeuronPositions] = useState<[number, number, number][][]>([]);
  
  // Initialize activations and positions
  useEffect(() => {
    const newActivations = layers.map(layer => 
      Array(layer.neurons).fill(false)
    );
    setActivations(newActivations);
    
    // Calculate neuron positions
    const positions = layers.map((layer, layerIndex) => {
      return Array(layer.neurons).fill(0).map((_, neuronIndex) => {
        const x = (layerIndex - (layers.length - 1) / 2) * layerSpacing;
        const y = (neuronIndex - (layer.neurons - 1) / 2) * neuronSpacing;
        return [x, y, 0] as [number, number, number];
      });
    });
    setNeuronPositions(positions);
  }, [layers, layerSpacing, neuronSpacing]);
  
  // Handle neuron activation
  const handleActivate = (layerIndex: number, neuronIndex: number) => {
    const newActivations = [...activations];
    newActivations[layerIndex][neuronIndex] = !newActivations[layerIndex][neuronIndex];
    
    // If activating a neuron in a layer other than the output layer,
    // activate connected neurons in the next layer
    if (layerIndex < layers.length - 1 && newActivations[layerIndex][neuronIndex]) {
      // Activate random neurons in the next layer
      const nextLayer = newActivations[layerIndex + 1];
      const targetCount = Math.max(1, Math.floor(nextLayer.length * 0.3)); // Activate ~30% of neurons
      
      const candidates = Array(nextLayer.length).fill(0).map((_, i) => i);
      for (let i = 0; i < targetCount; i++) {
        const randomIndex = Math.floor(Math.random() * candidates.length);
        const targetIndex = candidates.splice(randomIndex, 1)[0];
        nextLayer[targetIndex] = true;
      }
    }
    
    setActivations(newActivations);
    if (onActivationChange) {
      onActivationChange(newActivations);
    }
  };
  
  // Create signal pulse effect for connections
  const [connectionActivations, setConnectionActivations] = useState<boolean[][]>([]);
  
  useEffect(() => {
    // Initialize connection activations based on layers
    const newConnectionActivations = [];
    for (let i = 0; i < layers.length - 1; i++) {
      const sourceLayer = layers[i];
      const targetLayer = layers[i + 1];
      const connections = Array(sourceLayer.neurons * targetLayer.neurons).fill(false);
      newConnectionActivations.push(connections);
    }
    setConnectionActivations(newConnectionActivations);
  }, [layers]);
  
  // Propagate activations through the network
  useEffect(() => {
    if (activations.length === 0) return;
    
    // Create new connection activations
    const newConnectionActivations = connectionActivations.map((layerConnections, layerIndex) => {
      const sourceLayer = activations[layerIndex];
      const targetLayer = activations[layerIndex + 1];
      const sourceNeuronCount = sourceLayer.length;
      const targetNeuronCount = targetLayer.length;
      
      return Array(sourceNeuronCount * targetNeuronCount).fill(false).map((_, connectionIndex) => {
        const sourceNeuronIndex = Math.floor(connectionIndex / targetNeuronCount);
        const targetNeuronIndex = connectionIndex % targetNeuronCount;
        
        // Activate connection if source and target neurons are both active
        return sourceLayer[sourceNeuronIndex] && targetLayer[targetNeuronIndex];
      });
    });
    
    setConnectionActivations(newConnectionActivations);
  }, [activations]);
  
  // Create connections between layers
  const renderConnections = () => {
    if (neuronPositions.length < 2) return null;
    
    const connections = [];
    for (let layerIndex = 0; layerIndex < layers.length - 1; layerIndex++) {
      const sourceLayer = neuronPositions[layerIndex];
      const targetLayer = neuronPositions[layerIndex + 1];
      const sourceNeuronCount = sourceLayer.length;
      const targetNeuronCount = targetLayer.length;
      
      for (let sourceNeuronIndex = 0; sourceNeuronIndex < sourceNeuronCount; sourceNeuronIndex++) {
        for (let targetNeuronIndex = 0; targetNeuronIndex < targetNeuronCount; targetNeuronIndex++) {
          const connectionIndex = sourceNeuronIndex * targetNeuronCount + targetNeuronIndex;
          const isActive = connectionActivations[layerIndex] && 
                          connectionActivations[layerIndex][connectionIndex];
          
          connections.push(
            <Connection
              key={`${layerIndex}-${sourceNeuronIndex}-${targetNeuronIndex}`}
              start={sourceLayer[sourceNeuronIndex]}
              end={targetLayer[targetNeuronIndex]}
              active={isActive}
              width={0.03}
            />
          );
        }
      }
    }
    
    return connections;
  };
  
  return (
    <group>
      {/* Layer labels */}
      {layers.map((layer, layerIndex) => {
        if (neuronPositions[layerIndex] && neuronPositions[layerIndex].length > 0) {
          const x = neuronPositions[layerIndex][0][0];
          const topY = neuronPositions[layerIndex][0][1] + neuronSpacing;
          
          return (
            <Text
              key={`label-${layerIndex}`}
              position={[x, topY, 0]}
              color="white"
              fontSize={0.3}
              anchorX="center"
              anchorY="bottom"
            >
              {layer.name}
            </Text>
          );
        }
        return null;
      })}
      
      {/* Connections */}
      {renderConnections()}
      
      {/* Neurons */}
      {neuronPositions.map((layer, layerIndex) => (
        <group key={`layer-${layerIndex}`}>
          {layer.map((position, neuronIndex) => (
            <Neuron
              key={`neuron-${layerIndex}-${neuronIndex}`}
              position={position}
              active={activations[layerIndex] && activations[layerIndex][neuronIndex]}
              onActivate={() => handleActivate(layerIndex, neuronIndex)}
              color={`hsl(${210 + layerIndex * 30}, 70%, 70%)`}
            />
          ))}
        </group>
      ))}
    </group>
  );
};

interface NeuralNetworkVisualizationProps {
  networkConfig?: NetworkLayer[];
}

const NeuralNetworkVisualization: React.FC<NeuralNetworkVisualizationProps> = ({
  networkConfig
}) => {
  // Default network configuration
  const defaultNetwork: NetworkLayer[] = [
    { neurons: 4, name: "Input" },
    { neurons: 6, name: "Hidden 1" },
    { neurons: 8, name: "Hidden 2" },
    { neurons: 3, name: "Output" }
  ];
  
  const network = networkConfig || defaultNetwork;
  const [activationData, setActivationData] = useState<boolean[][]>([]);
  
  const handleActivationChange = (newActivations: boolean[][]) => {
    setActivationData(newActivations);
  };
  
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#0088ff" />
        
        <NeuralNetwork 
          layers={network} 
          onActivationChange={handleActivationChange}
        />
        
        <OrbitControls 
          enableZoom={true} 
          enablePan={true} 
          enableRotate={true} 
          minDistance={5}
          maxDistance={20}
        />
      </Canvas>
      
      <div 
        style={{ 
          position: 'absolute', 
          bottom: '10px', 
          left: '10px', 
          background: 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: '10px',
          borderRadius: '5px',
          maxWidth: '300px'
        }}
      >
        <h3 style={{ marginTop: 0 }}>Interactive Neural Network</h3>
        <p>Click on neurons to activate them and see signal propagation through the network.</p>
        <div>
          <small>
            Active neurons: {
              activationData.reduce((count, layer) => 
                count + layer.filter(active => active).length, 0
              )
            }
          </small>
        </div>
      </div>
    </div>
  );
};

export default NeuralNetworkVisualization;
