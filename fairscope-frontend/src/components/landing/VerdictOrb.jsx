import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";

/**
 * The "Verdict Scale" — FairScope's signature visual element.
 *
 * A literal scale of justice, rendered in 3D and slowly tilting —
 * one pan glowing teal (fair evidence), the other red (flagged
 * evidence) — with particle trails representing individual SHAP feature
 * contributions orbiting the mechanism as it weighs a model's decisions.
 */

function Pan({ side, color, chainAnchor }) {
  return (
    <group>
      <Line
        points={[
          [chainAnchor.x, chainAnchor.y, chainAnchor.z],
          [side * 1.15, -0.85, 0],
        ]}
        color="#5C6478"
        lineWidth={1}
        transparent
        opacity={0.6}
      />
      <Line
        points={[
          [chainAnchor.x, chainAnchor.y, chainAnchor.z + 0.001],
          [side * 1.15 + 0.18, -0.85, 0.18],
        ]}
        color="#5C6478"
        lineWidth={1}
        transparent
        opacity={0.4}
      />
      <Line
        points={[
          [chainAnchor.x, chainAnchor.y, chainAnchor.z - 0.001],
          [side * 1.15 - 0.18, -0.85, -0.18],
        ]}
        color="#5C6478"
        lineWidth={1}
        transparent
        opacity={0.4}
      />

      {/* pan dish */}
      <mesh position={[side * 1.15, -0.87, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.34, 0.14, 32, 1, true]} />
        <meshStandardMaterial
          color={color}
          metalness={0.7}
          roughness={0.25}
          emissive={color}
          emissiveIntensity={0.35}
          side={THREE.DoubleSide}
        />
      </mesh>
      <pointLight position={[side * 1.15, -0.8, 0]} color={color} intensity={0.8} distance={1.5} />
    </group>
  );
}

function ScaleMechanism() {
  const beamRef = useRef();
  const groupRef = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (beamRef.current) {
      beamRef.current.rotation.z = Math.sin(t * 0.5) * 0.06;
    }
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.18;
    }
  });

  const chrome = {
    color: "#8FA5D9",
    metalness: 0.85,
    roughness: 0.2,
  };

  return (
    <group ref={groupRef}>
      {/* base */}
      <mesh position={[0, -1.55, 0]}>
        <cylinderGeometry args={[0.55, 0.65, 0.16, 48]} />
        <meshStandardMaterial {...chrome} />
      </mesh>

      {/* pole */}
      <mesh position={[0, -0.55, 0]}>
        <cylinderGeometry args={[0.045, 0.06, 2.0, 24]} />
        <meshStandardMaterial {...chrome} />
      </mesh>

      {/* fulcrum knob */}
      <mesh position={[0, 0.47, 0]}>
        <sphereGeometry args={[0.09, 24, 24]} />
        <meshStandardMaterial
          color="#4A7FFF"
          metalness={0.9}
          roughness={0.1}
          emissive="#4A7FFF"
          emissiveIntensity={0.4}
        />
      </mesh>

      {/* beam + pans — tilts as a unit around the fulcrum */}
      <group ref={beamRef} position={[0, 0.47, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.035, 0.035, 2.5, 20]} />
          <meshStandardMaterial {...chrome} />
        </mesh>

        <Pan side={-1} color="#2DD4BF" chainAnchor={{ x: -1.15, y: 0, z: 0 }} />
        <Pan side={1} color="#EF4444" chainAnchor={{ x: 1.15, y: 0, z: 0 }} />
      </group>
    </group>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.45} />
      <pointLight position={[4, 5, 4]} intensity={1.1} color="#4A7FFF" />
      <pointLight position={[-4, -2, -4]} intensity={0.5} color="#8B5CF6" />
      <spotLight position={[0, 4, 2]} intensity={0.6} angle={0.5} penumbra={1} color="#F3F5F9" />

      <ScaleMechanism />
    </>
  );
}

export default function VerdictOrb({ className = "" }) {
  return (
    <div className={className} aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0.2, 6.2], fov: 42 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  );
}
