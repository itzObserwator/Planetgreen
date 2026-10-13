"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { Component, Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Color, Group, Mesh, SRGBColorSpace, Vector2 } from "three";

type EarthSceneProps = { className?: string };

const TEXTURES = {
  surface: "/textures/earth-color.jpg",
  clouds: "/textures/earth-clouds.png",
  normal: "/textures/earth-normal.jpg",
  specular: "/textures/earth-specular.jpg",
};

// A small Fresnel shader puts a soft atmospheric rim around the real Earth.
const atmosphereVertex = `
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  void main() {
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vViewPosition = -viewPosition.xyz;
    gl_Position = projectionMatrix * viewPosition;
  }
`;

const atmosphereFragment = `
  uniform vec3 atmosphereColor;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  void main() {
    float rim = 1.0 - max(dot(normalize(vNormal), normalize(vViewPosition)), 0.0);
    float glow = pow(rim, 3.0);
    gl_FragColor = vec4(atmosphereColor, glow * 0.42);
  }
`;

/** A visual replacement for devices without WebGL, also shown while textures load. */
function EarthFallback() {
  return (
    <div
      style={{
        position: "absolute",
        inset: "3.3%",
        borderRadius: "50%",
        overflow: "hidden",
        backgroundImage: `radial-gradient(circle at 34% 17%, transparent 12%, rgba(4, 23, 28, .1) 38%, rgba(4, 23, 28, .86) 87%), url('${TEXTURES.surface}')`,
        backgroundSize: "100% 100%, 210% 100%",
        backgroundPosition: "center, 62% center",
        backgroundColor: "#0d4658",
        boxShadow: "inset 5px 4px 18px rgba(192, 222, 224, .62), 0 0 24px rgba(124, 173, 168, .22)",
      }}
    />
  );
}

class WebGLBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? <EarthFallback /> : this.props.children;
  }
}

function Globe({ animate, onReady }: { animate: boolean; onReady: () => void }) {
  const earth = useRef<Group>(null);
  const clouds = useRef<Mesh>(null);
  const firstFrame = useRef(false);
  const textures = useTexture([
    TEXTURES.surface,
    TEXTURES.clouds,
    TEXTURES.normal,
    TEXTURES.specular,
  ]);
  const [surfaceMap, cloudMap, normalMap, specularMap] = textures;
  const normalScale = useMemo(() => new Vector2(0.4, 0.4), []);
  const atmosphereUniforms = useMemo(
    () => ({ atmosphereColor: { value: new Color("#8cb9b7") } }),
    [],
  );

  useEffect(() => {
    surfaceMap.colorSpace = SRGBColorSpace;
    cloudMap.colorSpace = SRGBColorSpace;
    textures.forEach((texture) => {
      texture.anisotropy = 4;
      texture.needsUpdate = true;
    });
  }, [surfaceMap, cloudMap, textures]);

  useFrame((_, delta) => {
    if (!firstFrame.current) {
      firstFrame.current = true;
      // Wait until the first scene has been painted, including shader compilation.
      // Texture loading alone does not mean a WebGL frame is ready to display.
      requestAnimationFrame(onReady);
    }
    if (!animate) return;
    // Separate cloud drift gives the hero depth without distracting from the copy.
    const step = Math.min(delta, 0.05);
    if (earth.current) earth.current.rotation.y += step * 0.027;
    if (clouds.current) clouds.current.rotation.y += step * 0.012;
  });

  return (
    <>
      <ambientLight intensity={0.42} color="#c9d5cb" />
      <directionalLight position={[-5, 7, 4]} intensity={3.1} color="#fff5df" />
      <directionalLight position={[4, -2, -4]} intensity={0.36} color="#8bbfc5" />
      <group ref={earth} rotation={[0.43, 0.74, -0.2]}>
        <mesh>
          <sphereGeometry args={[2.25, 96, 64]} />
          <meshPhongMaterial
            map={surfaceMap}
            normalMap={normalMap}
            normalScale={normalScale}
            specularMap={specularMap}
            specular="#60746e"
            shininess={13}
            color="#d9e1ce"
          />
        </mesh>
        <mesh ref={clouds} rotation={[0, 0.08, 0]}>
          <sphereGeometry args={[2.268, 80, 56]} />
          <meshPhongMaterial
            map={cloudMap}
            transparent
            opacity={0.75}
            depthWrite={false}
            color="#f4f4e8"
            shininess={0}
          />
        </mesh>
      </group>
      <mesh>
        <sphereGeometry args={[2.285, 80, 56]} />
        <shaderMaterial
          uniforms={atmosphereUniforms}
          vertexShader={atmosphereVertex}
          fragmentShader={atmosphereFragment}
          transparent
          depthWrite={false}
        />
      </mesh>
    </>
  );
}

/** The parent controls position and scroll transforms; this component owns WebGL. */
export default function EarthScene({ className }: EarthSceneProps) {
  const container = useRef<HTMLDivElement>(null);
  const [reducedMotion, setReducedMotion] = useState(true);
  const [visible, setVisible] = useState(true);
  const [ready, setReady] = useState(false);
  const [contextLost, setContextLost] = useState(false);
  const markReady = useMemo(() => () => setReady(true), []);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(preference.matches);
    updatePreference();
    preference.addEventListener("change", updatePreference);

    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      rootMargin: "100px",
    });
    if (container.current) observer.observe(container.current);

    return () => {
      preference.removeEventListener("change", updatePreference);
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={container}
      className={className}
      aria-hidden="true"
      style={{ position: "relative", width: "100%", height: "100%" }}
    >
      <EarthFallback />
      {!contextLost && (
        <WebGLBoundary>
          <Canvas
            camera={{ position: [0, 0, 7], fov: 38, near: 0.1, far: 30 }}
            dpr={[1, 1.5]}
            frameloop={reducedMotion || !visible ? "demand" : "always"}
            gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
            fallback={<EarthFallback />}
            style={{ opacity: ready ? 1 : 0, transition: "opacity 800ms ease" }}
            onCreated={({ gl }) => {
              gl.setClearColor(0x000000, 0);
              gl.domElement.addEventListener("webglcontextlost", () => setContextLost(true), {
                once: true,
              });
            }}
          >
            <Suspense fallback={null}>
              <Globe animate={!reducedMotion && visible} onReady={markReady} />
            </Suspense>
          </Canvas>
        </WebGLBoundary>
      )}
    </div>
  );
}
