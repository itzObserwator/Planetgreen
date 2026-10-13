"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { Component, Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Color, Mesh, SRGBColorSpace, type Texture } from "three";

const ARTWORK = "/textures/reference/earth.png";
const LAYERS = [
  ARTWORK,
  ...Array.from(
    { length: 10 },
    (_, index) => `/textures/reference/cloud-${String(index + 1).padStart(2, "0")}.png`,
  ),
];
const CLOUD_ARCS = [
  [-10, 8],
  [5, -7],
  [-8, 10],
  [10, -5],
];

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Preserve the terrain and alpha silhouette. Lift the shadowed ocean into pale
// sage so the reference illustration works with the requested light theme.
const fragmentShader = `
  uniform sampler2D artwork;
  uniform vec3 daylight;
  uniform float cloud;
  varying vec2 vUv;
  void main() {
    vec4 pixel = texture2D(artwork, vUv);
    float luminance = dot(pixel.rgb, vec3(0.2126, 0.7152, 0.0722));
    float greenRatio = pixel.g / max(pixel.r + pixel.b, 0.001);
    float vegetation = smoothstep(0.7, 1.15, greenRatio) * smoothstep(0.001, 0.02, luminance);
    float terrain = max(smoothstep(0.06, 0.45, luminance), vegetation);
    vec3 surface = mix(daylight, pixel.rgb, terrain * 0.9);
    vec3 mist = mix(daylight, pixel.rgb, 0.75);
    gl_FragColor = vec4(mix(surface, mist, cloud), pixel.a);
    #include <colorspace_fragment>
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

function ArtworkPlane({
  texture,
  index,
  animate,
}: {
  texture: Texture;
  index: number;
  animate: boolean;
}) {
  const mesh = useRef<Mesh>(null);
  const elapsed = useRef(0);
  const viewport = useThree((state) => state.viewport);
  const ratio = 2304 / 2228;
  const height = Math.min(viewport.height, viewport.width / ratio);
  const uniforms = useMemo(
    () => ({
      artwork: { value: texture },
      daylight: { value: new Color(index === 0 ? "#dfe8d5" : "#f4f6ef") },
      cloud: { value: index === 0 ? 0 : 1 },
    }),
    [texture, index],
  );

  useFrame((_, delta) => {
    if (index === 0 || !mesh.current) return;
    if (animate) elapsed.current += Math.min(delta, 0.05);
    const arc = CLOUD_ARCS[(index - 1) % CLOUD_ARCS.length];
    const duration = 20 + index * 2;
    const phase = 0.5 - 0.5 * Math.cos((Math.PI * elapsed.current) / duration);
    mesh.current.rotation.z = ((arc[0] + (arc[1] - arc[0]) * phase) * Math.PI) / 180;
  });

  return (
    <mesh ref={mesh} position={[0, 0, index * 0.01]} renderOrder={index}>
      <planeGeometry args={[height * ratio, height]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
        depthTest={false}
        toneMapped={false}
      />
    </mesh>
  );
}

function IllustratedEarth({ animate, onReady }: { animate: boolean; onReady: () => void }) {
  const textures = useTexture(LAYERS);
  const invalidate = useThree((state) => state.invalidate);
  const firstFrame = useRef(false);
  useEffect(() => {
    textures.forEach((texture, index) => {
      texture.colorSpace = SRGBColorSpace;
      // Soft cloud layers do not need eleven full-size GPU images.
      const source = texture.image as HTMLImageElement;
      const limit = index === 0 ? 2048 : 1024;
      if (source.width > limit) {
        const canvas = document.createElement("canvas");
        canvas.width = limit;
        canvas.height = Math.round((source.height * limit) / source.width);
        const context = canvas.getContext("2d");
        if (context) {
          context.drawImage(source, 0, 0, canvas.width, canvas.height);
          texture.image = canvas;
        }
      }
      texture.needsUpdate = true;
    });
    invalidate();
  }, [textures, invalidate]);
  useFrame(() => {
    if (!firstFrame.current) {
      firstFrame.current = true;
      requestAnimationFrame(onReady);
    }
  });
  return (
    <>
      {textures.map((texture, index) => (
        <ArtworkPlane key={index} texture={texture} index={index} animate={animate} />
      ))}
    </>
  );
}

/** Flat WebGL layers reproduce the reference illustration without sphere distortion. */
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
    <div ref={container} className={`earth-artwork ${className}`} aria-hidden="true">
      <ArtworkFallback />
      {!contextLost && (
        <WebGLBoundary>
          <Canvas
            orthographic
            resize={{ offsetSize: true }}
            camera={{ position: [0, 0, 5], zoom: 1, near: 0.1, far: 20 }}
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
              <IllustratedEarth animate={!reduced && visible} onReady={onReady} />
            </Suspense>
          </Canvas>
        </WebGLBoundary>
      )}
    </div>
  );
}
