import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// Remove the incorrect extension - Canvas should be imported from @react-three/fiber, not extended
// extend({ Canvas });

/**
 * GrokVisualization Component
 * Renders a 3D abstract representation of Grok with nodes and connections.
 */
export const GrokVisualization: React.FC = () => {
  // References to scene objects
  const groupRef = useRef<THREE.Group>(null!);
  const lightRef = useRef<THREE.PointLight>(null!);
  const nodes = useRef<THREE.Mesh[]>([]);
  const lines = useRef<THREE.Line[]>([]);
  const hoveredNode = useRef<THREE.Mesh | null>(null);

  // Access Three.js camera from @react-three/fiber
  const { camera } = useThree();

  // Initialize the scene
  useEffect(() => {
    const numNodes = 50;
    const connectionThreshold = 2;

    // Add ambient light for base illumination
    const ambientLight = new THREE.AmbientLight(0x404040); // Soft gray light
    groupRef.current.add(ambientLight);

    // Create nodes with random positions, sizes, and colors
    for (let i = 0; i < numNodes; i++) {
      const size = 0.05 + Math.random() * 0.1; // Node size between 0.05 and 0.15
      const nodeGeometry = new THREE.SphereGeometry(size, 16, 16);
      const nodeMaterial = new THREE.MeshPhongMaterial({
        color: new THREE.Color().setHSL(0.6 + Math.random() * 0.2, 1, 0.5), // Blue to purple hues
        shininess: 100,
      });
      const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
      node.position.set(
        Math.random() * 10 - 5, // x: -5 to 5
        Math.random() * 10 - 5, // y: -5 to 5
        Math.random() * 10 - 5  // z: -5 to 5
      );
      nodes.current.push(node);
      groupRef.current.add(node);
    }

    // Create connections between nearby nodes
    for (let i = 0; i < numNodes; i++) {
      for (let j = i + 1; j < numNodes; j++) {
        const dist = nodes.current[i].position.distanceTo(nodes.current[j].position);
        if (dist < connectionThreshold) {
          const lineGeometry = new THREE.BufferGeometry().setFromPoints([
            nodes.current[i].position,
            nodes.current[j].position,
          ]);
          const lineMaterial = new THREE.LineBasicMaterial({
            color: 0x800080, // Purple
            transparent: true,
            opacity: 0.5,
          });
          const line = new THREE.Line(lineGeometry, lineMaterial);
          lines.current.push(line);
          groupRef.current.add(line);
        }
      }
    }

    // Add a moving point light for dynamic lighting
    const light = new THREE.PointLight(0xffffff, 2, 100); // White light, intensity 2
    light.position.set(5, 5, 5);
    lightRef.current = light;
    groupRef.current.add(light);

    // Set up raycaster for interactivity
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseMove = (event: MouseEvent) => {
      // Normalize mouse coordinates to [-1, 1]
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(nodes.current);

      if (intersects.length > 0) {
        const node = intersects[0].object as THREE.Mesh;
        if (hoveredNode.current !== node) {
          // Reset previous hovered node
          if (hoveredNode.current) {
            hoveredNode.current.scale.set(1, 1, 1);
          }
          hoveredNode.current = node;
          node.scale.set(1.5, 1.5, 1.5); // Scale up on hover
        }
      } else {
        // Reset if no intersection
        if (hoveredNode.current) {
          hoveredNode.current.scale.set(1, 1, 1);
          hoveredNode.current = null;
        }
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, [camera]);

  // Animation loop
  useFrame((state, delta) => {
    // Rotate the entire group
    groupRef.current.rotation.y += delta * 0.1;

    // Move the light in a circular path
    lightRef.current.position.x = 5 * Math.sin(state.clock.elapsedTime);
    lightRef.current.position.z = 5 * Math.cos(state.clock.elapsedTime);

    // Animate node scales (pulsating effect)
    nodes.current.forEach((node, index) => {
      const scale = 1 + 0.1 * Math.sin(state.clock.elapsedTime * 2 + index);
      node.scale.set(scale, scale, scale);
    });

    // Animate line opacities (shimmering effect)
    lines.current.forEach((line, index) => {
      (line.material as THREE.LineBasicMaterial).opacity =
        0.5 + 0.5 * Math.sin(state.clock.elapsedTime + index);
    });
  });

  return <group ref={groupRef} />;
};

/**
 * App Component
 * Wraps the visualization in a Canvas with camera and styling.
 */
const App: React.FC = () => {
  return (
    <Canvas camera={{ position: [0, 0, 10] }} style={{ background: '#000020' }}>
      <GrokVisualization />
    </Canvas>
  );
};

export default App;