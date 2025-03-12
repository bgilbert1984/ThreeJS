import { OrbitControls } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import * as THREE from 'three';

interface OptimizedOrbitControlsProps {
  enableDamping?: boolean;
  enableZoom?: boolean;
  enablePan?: boolean;
  dampingFactor?: number;
  rotateSpeed?: number;
  minDistance?: number;
  maxDistance?: number;
}

export const OptimizedOrbitControls: React.FC<OptimizedOrbitControlsProps> = ({
  enableDamping = true,
  enableZoom = true,
  enablePan = true,
  dampingFactor = 0.05,
  rotateSpeed = 0.5,
  minDistance = 2,
  maxDistance = 20,
}) => {
  const { gl } = useThree();

  useEffect(() => {
    // Get all wheel event listeners and make them passive
    const canvas = gl.domElement;
    const originalAddEventListener = canvas.addEventListener;
    canvas.addEventListener = function(
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | AddEventListenerOptions
    ) {
      if (type === 'wheel') {
        if (typeof options === 'boolean') {
          options = { passive: true };
        } else if (typeof options === 'object') {
          options = { ...options, passive: true };
        }
      }
      return originalAddEventListener.call(this, type, listener, options);
    };

    // Set up initial passive wheel listener
    canvas.addEventListener('wheel', () => {}, { passive: true });

    return () => {
      // Cleanup: Restore original addEventListener
      canvas.addEventListener = originalAddEventListener;
      canvas.removeEventListener('wheel', () => {});
    };
  }, [gl]);

  return (
    <OrbitControls
      enableDamping={enableDamping}
      enableZoom={enableZoom}
      enablePan={enablePan}
      dampingFactor={dampingFactor}
      rotateSpeed={rotateSpeed}
      minDistance={minDistance}
      maxDistance={maxDistance}
      mouseButtons={{
        LEFT: THREE.MOUSE.ROTATE,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.PAN
      }}
      touches={{
        ONE: THREE.TOUCH.ROTATE,
        TWO: THREE.TOUCH.DOLLY_PAN
      }}
    />
  );
};