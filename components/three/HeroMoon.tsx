"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

function createCrescentShape() {
  const shape = new THREE.Shape();

  const outerRadius = 1.6;
  const innerRadius = 1.35;

  const startAngle = Math.PI * 0.35;
  const endAngle = Math.PI * 1.65;

  const steps = 80;

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const angle = startAngle + (endAngle - startAngle) * t;

    const x = Math.cos(angle) * outerRadius;
    const y = Math.sin(angle) * outerRadius;

    if (i === 0) {
      shape.moveTo(x, y);
    } else {
      shape.lineTo(x, y);
    }
  }

  const innerCenterX = 0.62;

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;

    const angle =
      Math.PI * 1.65 +
      (Math.PI * 0.35 - Math.PI * 1.65) * t;

    const x =
      innerCenterX +
      Math.cos(angle) * innerRadius;

    const y = Math.sin(angle) * innerRadius;

    shape.lineTo(x, y);
  }

  shape.closePath();

  return shape;
}

function Crescent() {
  const group = useRef<THREE.Group>(null);

  const geometry = new THREE.ExtrudeGeometry(
    createCrescentShape(),
    {
      depth: 0.3,
      bevelEnabled: true,
      bevelSegments: 4,
      bevelSize: 0.055,
      bevelThickness: 0.055,
      curveSegments: 16,
    }
  );

  geometry.center();

  useFrame((state, delta) => {
    if (!group.current) return;

    // Slow elegant rotation
    group.current.rotation.y += delta * 0.3;

    // Gentle floating movement
    group.current.position.y =
      Math.sin(state.clock.elapsedTime * 0.8) * 0.08;
  });

  return (
    <group ref={group}>
      <mesh geometry={geometry}>
        <meshStandardMaterial
          color="#D4AF37"
          metalness={0.9}
          roughness={0.2}
          emissive="#6B5412"
          emissiveIntensity={0.18}
        />
      </mesh>
    </group>
  );
}

function PrayerOrbits() {
  const group = useRef<THREE.Group>(null);

  const prayers = [
    [0, 2.0, 0],
    [1.65, 0.75, 0],
    [1.25, -1.45, 0],
    [-1.25, -1.45, 0],
    [-1.65, 0.75, 0],
  ];

  useFrame((_, delta) => {
    if (!group.current) return;

    group.current.rotation.z += delta * 0.12;
  });

  return (
    <group ref={group}>
      {prayers.map((position, index) => (
        <mesh
          key={index}
          position={
            position as [number, number, number]
          }
        >
          <sphereGeometry args={[0.065, 20, 20]} />

          <meshStandardMaterial
  color="#F4D35E"
  metalness={0.65}
  roughness={0.18}
  emissive="#D4AF37"
  emissiveIntensity={0.35}
/>
        </mesh>
      ))}
    </group>
  );
}

function Stars() {
  const stars = [
    [-2.3, 1.5, 0],
    [2.2, 1.6, 0],
    [2.4, -0.8, 0],
    [-2.3, -1.0, 0],
    [0, 2.5, 0],
    [0, -2.5, 0],
  ];

  return (
    <>
      {stars.map((position, index) => (
        <mesh
          key={index}
          position={
            position as [number, number, number]
          }
        >
          <sphereGeometry args={[0.035, 12, 12]} />

          <meshStandardMaterial
  color="#F4D35E"
  metalness={0.65}
  roughness={0.18}
  emissive="#D4AF37"
  emissiveIntensity={0.35}
/>
        </mesh>
      ))}
    </>
  );
}

function Scene() {
  return (
    <>
      <Crescent />
      <PrayerOrbits />
      <Stars />
    </>
  );
}

export default function HeroMoon() {
  return (
    <div
      className="
        pointer-events-none
        absolute
        right-4
        top-24
        z-0
        h-[350px]
        w-[350px]
        md:right-12
        md:h-[430px]
        md:w-[430px]
      "
    >
      <Canvas
        camera={{
          position: [0, 0, 7],
          fov: 45,
        }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={1.2} />

        <directionalLight
          position={[4, 5, 6]}
          intensity={3}
        />

        <pointLight
  position={[3, 2, 4]}
  intensity={10}
  color="#FFE9A6"
/>

        <pointLight
  position={[3, 2, 4]}
  intensity={10}
  color="#FFE9A6"
/>

        <Scene />
      </Canvas>
    </div>
  );
}