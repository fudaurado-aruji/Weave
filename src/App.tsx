import { Suspense, useMemo } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { WebGPURenderer } from 'three/webgpu'
import { positionWorld, mod, length, smoothstep, uniform } from 'three/tsl'
import * as THREE from 'three/webgpu'

/**
 * Weave V2: Infinite TSL Grid
 * WebGPU Native implementation of the core background.
 */
function InfiniteGrid() {
  const { gl } = useThree()
  
  // Grid parameters via TSL Uniforms
  const uColorNode = useMemo(() => uniform(new THREE.Color('#cad1da')), [])
  const uSpacingNode = useMemo(() => uniform(1.0), [])
  const uDotSizeNode = useMemo(() => uniform(0.02), [])

  // TSL Logic: Efficient procedural grid
  const st = positionWorld.xy;
  const grid = mod(st.add(uSpacingNode.mul(0.5)), uSpacingNode).sub(uSpacingNode.mul(0.5));
  const dist = length(grid);
  const alphaNode = smoothstep(uDotSizeNode, uDotSizeNode.mul(0.5), dist);

  return (
    <mesh position={[0, 0, -0.1]}>
      <planeGeometry args={[2000, 2000]} />
      <meshBasicMaterial 
        colorNode={uColorNode}
        opacityNode={alphaNode}
        transparent 
      />
    </mesh>
  )
}

function Scene() {
  return (
    <>
      <ambientLight intensity={1.0} />
      <InfiniteGrid />
      
      {/* Starting Object: A simple 3D glass cube to test PBR and WebGPU depth */}
      <mesh position={[0, 0, 1]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshPhysicalMaterial 
          color="#c5a059" 
          thickness={0.5} 
          roughness={0.1} 
          transmission={1} 
          ior={1.5}
        />
      </mesh>
    </>
  )
}

export default function App() {
  return (
    <div className="w-full h-full relative">
      <Canvas
        flat
        shadows
        gl={async ({ canvas, ...props }) => {
          const renderer = new WebGPURenderer({ canvas, ...props, antialias: true })
          await renderer.init()
          return renderer
        }}
        onCreated={({ gl }) => {
          if (gl.domElement) {
            gl.domElement.style.touchAction = 'none'
          }
        }}
        camera={{ position: [0, 0, 10], fov: 50 }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>

      {/* Overlay UI */}
      <div className="absolute top-8 left-8 pointer-events-none">
        <h1 className="text-4xl font-black tracking-tighter uppercase text-[var(--weave-accent)]">
          Weave <span className="text-[var(--weave-gold)]">V2</span>
        </h1>
        <p className="text-sm font-bold opacity-30 uppercase tracking-widest mt-2">
          Spatial Middleware OS / WebGPU Native
        </p>
      </div>

      <div className="absolute bottom-8 right-8 bg-white/80 backdrop-blur-xl border border-black/5 p-4 rounded-2xl shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs font-black uppercase tracking-wider">WebGPU System Active</span>
        </div>
      </div>
    </div>
  )
}
