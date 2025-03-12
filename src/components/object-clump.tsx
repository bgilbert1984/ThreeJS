// src/components/object-clump.tsx
import * as THREE from "three";
import { useState } from "react";
import { useFrame, useThree, Canvas } from "@react-three/fiber";
import { Outlines, useTexture } from "@react-three/drei";
import { Physics, useSphere } from "@react-three/cannon";
import { useControls } from "leva";

const rfs = THREE.MathUtils.randFloatSpread;
const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
const baubleMaterial = new THREE.MeshStandardMaterial({ 
  color: "white", 
  roughness: 0, 
  envMapIntensity: 1 
});

// Scene component without Canvas wrapper
export const ObjectClumpScene: React.FC = () => {
  return (
    <>
      <ambientLight intensity={0.5} />
      <color attach="background" args={["#dfdfdf"]} />
      <spotLight 
        intensity={1} 
        angle={0.2} 
        penumbra={1} 
        position={[30, 30, 30]} 
        castShadow 
        shadow-mapSize={[512, 512]} 
      />
      <Physics gravity={[0, 2, 0]} iterations={10}>
        <Pointer />
        <Clump />
      </Physics>
    </>
  );
};

// Wrapped component with Canvas for standalone usage
export const App: React.FC = () => {
  return (
    <Canvas>
      <ObjectClumpScene />
    </Canvas>
  );
}

interface ClumpProps {
  mat?: THREE.Matrix4;
  vec?: THREE.Vector3;
}

function Clump({ mat = new THREE.Matrix4(), vec = new THREE.Vector3() }: ClumpProps) {
  const { outlines } = useControls({ 
    outlines: { value: 0.01, step: 0.01, min: 0, max: 0.05 } 
  });
  
  // Handle texture loading safely
  const [textureLoaded, setTextureLoaded] = useState(false);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  
  // Try to load texture
  try {
    // Custom hook to safely load texture
    const loadedTexture = useTexture("/assets/cross.jpg");
    if (loadedTexture) {
      setTextureLoaded(true);
      setTexture(loadedTexture);
    }
  } catch (error: unknown) {
    console.log("Texture loading error handled gracefully:", error);
    // Continue without texture
  }
  
  const [ref, api] = useSphere(() => ({ 
    args: [1], 
    mass: 1, 
    angularDamping: 0.1, 
    linearDamping: 0.65, 
    position: [rfs(20), rfs(20), rfs(20)] 
  }));
  
  useFrame(() => {
    if (!ref.current) return;
    
    for (let i = 0; i < 40; i++) {
      // Get current whereabouts of the instanced sphere
      // Cast to InstancedMesh to access getMatrixAt method
      (ref.current as THREE.InstancedMesh).getMatrixAt(i, mat);
      // Normalize the position and multiply by a negative force.
      // This is enough to drive it towards the center-point.
      api.at(i).applyForce(
        vec.setFromMatrixPosition(mat).normalize().multiplyScalar(-40).toArray(), 
        [0, 0, 0]
      );
    }
  });
  
  return (
    <instancedMesh 
      ref={ref} 
      castShadow 
      receiveShadow 
      args={[sphereGeometry, baubleMaterial, 40]} 
      // Only apply texture if loaded successfully
      {...(textureLoaded && texture ? { 'material-map': texture } : {})}
    >
      <Outlines thickness={outlines} />
    </instancedMesh>
  );
}

function Pointer() {
  const viewport = useThree((state) => state.viewport);
  const [ref, api] = useSphere(() => ({ 
    type: "Kinematic", 
    args: [3], 
    position: [0, 0, 0] 
  }));
  
  useFrame((state) => 
    api.position.set(
      (state.mouse.x * viewport.width) / 2, 
      (state.mouse.y * viewport.height) / 2, 
      0
    )
  );
  
  return (
    <mesh ref={ref} scale={0.2}>
      <sphereGeometry />
      <meshBasicMaterial color={[4, 4, 4]} toneMapped={false} />
      <pointLight intensity={8} distance={10} />
    </mesh>
  );
}