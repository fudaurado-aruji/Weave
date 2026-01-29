import { Suspense, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { WebGPURenderer } from 'three/webgpu'
import { positionWorld, mod, length, smoothstep, uniform } from 'three/tsl'
import * as THREE from 'three/webgpu'

/**
 * Weave V2: Infinite TSL Grid
 * WebGPU Native implementation of the core background.
 */
import { CameraController } from './components/CameraController'
import { useStore } from './store/useStore'

/**
 * Weave V2: Infinite TSL Grid
 */
function InfiniteGrid() {
  const mode = useStore((state) => state.mode)
  
  // Grid parameters via TSL Uniforms
  const uColorNode = useMemo(() => uniform(new THREE.Color('#cad1da')), [])
  const uSpacingNode = useMemo(() => uniform(1.0), [])
  const uDotSizeNode = useMemo(() => uniform(0.02), [])

  // TSL Logic: Efficient procedural grid
  const st = positionWorld.xy;
  const grid = mod(st.add(uSpacingNode.mul(0.5)), uSpacingNode).sub(uSpacingNode.mul(0.5));
  const dist = length(grid);
  const alphaNode = smoothstep(uDotSizeNode, uDotSizeNode.mul(0.5), dist);

  // Hide grid in Pure 3D Mode for cleaner horizon look
  if (mode === '3D') return null;

  return (
    <mesh position={[0, 0, -0.01]} rotation={[0, 0, 0]}>
      <planeGeometry args={[2000, 2000]} />
      <meshBasicMaterial 
        colorNode={uColorNode}
        opacityNode={alphaNode}
        transparent 
      />
    </mesh>
  )
}

function Horizon() {
  const mode = useStore((state) => state.mode)
  if (mode !== '3D') return null

  return (
    <group>
      <gridHelper args={[1000, 100, 0xcccccc, 0xeeeeee]} rotation={[Math.PI/2, 0, 0]} position={[0, 0, -0.1]} />
      <mesh position={[0, 0, -1]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2000, 2000]} />
        <meshStandardMaterial color="#f8f9fa" roughness={1} />
      </mesh>
      <fog attach="fog" args={['#f8f9fa', 10, 100]} />
    </group>
  )
}

function Scene() {
  return (
    <>
      <CameraController />
      <ambientLight intensity={1.5} />
      <pointLight position={[10, 10, 10]} intensity={2} />
      
      <InfiniteGrid />
      <Horizon />
      
      {/* Test Object */}
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


import { StudioLayout } from './components/StudioLayout'

export default function App() {
  return (
    <StudioLayout>
      <Canvas
        flat
        shadows
        gl={async ({ canvas, ...props }) => {
          const renderer = new WebGPURenderer({ canvas, ...props, antialias: true } as any)
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

      {/* OS Status/Mode Indicator */}
      <div className="absolute bottom-20 right-8 pointer-events-none z-30">
        <div className="flex items-center gap-4 bg-white/50 backdrop-blur-sm px-3 py-1.5 rounded-full border border-black/5">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest opacity-50">WebGPU Native View</span>
        </div>
      </div>
    </StudioLayout>
  )
}
