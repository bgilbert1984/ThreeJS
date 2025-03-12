import * as THREE from 'three'
import { useRef, useMemo } from 'react'
import { extend, useFrame } from '@react-three/fiber'
import { Effects } from '@react-three/drei'
import { FilmPass, UnrealBloomPass } from 'three-stdlib'

// Extend Three.js with postprocessing effects
extend({ UnrealBloomPass, FilmPass })

declare global {
  namespace JSX {
    interface IntrinsicElements {
      unrealBloomPass: any;
      filmPass: any;
    }
  }
}

// Export the standalone component without Canvas wrapper for use inside other Canvas components
export const ParticleEffects = () => (
  <>
    <ambientLight intensity={0.01} />
    <pointLight distance={60} intensity={4} color="lightblue" />
    <spotLight intensity={1.5} position={[0, 0, 2000]} penumbra={1} color="red" />
    <mesh>
      <planeGeometry args={[1000, 1000]} />
      <meshStandardMaterial color="#00ffff" roughness={0.5} depthTest={false} />
    </mesh>
    <Swarm count={20000} />
    <Postpro />
  </>
)

// For backward compatibility and standalone usage
export const App = ParticleEffects;

interface ParticleData {
  t: number;
  factor: number;
  speed: number;
  xFactor: number;
  yFactor: number;
  zFactor: number;
  mx: number;
  my: number;
}

interface SwarmProps {
  count: number;
  dummy?: THREE.Object3D;
}

function Swarm({ count, dummy = new THREE.Object3D() }: SwarmProps) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const light = useRef<THREE.PointLight>(null);

  const particles = useMemo(() => {
    const temp: ParticleData[] = [];
    for (let i = 0; i < count; i++) {
      const t = Math.random() * 100;
      const factor = 20 + Math.random() * 100;
      const speed = 0.01 + Math.random() / 200;
      const xFactor = -50 + Math.random() * 100;
      const yFactor = -50 + Math.random() * 100;
      const zFactor = -50 + Math.random() * 100;
      temp.push({ t, factor, speed, xFactor, yFactor, zFactor, mx: 0, my: 0 });
    }
    return temp;
  }, [count]);

  useFrame((state) => {
    const meshCurrent = mesh.current;
    const lightCurrent = light.current;
    if (!lightCurrent || !meshCurrent) return;

    lightCurrent.position.set(
      (-state.mouse.x * state.viewport.width) / 5,
      (-state.mouse.y * state.viewport.height) / 5,
      0
    );

    particles.forEach((particle, i) => {
      let { t, factor, speed, xFactor, yFactor, zFactor } = particle;
      t = particle.t += speed / 2;
      const a = Math.cos(t) + Math.sin(t * 1) / 10;
      const b = Math.sin(t) + Math.cos(t * 2) / 10;
      const s = Math.cos(t);
      particle.mx += (state.mouse.x * 1000 - particle.mx) * 0.01;
      particle.my += (state.mouse.y * 1000 - 1 - particle.my) * 0.01;
      dummy.position.set(
        (particle.mx / 10) * a + xFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 1) * factor) / 10,
        (particle.my / 10) * b + yFactor + Math.sin((t / 10) * factor) + (Math.cos(t * 2) * factor) / 10,
        (particle.my / 10) * b + zFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 3) * factor) / 10
      );
      dummy.scale.setScalar(s);
      dummy.rotation.set(s * 5, s * 5, s * 5);
      dummy.updateMatrix();
      meshCurrent.setMatrixAt(i, dummy.matrix);
    });
    meshCurrent.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      <pointLight ref={light} distance={40} intensity={8} color="lightblue">
        <mesh scale={[1, 1, 6]}>
          <dodecahedronGeometry args={[4, 0]} />
          <meshBasicMaterial color="lightblue" />
        </mesh>
      </pointLight>
      <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#020000" roughness={0.5} />
      </instancedMesh>
    </>
  );
}

function Postpro() {
  return (
    <Effects disableGamma>
      <unrealBloomPass args={[undefined, 1.25, 1, 0]} />
      <filmPass args={[0.2, 0.5, 1500, false]} />
    </Effects>
  );
}
