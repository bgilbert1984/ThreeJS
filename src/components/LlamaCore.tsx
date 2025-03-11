// src/components/LlamaCore.tsx
import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

type GLTFResult = {
    nodes: {
        Llama_body: THREE.Mesh;
        Llama_teeth: THREE.Mesh;
        Llama_eyes: THREE.Mesh;
    };
    materials: {
        lambert2SG: THREE.MeshStandardMaterial;
    };
    scene: THREE.Scene;
};

export const LlamaCore: React.FC = () => {
    const group = useRef<THREE.Group>(null!); // Use non-null assertion
    const [modelError, setModelError] = useState(false);
    
    // Try to load the model, but use error handling to provide a fallback
    let nodes: any = {};
    let materials: any = {};
    
    try {
        // Attempt to load the model, with error handling
        const gltf = useGLTF('/Llama.glb') as unknown as GLTFResult;
        nodes = gltf.nodes;
        materials = gltf.materials;
    } catch (error) {
        // If model fails to load, we'll use the fallback primitive shapes
        if (!modelError) setModelError(true);
    }

    const [health, setHealth] = React.useState(1); // Full health initially

    // Health decreasing over time
    useEffect(() => {
        const intervalId = setInterval(() => {
            setHealth((prevHealth) => Math.max(0, prevHealth - 0.01)); // Decrease health
        }, 100); // Every 100ms

        return () => clearInterval(intervalId); // Cleanup on unmount
    }, []);

    useFrame(() => {
        if (group.current) {
            // Rotate the whole model group
            group.current.rotation.y += 0.01;
            const adjustedHealth = Math.max(0, health);

            const targetColor = new THREE.Color();
            targetColor.lerpColors(new THREE.Color(1, 0, 0), new THREE.Color(0, 1, 0), adjustedHealth);
            
            // If we have the real model material, update it
            if (!modelError && materials.lambert2SG) {
                // Update Llama's color based on health. Lerp between red and green.
                materials.lambert2SG.color.copy(targetColor);  // Use the material from useGLTF
                materials.lambert2SG.opacity = adjustedHealth;
                materials.lambert2SG.transparent = true;
            }
        }
    });

    // Create particle system
    const particles = useRef<THREE.Points>(null!); // Use non-null assertion

    useEffect(() => {
        const geometry = new THREE.BufferGeometry();
        const vertices = [];
        const numParticles = 5000;
        for (let i = 0; i < numParticles; i++) {
            const x = THREE.MathUtils.randFloatSpread(5); // Spread within the llama
            const y = THREE.MathUtils.randFloatSpread(5);
            const z = THREE.MathUtils.randFloatSpread(5);
            vertices.push(x, y, z);
        }
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        const material = new THREE.PointsMaterial({ color: 0xff0000, size: 0.02, sizeAttenuation: true });

        const points = new THREE.Points(geometry, material);

        if (group.current) {
            group.current.add(points);
        }
        particles.current = points;

    }, []);

    useFrame((_, delta) => {
        if (particles.current) {
            particles.current.rotation.y += delta * 0.1;
        }
    });


    return (
        <group ref={group} dispose={null}>
            {!modelError ? (
                // Render the actual GLTF model if available
                <>
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.Llama_body?.geometry}
                        material={materials.lambert2SG}
                    />
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.Llama_teeth?.geometry}
                        material={materials.lambert2SG}
                    />
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.Llama_eyes?.geometry}
                        material={materials.lambert2SG}
                        position={[0.35, 1.68, 0.38]}
                        scale={0.4}
                    />
                </>
            ) : (
                // Fallback geometry if model doesn't load
                <>
                    <mesh castShadow receiveShadow position={[0, 0, 0]}>
                        <boxGeometry args={[1, 1.5, 0.75]} />
                        <meshStandardMaterial color={health > 0.5 ? "green" : "red"} transparent opacity={health} />
                    </mesh>
                    {/* Simple head */}
                    <mesh castShadow receiveShadow position={[0, 1.3, 0.25]}>
                        <boxGeometry args={[0.7, 0.7, 0.7]} />
                        <meshStandardMaterial color={health > 0.5 ? "green" : "red"} transparent opacity={health} />
                    </mesh>
                    {/* Simple ears */}
                    <mesh castShadow receiveShadow position={[0.4, 1.6, 0.25]}>
                        <boxGeometry args={[0.2, 0.4, 0.1]} />
                        <meshStandardMaterial color={health > 0.5 ? "green" : "red"} transparent opacity={health} />
                    </mesh>
                    <mesh castShadow receiveShadow position={[-0.4, 1.6, 0.25]}>
                        <boxGeometry args={[0.2, 0.4, 0.1]} />
                        <meshStandardMaterial color={health > 0.5 ? "green" : "red"} transparent opacity={health} />
                    </mesh>
                </>
            )}
        </group>
    );
};

// This reduces requests when the model is already in cache
useGLTF.preload('/Llama.glb');