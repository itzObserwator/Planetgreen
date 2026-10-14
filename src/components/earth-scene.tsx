"use client";

import { Canvas, useFrame, useThree, useLoader } from "@react-three/fiber";
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
import { Group, Mesh, SRGBColorSpace, Vector2, TextureLoader } from "three";

export type EarthMotion = { progress: number; requestRender?: () => void };

const ARTWORK = "/textures/earth-india-fallback.webp";
const MAPS = [
  "/textures/earth-daylight.jpg",
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
  const sources = useLoader(
    TextureLoader,
    CLOUD_BANK.map((cloud) => `/textures/cloud-bank/cloud-${cloud.file}.webp`),
  );
  const bank = useRef<Group>(null);
  const puffs = useRef<Array<Mesh | null>>([]);
  const invalidate = useThree((state) => state.invalidate);
  const textures = sources;
  useEffect(() => {
    textures.forEach((texture) => {
      texture.colorSpace = SRGBColorSpace;
      texture.needsUpdate = true;
    });
    invalidate();
  }, [textures, invalidate]);
  useFrame(() => {
    const t = time.current;
    if (bank.current) bank.current.position.x = Math.sin(t * 0.12) * 0.02;
    // Separate speeds and phases keep the cloud bank from moving like one image.
    // Follow the circular crest as each puff drifts; gentle scaling adds billowing.
    puffs.current.forEach((mesh, index) => {
      if (!mesh) return;
      const cloud = CLOUD_BANK[index];
      const phase = index * 1.3;
      const wave = Math.sin(t * (0.22 + index * 0.025) + phase) - Math.sin(phase);
      const x = cloud.x + wave * (0.04 + index * 0.004);
      const arc = Math.sqrt(Math.max(0.01, 1 - x * x)) - Math.sqrt(1 - cloud.x * cloud.x);
      const breath = Math.sin(t * 0.32 + phase) - Math.sin(phase);
      mesh.position.x = x;
      mesh.position.y = cloud.y + arc + breath * 0.012;
      mesh.rotation.z = breath * 0.014;
      mesh.scale.set(1 + breath * 0.025, 1 + breath * 0.045, 1);
    });
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
            ref={(mesh) => {
              puffs.current[index] = mesh;
            }}
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

function FrameBudget({ animate, motion }: { animate: boolean; motion: RefObject<EarthMotion> }) {
  const invalidate = useThree((state) => state.invalidate);
  useEffect(() => {
    const control = motion.current;
    control.requestRender = invalidate;
    invalidate();
    return () => {
      if (control.requestRender === invalidate) delete control.requestRender;
    };
  }, [motion, invalidate]);
  useEffect(() => {
    if (!animate) return;
    const timer = window.setInterval(invalidate, 1000 / 30);
    return () => window.clearInterval(timer);
  }, [animate, invalidate]);
  return null;
}

function ArtworkFallback() {
  return <img className="earth-artwork-fallback" src={ARTWORK} alt="" />;
}

class WebGLBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode; onFailure?: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onFailure?.();
  }
  render() {
    return this.state.failed ? (
      this.props.fallback !== undefined ? (
        this.props.fallback
      ) : (
        <ArtworkFallback />
      )
    ) : (
      this.props.children
    );
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
  const [surface, normal, specular] = useLoader(TextureLoader, MAPS);
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
    // Share the very same progress as GSAP's descent/zoom. Scrolling backwards
    // reverses rotation exactly, and the opening always starts facing India.
    if (globe.current)
      globe.current.rotation.y = INITIAL_ROTATION + Math.min(motion.current.progress, 1.5) * 0.95;
    // Rotation is driven by scroll redraws, independently of the cloud timer.
    if (animate) elapsed.current += Math.min(delta, 0.05);
  });
  return (
    <>
      <ambientLight intensity={0.8} />
      <hemisphereLight args={["#fffdf3", "#bbcbb3", 0.9]} />
      <directionalLight position={[-3, 4, 5]} intensity={1.6} color="#fff9ec" />
      <directionalLight position={[4, 0, 4]} intensity={0.6} color="#f0f7eb" />
      <group scale={radius} rotation={[(VIEW_LATITUDE * Math.PI) / 180, 0, 0]}>
        <group ref={globe} rotation={[0, INITIAL_ROTATION, 0]}>
          <mesh>
            <sphereGeometry args={[1, 96, 64]} />
            <meshPhongMaterial
              map={surface}
              normalMap={normal}
              normalScale={new Vector2(0.4, 0.4)}
              specularMap={specular}
              specular="#d8e5d2"
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
  embedded = false,
  onStatus,
}: {
  className?: string;
  motion: RefObject<EarthMotion>;
  embedded?: boolean;
  onStatus?: (ready: boolean) => void;
}) {
  const container = useRef<HTMLDivElement>(null);
  const [reduced, setReduced] = useState(true);
  const [visible, setVisible] = useState(true);
  const [ready, setReady] = useState(false);
  const [contextLost, setContextLost] = useState(false);
  const onReady = useMemo(
    () => () => {
      setReady(true);
      onStatus?.(true);
    },
    [onStatus],
  );
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
      className={`${embedded ? "earth-webgl" : "earth-artwork"} ${className}`}
      data-ready={ready && !contextLost}
      aria-hidden="true"
    >
      {!embedded && <ArtworkFallback />}
      {!contextLost && (
        <WebGLBoundary fallback={embedded ? null : undefined} onFailure={() => onStatus?.(false)}>
          <Canvas
            orthographic
            resize={{ offsetSize: true }}
            camera={{ position: [0, 0, 2000], zoom: 1, near: 0.1, far: 5000 }}
            dpr={1}
            frameloop="demand"
            gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
            fallback={embedded ? null : <ArtworkFallback />}
            style={{ opacity: ready ? 1 : 0, transition: "opacity 600ms ease" }}
            onCreated={({ gl }) => {
              gl.setClearColor(0x000000, 0);
              gl.domElement.addEventListener(
                "webglcontextlost",
                () => {
                  setContextLost(true);
                  onStatus?.(false);
                },
                {
                  once: true,
                },
              );
            }}
          >
            <FrameBudget animate={!reduced && visible} motion={motion} />
            <Suspense fallback={null}>
              <RealisticEarth animate={!reduced && visible} onReady={onReady} motion={motion} />
            </Suspense>
          </Canvas>
        </WebGLBoundary>
      )}
    </div>
  );
}
