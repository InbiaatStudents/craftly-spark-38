import { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

interface ParticleFieldProps {
  primaryColor: string;
  count?: number;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16) / 255,
        g: parseInt(result[2], 16) / 255,
        b: parseInt(result[3], 16) / 255,
      }
    : { r: 0.4, g: 0.4, b: 1 };
}

function ParticleField({ primaryColor, count = 500 }: ParticleFieldProps) {
  const mesh = useRef<THREE.Points>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const { viewport } = useThree();

  const color = useMemo(() => hexToRgb(primaryColor), [primaryColor]);

  // Generate particle positions
  const [positions, velocities] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      pos[i3] = (Math.random() - 0.5) * 10;
      pos[i3 + 1] = (Math.random() - 0.5) * 10;
      pos[i3 + 2] = (Math.random() - 0.5) * 5;
      
      vel[i3] = (Math.random() - 0.5) * 0.01;
      vel[i3 + 1] = (Math.random() - 0.5) * 0.01;
      vel[i3 + 2] = (Math.random() - 0.5) * 0.005;
    }
    
    return [pos, vel];
  }, [count]);

  // Mouse tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useFrame((state) => {
    if (!mesh.current) return;
    
    const time = state.clock.getElapsedTime();
    const geometry = mesh.current.geometry;
    const positionAttr = geometry.attributes.position as THREE.BufferAttribute;
    const posArray = positionAttr.array as Float32Array;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Add subtle wave motion
      posArray[i3] += velocities[i3] + Math.sin(time + i * 0.1) * 0.001;
      posArray[i3 + 1] += velocities[i3 + 1] + Math.cos(time + i * 0.1) * 0.001;
      posArray[i3 + 2] += velocities[i3 + 2];
      
      // Mouse influence
      const dx = mouseRef.current.x * viewport.width * 0.5 - posArray[i3];
      const dy = mouseRef.current.y * viewport.height * 0.5 - posArray[i3 + 1];
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < 2) {
        posArray[i3] += dx * 0.002;
        posArray[i3 + 1] += dy * 0.002;
      }
      
      // Wrap around edges
      if (posArray[i3] > 5) posArray[i3] = -5;
      if (posArray[i3] < -5) posArray[i3] = 5;
      if (posArray[i3 + 1] > 5) posArray[i3 + 1] = -5;
      if (posArray[i3 + 1] < -5) posArray[i3 + 1] = 5;
    }
    
    positionAttr.needsUpdate = true;
    
    // Subtle rotation
    mesh.current.rotation.z = time * 0.02;
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color={new THREE.Color(color.r, color.g, color.b)}
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function GlowingOrb({ primaryColor }: { primaryColor: string }) {
  const mesh = useRef<THREE.Mesh>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const { viewport } = useThree();
  
  const color = useMemo(() => hexToRgb(primaryColor), [primaryColor]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useFrame((state) => {
    if (!mesh.current) return;
    
    const time = state.clock.getElapsedTime();
    
    // Follow mouse with easing
    const targetX = mouseRef.current.x * viewport.width * 0.3;
    const targetY = mouseRef.current.y * viewport.height * 0.3;
    
    mesh.current.position.x += (targetX - mesh.current.position.x) * 0.02;
    mesh.current.position.y += (targetY - mesh.current.position.y) * 0.02;
    
    // Pulsing scale
    const scale = 1 + Math.sin(time * 2) * 0.1;
    mesh.current.scale.setScalar(scale);
  });

  return (
    <mesh ref={mesh} position={[0, 0, -2]}>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshBasicMaterial
        color={new THREE.Color(color.r, color.g, color.b)}
        transparent
        opacity={0.15}
      />
    </mesh>
  );
}

interface WebGLBackgroundProps {
  primaryColor?: string;
  className?: string;
}

export default function WebGLBackground({ 
  primaryColor = "#6366f1",
  className = "",
}: WebGLBackgroundProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`fixed inset-0 -z-10 ${className}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 -z-10 ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.5} />
        <ParticleField primaryColor={primaryColor} count={400} />
        <GlowingOrb primaryColor={primaryColor} />
      </Canvas>
      {/* Gradient overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background/80 pointer-events-none" />
    </div>
  );
}
