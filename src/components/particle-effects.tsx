import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ParticleEffectsProps {
  count?: number;
  color?: string;
  size?: number;
  speed?: number;
}

const ParticleEffects: React.FC<ParticleEffectsProps> = ({
  count = 1000,
  color = '#ffffff',
  size = 0.1,
  speed = 0.5
}) => {
  const points = useRef<THREE.Points>(null);
  
  const particlesPosition = useMemo(() => {
    const positions = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10;      // x
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;  // y
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;  // z
    }
    
    return positions;
  }, [count]);

  useFrame(({ clock }) => {
    if (!points.current) return;
    
    const elapsedTime = clock.getElapsedTime();
    const positions = points.current.geometry.attributes.position.array as Float32Array;
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Apply some movement based on position
      positions[i3] += Math.sin(elapsedTime + i3) * speed * 0.01;
      positions[i3 + 1] += Math.cos(elapsedTime + i3) * speed * 0.01;
      positions[i3 + 2] += Math.sin(elapsedTime + i3) * speed * 0.01;
    }
    
    points.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particlesPosition}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={size}
        color={color}
        sizeAttenuation
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

export default ParticleEffects;