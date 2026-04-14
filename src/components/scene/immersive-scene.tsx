"use client";

import { Float, Sparkles } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

import { useJarvisStore } from "@/store/app-store";

type SceneMode = "full" | "reduced" | "fallback";

function detectSceneMode(): SceneMode {
  if (typeof window === "undefined") {
    return "reduced";
  }

  const canvas = document.createElement("canvas");
  const webgl =
    canvas.getContext("webgl2") ??
    canvas.getContext("webgl") ??
    canvas.getContext("experimental-webgl");

  if (!webgl) {
    return "fallback";
  }

  const userAgent = window.navigator.userAgent;
  const isSafari = /Safari/i.test(userAgent) && !/Chrome|Chromium|Android/i.test(userAgent);
  const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
  const lowCoreCount = (window.navigator.hardwareConcurrency ?? 4) <= 4;

  return isSafari || reducedMotion || lowCoreCount ? "reduced" : "full";
}

function ReactorCore({ reducedEffects }: { reducedEffects: boolean }) {
  const coreRef = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Group>(null);
  const ringsRef = useRef<THREE.Group>(null);
  const { systemArmed, focus, hand } = useJarvisStore((state) => ({
    systemArmed: state.systemArmed,
    focus: state.focus,
    hand: state.hand,
  }));

  useFrame((state, delta) => {
    if (!coreRef.current || !haloRef.current || !ringsRef.current) {
      return;
    }

    const elapsed = state.clock.getElapsedTime();
    const material = coreRef.current.material as THREE.MeshPhysicalMaterial;
    const energy = 0.72 + Math.sin(elapsed * 2.4) * 0.12 + (systemArmed ? 0.22 : 0);
    const focusBoost = focus.lockedPanelId ? 0.18 : focus.panelId ? 0.1 : 0;
    material.emissiveIntensity = THREE.MathUtils.lerp(
      material.emissiveIntensity,
      energy + focusBoost,
      0.08,
    );
    const targetScale = 1.02 + energy * 0.08;
    coreRef.current.scale.setScalar(
      THREE.MathUtils.lerp(coreRef.current.scale.x, targetScale, 0.08),
    );

    haloRef.current.rotation.z += delta * 0.08;
    haloRef.current.rotation.x = Math.sin(elapsed * 0.24) * 0.15;
    ringsRef.current.rotation.z += delta * 0.18;
    ringsRef.current.rotation.x += delta * 0.04;
    ringsRef.current.rotation.y += delta * 0.06;

    if (hand) {
      haloRef.current.position.x = THREE.MathUtils.lerp(
        haloRef.current.position.x,
        (hand.screen.x - 0.5) * 0.9,
        0.06,
      );
      haloRef.current.position.y = THREE.MathUtils.lerp(
        haloRef.current.position.y,
        (0.5 - hand.screen.y) * 0.5,
        0.06,
      );
    } else {
      haloRef.current.position.x = THREE.MathUtils.lerp(haloRef.current.position.x, 0, 0.03);
      haloRef.current.position.y = THREE.MathUtils.lerp(haloRef.current.position.y, 0, 0.03);
    }
  });

  return (
    <group>
      <pointLight position={[0, 0, 2]} intensity={12} color="#5fdcff" distance={12} />
      <pointLight position={[2.4, 1.4, 1]} intensity={8} color="#387eff" distance={18} />
      <group ref={haloRef}>
        <Float speed={1.4} rotationIntensity={0.3} floatIntensity={0.2}>
          <mesh ref={coreRef}>
            <icosahedronGeometry args={[0.62, 8]} />
            <meshPhysicalMaterial
              color="#1b9fff"
              emissive="#7ff0ff"
              emissiveIntensity={1.1}
              roughness={0.08}
              metalness={0.2}
              clearcoat={1}
              clearcoatRoughness={0.08}
              transparent
              opacity={0.95}
            />
          </mesh>
        </Float>

        <mesh scale={1.6} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.95, 0.02, 32, 180]} />
          <meshBasicMaterial color="#85f4ff" transparent opacity={0.5} />
        </mesh>

        <mesh scale={2.1} rotation={[Math.PI / 2, 0.4, 0]}>
          <torusGeometry args={[1.1, 0.014, 24, 180]} />
          <meshBasicMaterial color="#4f93ff" transparent opacity={0.44} />
        </mesh>
      </group>

      <group ref={ringsRef}>
        {[-0.4, 0.5, 1.2].map((offset, index) => (
          <mesh
            key={offset}
            position={[0, 0, offset * 0.2]}
            rotation={[Math.PI / 2 + offset * 0.18, offset * 0.2, offset]}
            scale={2.2 + index * 0.42}
          >
            <torusGeometry args={[1.26, 0.01, 18, 120]} />
            <meshBasicMaterial
              color={index % 2 === 0 ? "#6be5ff" : "#3f7cff"}
              transparent
              opacity={0.22 + index * 0.06}
            />
          </mesh>
        ))}
      </group>

      <Sparkles
        count={reducedEffects ? 18 : 40}
        scale={[7, 3.2, 6]}
        size={reducedEffects ? 1.2 : 1.8}
        color="#8ceeff"
        speed={reducedEffects ? 0.08 : 0.14}
      />
    </group>
  );
}

