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
import { Group, SRGBColorSpace, Vector2 } from "three";

export type EarthMotion = { progress: number };

const ARTWORK = "/textures/earth-india-fallback.png";
const MAPS = [
  "/textures/earth-color.jpg",
  "/textures/earth-normal.jpg",
  "/textures/earth-specular.jpg",
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
    gl_FragColor = vec4(0.47, 0.76, 0.87, halo * 0.12);
  }
`;

// Reuse the original reference cloud artwork without recoloring it. Cropping
// via texture UVs retains transparent edges and the source's white/gray shading.
const CLOUD_BANK = [
  { file: "04", crop: [754, 268, 541, 154], x: -0.12, y: 1.005, width: 1.05 },
  { file: "10", crop: [833, 223, 305, 149], x: -0.48, y: 0.925, width: 0.59 },
  { file: "01", crop: [1114, 207, 343, 172], x: 0.42, y: 0.945, width: 0.65 },
  { file: "08", crop: [947, 239, 394, 170], x: 0.1, y: 1.025, width: 0.72 },
  { file: "03", crop: [967, 207, 317, 209], x: 0.02, y: 1.07, width: 0.5 },
  { file: "07", crop: [1014, 189, 170, 92], x: -0.04, y: 1.12, width: 0.32 },
];
const skyVertex = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const skyFragment = `
  varying vec2 vUv;
  void main() {
    vec2 p = vUv - vec2(0.5, 0.53);
    float glow = exp(-(p.x*p.x / 0.12 + p.y*p.y / 0.075));
    float edge = smoothstep(0.0, 0.13, vUv.x) * smoothstep(0.0, 0.13, 1.0-vUv.x)
               * smoothstep(0.0, 0.15, vUv.y) * smoothstep(0.0, 0.15, 1.0-vUv.y);
    vec3 blue = mix(vec3(0.73, 0.83, 0.86), vec3(0.53, 0.70, 0.78), glow);
    gl_FragColor = vec4(blue, glow * edge * 0.82);
  }
`;

function CloudBank({ time }: { time: RefObject<number> }) {
  const sources = useTexture(
    CLOUD_BANK.map((cloud) => `/textures/reference/cloud-${cloud.file}.png`),
  );
  const bank = useRef<Group>(null);
  const invalidate = useThree((state) => state.invalidate);
  const textures = useMemo(
    () =>
      sources.map((source, index) => {
        const texture = source.clone();
        const [x, y, width, height] = CLOUD_BANK[index].crop;
        const image = source.image as HTMLImageElement;
        texture.colorSpace = SRGBColorSpace;
        texture.repeat.set(width / image.width, height / image.height);
        texture.offset.set(x / image.width, 1 - (y + height) / image.height);
        texture.needsUpdate = true;
        return texture;
      }),
    [sources],
  );
  useEffect(() => {
    invalidate();
    const frame = requestAnimationFrame(invalidate);
    return () => {
      cancelAnimationFrame(frame);
      textures.forEach((texture) => texture.dispose());
    };
  }, [textures, invalidate]);
  useFrame(() => {
    if (bank.current) bank.current.position.x = Math.sin(time.current * 0.06) * 0.012;
  });
  return (
    <>
      <mesh position={[0, 1.0, -1.3]}>
        <planeGeometry args={[2.8, 0.7]} />
        <shaderMaterial
          vertexShader={skyVertex}
          fragmentShader={skyFragment}
          transparent
          depthWrite={false}
        />
      </mesh>
      <group ref={bank}>
        {CLOUD_BANK.map((cloud, index) => (
          <mesh
            key={cloud.file}
            position={[cloud.x, cloud.y, 1.15 + index * 0.002]}
            renderOrder={20 + index}
          >
            <planeGeometry args={[cloud.width, (cloud.width * cloud.crop[3]) / cloud.crop[2]]} />
            <meshBasicMaterial
              map={textures[index]}
              transparent
              opacity={0.9}
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
        ))}
      </group>
    </>
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
  const [surface, normal, specular] = useTexture(MAPS);
  const globe = useRef<Group>(null);
  const firstFrame = useRef(false);
  const elapsed = useRef(0);
  const viewport = useThree((state) => state.viewport);
  const radius = Math.min(viewport.height * 0.37, viewport.width * 0.38);
  useEffect(() => {
    surface.colorSpace = SRGBColorSpace;
    surface.needsUpdate = true;
  }, [surface]);
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
        </group>
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
      <group scale={radius}>
        <CloudBank time={elapsed} />
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
