"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import {
  Component,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { Group, Mesh, SRGBColorSpace, Vector2 } from "three";

export type EarthMotion = { progress: number };

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
    float rim = 1.0 - abs(normalize(vNormal).z);
    float halo = smoothstep(0.15, 0.65, rim) * (1.0 - smoothstep(0.75, 1.0, rim));
    gl_FragColor = vec4(0.47, 0.76, 0.87, halo * 0.32);
  }
`;

// Two translucent shells give the reference's wispy rim real spherical depth.
// Density fades over the front face so India and its coastline remain visible.
const cloudVertex = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec3 vLocal;
  void main() {
    vLocal = position;
    vNormal = normalize(normalMatrix * normal);
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    vPosition = viewPosition.xyz;
    gl_Position = projectionMatrix * viewPosition;
  }
`;
const cloudFragment = `
  uniform float time;
  uniform float strength;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec3 vLocal;
  float hash(vec3 p) { return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
  float noise(vec3 p) {
    vec3 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(hash(i), hash(i+vec3(1,0,0)), f.x),
                   mix(hash(i+vec3(0,1,0)), hash(i+vec3(1,1,0)), f.x), f.y),
               mix(mix(hash(i+vec3(0,0,1)), hash(i+vec3(1,0,1)), f.x),
                   mix(hash(i+vec3(0,1,1)), hash(i+vec3(1,1,1)), f.x), f.y), f.z);
  }
  float fbm(vec3 p) {
    float value = 0.0, amplitude = 0.5;
    for (int i = 0; i < 5; i++) {
      value += amplitude * noise(p);
      p = p * 2.03 + vec3(4.1, 1.7, 9.2);
      amplitude *= 0.5;
    }
    return value;
  }
  void main() {
    vec3 n = normalize(vNormal);
    float rim = 1.0 - abs(n.z);
    float upper = smoothstep(-0.1, 0.5, n.y);
    float band = smoothstep(0.27, 0.67, rim) * (1.0 - smoothstep(0.86, 1.0, rim));
    float billows = fbm(vLocal * 23.0 + vec3(time * 0.018, 0.0, time * 0.009));
    float wisps = smoothstep(0.27, 0.65, billows);
    float alpha = upper * band * wisps * strength;
    vec3 color = mix(vec3(0.77, 0.81, 0.82), vec3(1.0, 0.99, 0.96), billows);
    gl_FragColor = vec4(color, alpha);
  }
`;

function RimClouds({
  scale,
  strength,
  time,
}: {
  scale: number;
  strength: number;
  time: RefObject<number>;
}) {
  const uniforms = useMemo(
    () => ({ time: { value: 0 }, strength: { value: strength } }),
    [strength],
  );
  useFrame(() => {
    uniforms.time.value = time.current;
  });
  return (
    <mesh scale={scale}>
      <sphereGeometry args={[1, 96, 64]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={cloudVertex}
        fragmentShader={cloudFragment}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}

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

function RealisticEarth({
  animate,
  onReady,
  motion,
}: {
  animate: boolean;
  onReady: () => void;
  motion: RefObject<EarthMotion>;
}) {
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
    // Share the very same progress as GSAP's descent/zoom. Scrolling backwards
    // reverses rotation exactly, and the opening always starts facing India.
    if (globe.current)
      globe.current.rotation.y = INITIAL_ROTATION + Math.min(motion.current.progress, 1.5) * 0.95;
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
          <mesh ref={cloudLayer} scale={1.012}>
            <sphereGeometry args={[1, 96, 64]} />
            <meshPhongMaterial map={clouds} transparent opacity={0.42} depthWrite={false} />
          </mesh>
        </group>
        <RimClouds scale={1.035} strength={0.95} time={elapsed} />
        <RimClouds scale={1.065} strength={0.65} time={elapsed} />
        <mesh scale={1.12}>
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
export default function EarthScene({
  className = "",
  motion,
}: {
  className?: string;
  motion: RefObject<EarthMotion>;
}) {
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
              <RealisticEarth animate={!reduced && visible} onReady={onReady} motion={motion} />
            </Suspense>
          </Canvas>
        </WebGLBoundary>
      )}
    </div>
  );
}
