import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Box, Line, Text } from '@react-three/drei';
import * as THREE from 'three';

interface RadarVisualizationProps {
  resolution?: number;
  range?: number;
  scanSpeed?: number;
  detectObjects?: boolean;
  points?: { x: number; y: number; z: number; intensity: number }[];
}

export const RadarVisualization: React.FC<RadarVisualizationProps> = ({
  resolution = 64,
  range = 5,
  scanSpeed = 0.5,
  detectObjects = true,
  points = [],
}) => {
  const radarRef = useRef<THREE.Group>(null);
  const scannerRef = useRef<THREE.Mesh>(null);
  const radarPoints = useRef<THREE.Points>(null);
  
  // Generate simulated radar data points
  const radarData = useMemo(() => {
    if (points && points.length > 0) return points;
    
    const generatedPoints = [];
    const objectCount = Math.floor(Math.random() * 5) + 3;
    
    for (let i = 0; i < objectCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = (Math.random() * 0.6 + 0.3) * range;
      const x = Math.cos(angle) * distance;
      const z = Math.sin(angle) * distance;
      const y = (Math.random() - 0.5) * 0.5;
      const intensity = Math.random() * 0.5 + 0.5;
      
      // Create a cluster of points representing an object
      const pointCount = Math.floor(Math.random() * 15) + 5;
      for (let j = 0; j < pointCount; j++) {
        const jitter = 0.2;
        generatedPoints.push({ 
          x: x + (Math.random() - 0.5) * jitter, 
          y: y + (Math.random() - 0.5) * jitter, 
          z: z + (Math.random() - 0.5) * jitter,
          intensity
        });
      }
    }
    
    return generatedPoints;
  }, [points, range]);
  
  // Create the particles for radar points
  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(radarData.length * 3);
    const colors = new Float32Array(radarData.length * 3);
    
    radarData.forEach((point, i) => {
      positions[i * 3] = point.x;
      positions[i * 3 + 1] = point.y;
      positions[i * 3 + 2] = point.z;
      
      // Color based on intensity
      const color = new THREE.Color().setHSL(0.55, 1.0, 0.5 * point.intensity + 0.3);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    });
    
    return { positions, colors };
  }, [radarData]);

  // Create the radar scan line points
  const scanLinePoints = useMemo(() => {
    const points = [];
    points.push(new THREE.Vector3(0, 0, 0));
    points.push(new THREE.Vector3(range, 0, 0));
    return points;
  }, [range]);

  // Create radar range rings
  const rangeRings = useMemo(() => {
    const rings = [];
    const segments = 64;
    
    for (let i = 1; i <= 3; i++) {
      const radius = range * (i / 3);
      const points = [];
      
      for (let j = 0; j <= segments; j++) {
        const theta = (j / segments) * Math.PI * 2;
        points.push(new THREE.Vector3(
          Math.cos(theta) * radius,
          0,
          Math.sin(theta) * radius
        ));
      }
      rings.push(points);
    }
    
    return rings;
  }, [range]);

  // Animation loop
  useFrame(({ clock }) => {
    if (radarRef.current) {
      // Rotate the scan line
      radarRef.current.rotation.y = clock.getElapsedTime() * scanSpeed;
    }
    
    if (scannerRef.current) {
      // Pulse effect for the scanner
      const pulse = Math.sin(clock.getElapsedTime() * 3) * 0.2 + 0.8;
      scannerRef.current.scale.set(pulse, pulse, pulse);
    }
    
    if (radarPoints.current) {
      // Only show points that have been "scanned" by the radar
      const pointMaterial = radarPoints.current.material as THREE.PointsMaterial;
      const radarAngle = radarRef.current?.rotation.y || 0;
      const angleThreshold = Math.PI / 6; // Points are visible within this angle of the scan line
      
      const alphas = new Float32Array(radarData.length);
      
      radarData.forEach((point, i) => {
        // Calculate angle between point and scan line
        const pointAngle = Math.atan2(point.z, point.x);
        let angleDiff = (radarAngle - pointAngle + Math.PI * 2) % (Math.PI * 2);
        if (angleDiff > Math.PI) angleDiff = Math.PI * 2 - angleDiff;
        
        // Fade points based on how recently they were scanned
        const timeSinceLastScan = Math.min(angleDiff, Math.PI * 2 - angleDiff) / scanSpeed;
        const fade = Math.max(0, 1 - timeSinceLastScan / 5);
        
        // Set point alpha
        alphas[i] = fade;
      });
      
      // Update the opacity attribute if it exists
      if (pointMaterial.userData.opacityAttribute) {
        pointMaterial.userData.opacityAttribute.array = alphas;
        pointMaterial.userData.opacityAttribute.needsUpdate = true;
      }
    }
  });

  return (
    <group>
      {/* Base platform */}
      <Sphere args={[0.2, 16, 16]} position={[0, -0.1, 0]}>
        <meshStandardMaterial color="#333333" />
      </Sphere>
      
      <Box args={[0.3, 0.1, 0.3]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#666666" />
      </Box>
      
      {/* Radar display surface */}
      <Sphere args={[range, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial 
          color="#001122"
          transparent={true}
          opacity={0.1}
          wireframe={true}
        />
      </Sphere>
      
      {/* Range rings */}
      {rangeRings.map((ring, index) => (
        <Line 
          key={`ring-${index}`}
          points={ring} 
          color="#00aa66" 
          lineWidth={1}
          transparent 
          opacity={0.3} 
        />
      ))}
      
      {/* Axis indicators */}
      <Line 
        points={[new THREE.Vector3(-range, 0, 0), new THREE.Vector3(range, 0, 0)]} 
        color="#ff2222" 
        transparent 
        opacity={0.3} 
      />
      <Line 
        points={[new THREE.Vector3(0, 0, -range), new THREE.Vector3(0, 0, range)]} 
        color="#2222ff" 
        transparent 
        opacity={0.3} 
      />
      
      {/* Radar scan line that rotates */}
      <group ref={radarRef}>
        <Line 
          points={scanLinePoints} 
          color="#00ffaa" 
          lineWidth={2}
        />
        <Sphere ref={scannerRef} args={[0.1, 16, 16]} position={[0.2, 0, 0]}>
          <meshStandardMaterial color="#00ffaa" emissive="#00ffaa" emissiveIntensity={2} />
        </Sphere>
      </group>
      
      {/* Display the radar data points */}
      <points ref={radarPoints}>
        <bufferGeometry>
          <bufferAttribute 
            attach="attributes-position" 
            count={positions.length / 3} 
            array={positions} 
            itemSize={3} 
          />
          <bufferAttribute 
            attach="attributes-color" 
            count={colors.length / 3} 
            array={colors} 
            itemSize={3} 
          />
        </bufferGeometry>
        <pointsMaterial 
          size={0.1} 
          vertexColors 
          transparent 
          sizeAttenuation 
          opacity={0.8}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          onBeforeCompile={(shader) => {
            // Add custom opacity attribute for fade effect
            shader.vertexShader = shader.vertexShader.replace(
              'attribute vec3 position;',
              'attribute vec3 position;\nattribute float opacity;'
            );
            shader.vertexShader = shader.vertexShader.replace(
              '#include <common>',
              '#include <common>\nvarying float vOpacity;'
            );
            shader.vertexShader = shader.vertexShader.replace(
              '#include <begin_vertex>',
              '#include <begin_vertex>\nvOpacity = opacity;'
            );
            
            shader.fragmentShader = shader.fragmentShader.replace(
              '#include <common>',
              '#include <common>\nvarying float vOpacity;'
            );
            shader.fragmentShader = shader.fragmentShader.replace(
              'gl_FragColor = vec4( outgoingLight, diffuseColor.a );',
              'gl_FragColor = vec4( outgoingLight, diffuseColor.a * vOpacity );'
            );
          }}
        />
      </points>
      
      {/* Labels */}
      <Text
        position={[range + 0.5, 0, 0]}
        color="#ffffff"
        fontSize={0.2}
        anchorX="left"
      >
        {range}m
      </Text>
      
      <Text
        position={[0, 0, -range - 0.5]}
        color="#ffffff"
        fontSize={0.2}
        anchorX="center"
      >
        Radar Scan
      </Text>
    </group>
  );
};

export default RadarVisualization;