function AmbientGeometry({ reducedEffects }: { reducedEffects: boolean }) {
  const gridRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!gridRef.current) {
      return;
    }

    gridRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.06) * 0.08;
  });

  return (
    <group ref={gridRef}>
      <mesh position={[0, -1.6, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[1.8, 1.8, 1]}>
        <ringGeometry args={[1.8, 4.2, 64, 4]} />
        <meshBasicMaterial color="#69e4ff" transparent opacity={0.08} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, -1.2, -1]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[4.2, 64]} />
        <meshBasicMaterial color="#163450" transparent opacity={0.1} side={THREE.DoubleSide} />
      </mesh>
      <Sparkles
        count={reducedEffects ? 8 : 18}
        scale={[6, 1.2, 4]}
        size={reducedEffects ? 0.8 : 1.2}
        color="#4d88ff"
        speed={reducedEffects ? 0.05 : 0.08}
      />
    </group>
  );
}

function CameraRig() {
  const focus = useJarvisStore((state) => state.focus);

  useFrame((state) => {
    const target = new THREE.Vector3(
      (focus.attentionPoint.x - 0.5) * 1.1,
      (0.5 - focus.attentionPoint.y) * 0.7,
      6.2,
    );
    state.camera.position.lerp(target, 0.035);
    state.camera.lookAt(0, 0, 0);
  });

  return null;
}

export default function ImmersiveScene() {
  const [sceneMode, setSceneMode] = useState<SceneMode>("reduced");
  const reducedEffects = sceneMode !== "full";
  const dpr = useMemo<[number, number]>(
    () => (reducedEffects ? [1, 1.1] : [1, 1.5]),
    [reducedEffects],
  );

  useEffect(() => {
    setSceneMode(detectSceneMode());
  }, []);

  if (sceneMode === "fallback") {
    return (
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(97,225,255,0.22),transparent_0,transparent_18%,rgba(12,21,33,0.2)_32%,transparent_44%),radial-gradient(circle_at_center,rgba(68,124,255,0.14),transparent_34%),linear-gradient(180deg,#071019_0%,#03060a_70%,#010204_100%)]" />
        <div className="absolute left-1/2 top-1/2 h-[18rem] w-[18rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-200/12 bg-cyan-200/6 blur-[2px]" />
        <div className="absolute left-1/2 top-1/2 h-[26rem] w-[26rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-blue-300/10" />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0, 6.2], fov: 38 }}
        gl={{
          antialias: !reducedEffects,
          alpha: true,
          powerPreference: "default",
        }}
        dpr={dpr}
        onCreated={({ gl }) => {
          gl.setPixelRatio(reducedEffects ? 1 : Math.min(window.devicePixelRatio, 1.5));
        }}
      >
        <ambientLight intensity={0.22} color="#9fefff" />
        <fog attach="fog" args={["#02050a", 7, 11]} />
        <color attach="background" args={["#04080f"]} />
        <CameraRig />
        <AmbientGeometry reducedEffects={reducedEffects} />
        <ReactorCore reducedEffects={reducedEffects} />
      </Canvas>
    </div>
  );
}
