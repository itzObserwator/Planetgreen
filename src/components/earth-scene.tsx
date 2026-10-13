"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { Component, Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Group, Mesh, SRGBColorSpace, Vector2 } from "three";

const ARTWORK = "/textures/earth-india-fallback.png";
const MAPS = [
  "/textures/earth-color.jpg",
  "/textures/earth-normal.jpg",
  "/textures/earth-specular.jpg",
  "/textures/earth-clouds.png",
];
const INDIA_LONGITUDE = 78;
// Look slightly south of the equator, so India appears above the opening headline.
const VIEW_LATITUDE = -20;
const INITIAL_ROTATION = (-(90 + INDIA_LONGITUDE) * Math.PI) / 180;

const atmosphereVertex = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    vPosition = viewPosition.xyz;
    gl_Position = projectionMatrix * viewPosition;
  }
`;
const atmosphereFragment = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  void main() {
    float rim = pow(1.0 - abs(dot(normalize(vNormal), normalize(-vPosition))), 3.0);
    gl_FragColor = vec4(0.47, 0.76, 0.87, rim * 0.3);
  }
`;

function ArtworkFallback() {
  return <img className="earth-artwork-fallback" src={ARTWORK} alt="" />;
}

class WebGLBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? <ArtworkFallback /> : this.props.children;
  }
}

function RealisticEarth({ animate, onReady }: { animate: boolean; onReady: () => void }) {
  const [surface, normal, specular, clouds] = useTexture(MAPS);
  const globe = useRef<Group>(null);
  const cloudLayer = useRef<Mesh>(null);
  const firstFrame = useRef(false);
  const elapsed = useRef(0);
  const viewport = useThree((state) => state.viewport);
  const radius = Math.min(viewport.height * 0.42, viewport.width * 0.38);
  useEffect(() => {
    surface.colorSpace = SRGBColorSpace;
    clouds.colorSpace = SRGBColorSpace;
    surface.needsUpdate = clouds.needsUpdate = true;
  }, [surface, clouds]);
  useFrame((_, delta) => {
    if (!firstFrame.current) {
      firstFrame.current = true;
      requestAnimationFrame(onReady);
    }
    if (!animate) return;
    elapsed.current += Math.min(delta, 0.05);
    // A small rotation shows genuine curved terrain without taking India out of view.
    if (globe.current)
      globe.current.rotation.y = INITIAL_ROTATION + Math.sin(elapsed.current * 0.06) * 0.14;
    if (cloudLayer.current) cloudLayer.current.rotation.y = elapsed.current * 0.006;
  });
  return (
    <>
      <ambientLight intensity={1.2} />
      <hemisphereLight args={["#fffdf3", "#839eaf", 1.2]} />
      <directionalLight position={[-3, 4, 5]} intensity={2.1} color="#fff9ec" />
      <directionalLight position={[4, 0, 4]} intensity={0.8} color="#dceeff" />
      <group scale={radius} rotation={[(VIEW_LATITUDE * Math.PI) / 180, 0, 0]}>
        <group ref={globe} rotation={[0, INITIAL_ROTATION, 0]}>
          <mesh>
            <sphereGeometry args={[1, 128, 96]} />
            <meshPhongMaterial
              map={surface}
              normalMap={normal}
              normalScale={new Vector2(0.4, 0.4)}
              specularMap={specular}
              specular="#6c8195"
              shininess={16}
            />
          </mesh>
          <mesh ref={cloudLayer} scale={1.006}>
            <sphereGeometry args={[1, 96, 64]} />
            <meshPhongMaterial map={clouds} transparent opacity={0.2} depthWrite={false} />
          </mesh>
        </group>
        <mesh scale={1.025}>
          <sphereGeometry args={[1, 96, 64]} />
          <shaderMaterial
            vertexShader={atmosphereVertex}
            fragmentShader={atmosphereFragment}
            transparent
            depthWrite={false}
          />
        </mesh>
      </group>
    </>
  );
}

/** A true textured sphere with India kept in the front hemisphere. */
export default function EarthScene({ className = "" }: { className?: string }) {
  const container = useRef<HTMLDivElement>(null);
  const [reduced, setReduced] = useState(true);
  const [visible, setVisible] = useState(true);
  const [ready, setReady] = useState(false);
  const [contextLost, setContextLost] = useState(false);
  const onReady = useMemo(() => () => setReady(true), []);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    if (container.current) observer.observe(container.current);
    return () => {
      media.removeEventListener("change", update);
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={container}
      className={`earth-artwork ${className}`}
      data-ready={ready && !contextLost}
      aria-hidden="true"
    >
      <ArtworkFallback />
      {!contextLost && (
        <WebGLBoundary>
          <Canvas
            orthographic
            resize={{ offsetSize: true }}
            camera={{ position: [0, 0, 2000], zoom: 1, near: 0.1, far: 5000 }}
            dpr={[1, 1.25]}
            frameloop={reduced || !visible ? "demand" : "always"}
            gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
            fallback={<ArtworkFallback />}
            style={{ opacity: ready ? 1 : 0, transition: "opacity 600ms ease" }}
            onCreated={({ gl }) => {
              gl.setClearColor(0x000000, 0);
              gl.domElement.addEventListener("webglcontextlost", () => setContextLost(true), {
                once: true,
              });
            }}
          >
            <Suspense fallback={null}>
              <RealisticEarth animate={!reduced && visible} onReady={onReady} />
            </Suspense>
          </Canvas>
        </WebGLBoundary>
      )}
    </div>
  );
}
