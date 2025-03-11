import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Plane, Box, Text, useTexture } from '@react-three/drei';
import * as THREE from 'three';

interface TerrainRadarMappingProps {
  resolution?: number;
  size?: number;
  scanSpeed?: number;
  heightScale?: number;
  terrainType?: 'mountains' | 'canyon' | 'coastal' | 'urban';
  showWireframe?: boolean;
}

export const TerrainRadarMapping: React.FC<TerrainRadarMappingProps> = ({
  resolution = 64,
  size = 10,
  scanSpeed = 0.5,
  heightScale = 1.5,
  terrainType = 'mountains',
  showWireframe = true,
}) => {
  const terrainRef = useRef<THREE.Mesh>(null);
  const scanBarRef = useRef<THREE.Mesh>(null);
  const dataPointsRef = useRef<THREE.Points>(null);
  
  const [scanProgress, setScanProgress] = useState(0);
  
  // Generate height data based on terrain type
  const { heightData, positions, colors } = useMemo(() => {
    const res = resolution;
    const heightData = new Float32Array(res * res);
    
    // Generate different noise patterns based on the terrain type
    let noiseScale = 0.1;
    let noiseHeight = 1.0;
    let noiseBaseline = 0;
    
    switch (terrainType) {
      case 'mountains':
        noiseScale = 0.15;
        noiseHeight = 1.0;
        noiseBaseline = 0;
        break;
      case 'canyon':
        noiseScale = 0.08;
        noiseHeight = 1.2;
        noiseBaseline = -0.5;
        break;
      case 'coastal':
        noiseScale = 0.12;
        noiseHeight = 0.6;
        noiseBaseline = -0.3;
        break;
      case 'urban':
        noiseScale = 0.3;
        noiseHeight = 0.5;
        noiseBaseline = 0;
        break;
    }
    
    // Simple noise function for height generation
    const noise = (nx: number, ny: number) => {
      // Simple implementation of Perlin-like noise
      const sin0 = Math.sin(nx * 1.0) * 0.5 + 0.5;
      const sin1 = Math.sin(ny * 1.0) * 0.5 + 0.5;
      const sin2 = Math.sin((nx + ny) * 2.0) * 0.5 + 0.5;
      const sin3 = Math.sin(Math.sqrt(nx * nx + ny * ny) * 5.0) * 0.5 + 0.5;
      
      let n = sin0 * 0.25 + sin1 * 0.25 + sin2 * 0.25 + sin3 * 0.25;
      
      // Add some variations based on terrain type
      if (terrainType === 'mountains') {
        // Add sharper peaks
        n = Math.pow(n, 0.8);
      } else if (terrainType === 'canyon') {
        // Create deeper valleys
        n = n < 0.4 ? n * 0.5 : n;
      } else if (terrainType === 'coastal') {
        // Create flatter areas at the bottom
        n = n < 0.3 ? 0.3 : n;
      } else if (terrainType === 'urban') {
        // Create plateaus and sudden height changes
        n = Math.floor(n * 5) / 5;
      }
      
      return n;
    };
    
    // Generate the height data
    for (let i = 0; i < res; i++) {
      for (let j = 0; j < res; j++) {
        const nx = i / res - 0.5;
        const ny = j / res - 0.5;
        
        const n1 = noise(nx * 5, ny * 5);
        const n2 = noise(nx * 10, ny * 10) * 0.5;
        const n3 = noise(nx * 20, ny * 20) * 0.25;
        
        let height = (n1 + n2 + n3) * noiseHeight + noiseBaseline;
        
        // Ensure some flat areas for urban environments
        if (terrainType === 'urban' && Math.random() > 0.7) {
          height = Math.floor(height * 3) / 3;
        }
        
        heightData[i * res + j] = height;
      }
    }
    
    // Create data points for radar scan visualization
    const pointCount = res * 4; // Fewer points than full resolution for visual clarity
    const positions = new Float32Array(pointCount * 3);
    const colors = new Float32Array(pointCount * 3);
    
    for (let i = 0; i < pointCount; i++) {
      const x = (Math.random() - 0.5) * size;
      const z = (Math.random() - 0.5) * size;
      
      // Calculate height at this position by sampling the height data
      const gridX = Math.floor((x / size + 0.5) * (res - 1));
      const gridZ = Math.floor((z / size + 0.5) * (res - 1));
      const idx = Math.min(res - 1, Math.max(0, gridX)) * res + Math.min(res - 1, Math.max(0, gridZ));
      const y = heightData[idx] * heightScale;
      
      positions[i * 3] = x;
      positions[i * 3 + 1] = y + 0.05; // Slightly above terrain
      positions[i * 3 + 2] = z;
      
      // Color based on height
      const heightColor = Math.max(0.2, Math.min((y + 1) / 2, 1));
      const hue = terrainType === 'mountains' ? 0.66 : 
                  terrainType === 'canyon' ? 0.05 :
                  terrainType === 'coastal' ? 0.55 : 
                  0.33; // urban = green
                  
      const color = new THREE.Color().setHSL(hue, 0.8, heightColor);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    
    return { heightData, positions, colors };
  }, [resolution, size, terrainType, heightScale]);
  
  // Update animation
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    const scanPos = ((time * scanSpeed) % 2) - 1; // -1 to 1, looping
    setScanProgress((scanPos + 1) / 2); // Convert to 0-1 range
    
    if (scanBarRef.current) {
      scanBarRef.current.position.z = scanPos * (size / 2);
    }
    
    if (dataPointsRef.current) {
      // Only show points that have been "scanned"
      const pointMaterial = dataPointsRef.current.material as THREE.PointsMaterial;
      
      if (pointMaterial.userData.opacityAttribute) {
        const alphas = pointMaterial.userData.opacityAttribute.array;
        const positions = dataPointsRef.current.geometry.attributes.position.array;
        
        for (let i = 0; i < alphas.length; i++) {
          const z = positions[i * 3 + 2];
          const normalized = (z / (size/2) + 1) / 2; // Convert -size/2 to size/2 into 0-1
          
          // Points are visible if they've been scanned
          if (normalized <= scanProgress) {
            alphas[i] = Math.min(1, alphas[i] + 0.01); // Fade in
          } else {
            alphas[i] = Math.max(0, alphas[i] - 0.01); // Fade out
          }
        }
        
        pointMaterial.userData.opacityAttribute.needsUpdate = true;
      }
    }
    
    if (terrainRef.current) {
      const material = terrainRef.current.material as THREE.MeshStandardMaterial;
      if (material.displacementMap) {
        // Update displacement map animation
        material.displacementScale = heightScale * (0.8 + Math.sin(time * 0.2) * 0.1);
      }
    }
  });
  
  // Update terrain based on height data
  useEffect(() => {
    if (terrainRef.current) {
      const geometry = terrainRef.current.geometry as THREE.PlaneGeometry;
      
      // Update vertices based on height data
      const vertices = geometry.attributes.position.array;
      const res = Math.sqrt(heightData.length);
      
      for (let i = 0; i < resolution + 1; i++) {
        for (let j = 0; j < resolution + 1; j++) {
          // Sample height data, with edge handling
          const sampleI = Math.min(res - 1, i);
          const sampleJ = Math.min(res - 1, j);
          const height = heightData[sampleI * res + sampleJ];
          
          const index = (i * (resolution + 1) + j) * 3 + 1; // Y component
          vertices[index] = height * heightScale;
        }
      }
      
      geometry.attributes.position.needsUpdate = true;
      geometry.computeVertexNormals();
    }
  }, [heightData, heightScale, resolution]);
  
  return (
    <group>
      {/* Base terrain */}
      <Plane
        ref={terrainRef}
        args={[size, size, resolution, resolution]}
        rotation={[-Math.PI/2, 0, 0]}
      >
        <meshStandardMaterial
          color={terrainType === 'mountains' ? "#8791B8" : 
                terrainType === 'canyon' ? "#B85D3C" : 
                terrainType === 'coastal' ? "#6096B4" : 
                "#687D69"} // urban
          flatShading={true}
          wireframe={showWireframe}
          side={THREE.DoubleSide}
        />
      </Plane>
      
      {/* Scanning bar visualization */}
      <Box 
        ref={scanBarRef}
        args={[size, 0.1, 0.05]}
        position={[0, 0.5, 0]}
      >
        <meshStandardMaterial
          color="#00FFAA"
          transparent
          opacity={0.8}
          emissive="#00FFAA"
          emissiveIntensity={1}
        />
      </Box>
      
      {/* Radar data points */}
      <points ref={dataPointsRef}>
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
          size={0.15}
          sizeAttenuation
          vertexColors
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          onBeforeCompile={(shader) => {
            // Create an opacity attribute for point fade
            const opacityAttribute = new THREE.BufferAttribute(
              new Float32Array(positions.length / 3).fill(0),
              1
            );
            
            dataPointsRef.current?.geometry.setAttribute('opacity', opacityAttribute);
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
            
            // Store for animation updates
            const material = dataPointsRef.current?.material as THREE.PointsMaterial;
            if (material) {
              material.userData.opacityAttribute = opacityAttribute;
            }
          }}
        />
      </points>
      
      {/* Labels and information */}
      <Text
        position={[0, heightScale + 1.5, 0]}
        color="#ffffff"
        fontSize={0.4}
        anchorX="center"
        anchorY="middle"
      >
        {terrainType.charAt(0).toUpperCase() + terrainType.slice(1)} Terrain
      </Text>
      
      <Text
        position={[0, heightScale + 1, 0]}
        color="#aaaaaa"
        fontSize={0.2}
        anchorX="center"
        anchorY="middle"
      >
        Radar Mapping in Progress: {Math.floor(scanProgress * 100)}%
      </Text>
      
      {/* Scale reference */}
      <Box args={[0.2, heightScale, 0.2]} position={[-size/2 - 0.5, heightScale/2, -size/2]}>
        <meshStandardMaterial color="#ffffff" opacity={0.3} transparent />
      </Box>
      <Text
        position={[-size/2 - 0.5, heightScale + 0.3, -size/2]}
        color="#ffffff"
        fontSize={0.2}
        anchorX="center"
      >
        {heightScale}m
      </Text>
    </group>
  );
};

export default TerrainRadarMapping;