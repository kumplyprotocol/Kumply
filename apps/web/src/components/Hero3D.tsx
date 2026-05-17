"use client";

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sphere, MeshDistortMaterial, Environment } from '@react-three/drei';

function Core() {
  const meshRef = useRef<any>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={1}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1.5, 0]} />
        <meshPhysicalMaterial
          color="#E84142" // Avalanche Red
          emissive="#E84142"
          emissiveIntensity={0.5}
          wireframe
          transparent
          opacity={0.6}
        />
      </mesh>

      {/* Inner chrome-red sphere */}
      <Sphere args={[1.1, 64, 64]}>
        <MeshDistortMaterial
          color="#5a2025"
          emissive="#E84142"
          emissiveIntensity={0.15}
          envMapIntensity={2.5}
          clearcoat={1}
          clearcoatRoughness={0.05}
          metalness={0.95}
          roughness={0.08}
          distort={0.35}
          speed={2}
        />
      </Sphere>
    </Float>
  );
}

// Data rings representing encryption/compliance checks
function Rings() {
  const groupRef = useRef<any>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.2) * 0.5;
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.5;
    }
  });

  return (
    <group ref={groupRef}>
      {[0, 1, 2].map((i) => (
        <mesh key={i} rotation={[Math.PI / 2 + (i * Math.PI) / 6, 0, 0]}>
          <torusGeometry args={[2.2 + i * 0.4, 0.015, 16, 100]} />
          <meshBasicMaterial color="#E84142" transparent opacity={0.4 - i * 0.1} />
        </mesh>
      ))}
    </group>
  );
}

export default function Hero3D() {
  return (
    <div style={{ width: '100%', height: '550px', position: 'relative', margin: '-2rem auto 0 auto', pointerEvents: 'none' }}>
      <Canvas
        camera={{ position: [0, 0, 8.5], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      >
        {/* Lighting for chrome reflections */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={2} color="#ffffff" />
        <directionalLight position={[-5, -3, -8]} intensity={0.8} color="#ff9999" />
        <pointLight position={[-10, -10, -10]} intensity={1.2} color="#E84142" />
        <pointLight position={[5, 5, 10]} intensity={0.6} color="#ffffff" />

        {/* Environment map for chrome reflections — loaded locally */}
        <Environment files="/dikhololo_night_1k.hdr" />

        <group position={[0, 0.5, 0]}>
          <Core />
          <Rings />
        </group>

      </Canvas>
    </div>
  );
}

