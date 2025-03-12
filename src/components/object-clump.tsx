import * as THREE from "three"
import { useState, useEffect } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Outlines, Environment, useTexture } from "@react-three/drei"
import { Physics, useSphere } from "@react-three/cannon"
import { EffectComposer, N8AO, SMAA, Bloom } from "@react-three/postprocessing"
import { useControls } from "leva"

const rfs = THREE.MathUtils.randFloatSpread
const sphereGeometry = new THREE.SphereGeometry(1, 32, 32)
const baubleMaterial = new THREE.MeshStandardMaterial({ color: "white", roughness: 0, envMapIntensity: 1 })

// Create an inner component that contains the scene content - no Canvas wrapper
export const ObjectClumpScene: React.FC = () => {
  return (
    <>
      <ambientLight intensity={0.5} />
      <color attach="background" args={["#dfdfdf"]} />
      <spotLight intensity={1} angle={0.2} penumbra={1} position={[30, 30, 30]} castShadow shadow-mapSize={[512, 512]} />
      <Physics gravity={[0, 2, 0]} iterations={10}>
        <Pointer />
        <Clump />
      </Physics>
      {/* Disable environment for now to avoid HDR error */}
      {/* <Environment files="/assets/adamsbridge.hdr" /> */}
      <EffectComposer disableNormalPass multisampling={0}>
        <N8AO halfRes color="black" aoRadius={2} intensity={1} aoSamples={6} denoiseSamples={4} />
        <Bloom mipmapBlur levels={7} intensity={1} />
        <SMAA />
      </EffectComposer>
    </>
  )
}

// Standalone component with Canvas for direct usage
export const ObjectClumpApp: React.FC = () => (
  <Canvas shadows gl={{ antialias: false }} dpr={[1, 1.5]} camera={{ position: [0, 0, 20], fov: 35, near: 1, far: 40 }}>
    <ObjectClumpScene />
  </Canvas>
)

// Also export as App for compatibility with existing imports
export const App = ObjectClumpApp;

interface ClumpProps {
  [key: string]: any;
}

function Clump({ mat = new THREE.Matrix4(), vec = new THREE.Vector3(), ...props }: ClumpProps) {
  const { outlines } = useControls({ outlines: { value: 0.0, step: 0.01, min: 0, max: 0.05 } })
  const [textureError, setTextureError] = useState(false);
  const [defaultMaterial, setDefaultMaterial] = useState<THREE.Material | null>(null);
  
  // Try to load texture but have a fallback
  let texture;
  try {
    texture = useTexture("/assets/cross.jpg", (error) => {
      console.log("Error loading texture:", error);
      setTextureError(true);
    });
  } catch (error) {
    console.log("Caught texture loading error:", error);
    setTextureError(true);
  }

  // Create a fallback material
  useEffect(() => {
    if (textureError) {
      const material = new THREE.MeshStandardMaterial({ 
        color: "#4a90e2", 
        roughness: 0.5, 
        metalness: 0.5,
        wireframe: false 
      });
      setDefaultMaterial(material);
    }
  }, [textureError]);
  
  const [ref, api] = useSphere(() => ({ args: [1], mass: 1, angularDamping: 0.1, linearDamping: 0.65, position: [rfs(20), rfs(20), rfs(20)] }))
  
  useFrame(() => {
    if (!ref.current) return;
    
    for (let i = 0; i < 40; i++) {
      // Get current whereabouts of the instanced sphere
      // Cast to InstancedMesh to access getMatrixAt method
      (ref.current as THREE.InstancedMesh).getMatrixAt(i, mat)
      // Normalize the position and multiply by a negative force.
      // This is enough to drive it towards the center-point.
      api.at(i).applyForce(vec.setFromMatrixPosition(mat).normalize().multiplyScalar(-40).toArray(), [0, 0, 0])
    }
  })
  
  return (
    <instancedMesh ref={ref} castShadow receiveShadow args={[sphereGeometry, baubleMaterial, 40]} material={textureError ? defaultMaterial : undefined} material-map={!textureError ? texture : undefined}>
      <Outlines thickness={outlines} />
    </instancedMesh>
  )
}

function Pointer() {
  const viewport = useThree((state) => state.viewport)
  const [ref, api] = useSphere(() => ({ type: "Kinematic", args: [3], position: [0, 0, 0] }))
  useFrame((state) => api.position.set((state.mouse.x * viewport.width) / 2, (state.mouse.y * viewport.height) / 2, 0))
  return (
    <mesh ref={ref} scale={0.2}>
      <sphereGeometry />
      <meshBasicMaterial color={[4, 4, 4]} toneMapped={false} />
      <pointLight intensity={8} distance={10} />
    </mesh>
  )
}