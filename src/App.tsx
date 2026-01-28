import { useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { MapControls } from '@react-three/drei'
import * as THREE from 'three'
import { StudioSidebar } from './components/StudioSidebar'
import { ObjectToolbar } from './components/ObjectToolbar'
import { WorldObjects } from './WorldObjects'
import { useStore } from './store/useStore'
import type { WorldObject, SidebarTabId } from './types'

/**
 * マウスのワールド座標を更新するロジックのみを持つコンポーネント (Canvas内)
 */
function MouseTracker({ onUpdate }: { onUpdate: (pos: { x: number; y: number; z: number }) => void }) {
  const { camera, pointer } = useThree()

  useFrame(() => {
    const vector = new THREE.Vector3(pointer.x, pointer.y, 0.5)
    vector.unproject(camera)
    const dir = vector.sub(camera.position).normalize()
    const distance = -camera.position.z / dir.z
    const worldPos = camera.position.clone().add(dir.multiplyScalar(distance))

    onUpdate({
      x: worldPos.x,
      y: worldPos.y,
      z: worldPos.z,
    })
  })

  return null
}

/**
 * 無限ドットグリッド
 */
function DotGrid() {
  const { camera } = useThree()
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.set(camera.position.x, camera.position.y, -0.01)
    }
  })

  const shaderArgs = {
    uniforms: {
      uColor: { value: new THREE.Color('#cad1da') },
      uSpacing: { value: 0.5 },
      uDotSize: { value: 0.03 },
    },
    vertexShader: `
      varying vec3 vWorldPosition;
      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * viewMatrix * worldPosition;
      }
    `,
    fragmentShader: `
      varying vec3 vWorldPosition;
      uniform vec3 uColor;
      uniform float uSpacing;
      uniform float uDotSize;
      void main() {
        vec2 st = vWorldPosition.xy;
        vec2 grid = mod(st + uSpacing * 0.5, uSpacing) - uSpacing * 0.5;
        float dist = length(grid);
        float alpha = smoothstep(uDotSize, uDotSize * 0.5, dist);
        if (alpha < 0.01) discard;
        gl_FragColor = vec4(uColor, alpha);
      }
    `,
  }

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[200, 200]} />
      <shaderMaterial {...shaderArgs} transparent />
    </mesh>
  )
}

function Scene({ onMouseMove }: { onMouseMove: (pos: { x: number; y: number; z: number }) => void }) {
  const isDragging = useStore((state) => state.isDragging);
  
  return (
    <>
      <MouseTracker onUpdate={onMouseMove} />
      <ambientLight intensity={0.8} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <DotGrid />
      
      <WorldObjects />
      
      <mesh>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="#c5a059" />
      </mesh>

      <MapControls
        enableRotate={false}
        screenSpacePanning={true}
        enabled={!isDragging}
      />
    </>
  )
}

function App() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0, z: 0 })
  const [activeTab, setActiveTab] = useState<SidebarTabId | null>(null)
  const addObject = useStore((state) => state.addObject)

  const handleDoubleClick = () => {
    const objects = useStore.getState().objects;
    let targetX = mousePos.x;
    let targetY = mousePos.y;
    const S = 2.0; // Standard object width
    const step = S / 4; // 0.5

    // Find available cascade position
    let found = false;
    let attempts = 0;
    while (!found && attempts < 20) {
      const isOccupied = Object.values(objects).some(obj => 
        Math.abs(obj.position.x - targetX) < 0.01 && 
        Math.abs(obj.position.y - targetY) < 0.01
      );
      
      if (isOccupied) {
        targetX += step;
        targetY -= step;
        attempts++;
      } else {
        found = true;
      }
    }

    const id = crypto.randomUUID();
    const newObject: WorldObject = {
      id,
      type: 'sticky',
      position: { x: targetX, y: targetY, z: mousePos.z },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      style: {
        fillColor: '#fef3c7',
        strokeColor: '#d97706',
        strokeWidth: 1,
        opacity: 1,
      },
      content: '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    addObject(newObject);
  };

  const handlePointerMissed = () => {
    // 何もないところをクリックしたら選択解除
    useStore.getState().setSelectedObjectIds([]);
  };

  return (
    <div 
      className="w-full h-full relative overflow-hidden flex flex-row font-['Outfit']"
      onDoubleClick={handleDoubleClick}
    >
      {/* Sidebar Layer */}
      <StudioSidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Canvas Layer */}
      <div className="relative flex-1 h-full overflow-hidden">
        <Canvas
          shadows
          gl={{ antialias: true }}
          camera={{ position: [0, 0, 20], fov: 50 }}
          onPointerMissed={handlePointerMissed}
        >
          <Scene onMouseMove={setMousePos} />
        </Canvas>

        {/* Floating Toolbars Layer */}
        <ObjectToolbar />

        {/* Coordinate Display (Refined) */}
        <div className="fixed bottom-6 right-6 bg-white/80 backdrop-blur-xl border border-[var(--weave-muted)]/30 px-4 py-2 rounded-xl shadow-xl pointer-events-none flex flex-row gap-4 items-center animate-in fade-in slide-in-from-bottom-2 duration-500">
           <div className="text-[10px] font-black text-[var(--weave-gold)] tracking-[0.2em] uppercase border-r border-[var(--weave-muted)]/30 pr-4">Orbit Position</div>
           <div className="flex gap-4 font-mono text-[11px] font-bold">
              <span className="flex gap-1.5"><span className="opacity-30">X</span> {mousePos.x.toFixed(2)}</span>
              <span className="flex gap-1.5"><span className="opacity-30">Y</span> {mousePos.y.toFixed(2)}</span>
              <span className="flex gap-1.5"><span className="opacity-30">Z</span> {mousePos.z.toFixed(2)}</span>
           </div>
        </div>

        {/* Branding (Optional refined) */}
        <div className="fixed top-6 left-[110px] pointer-events-none opacity-20 hover:opacity-100 transition-opacity">
           <h1 className="text-xl font-black tracking-widest uppercase">Weave</h1>
        </div>
      </div>
    </div>
  )
}

export default App
