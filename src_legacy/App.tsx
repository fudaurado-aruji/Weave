import { useRef, useState, useEffect, useMemo, useCallback, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { WebGPURenderer } from 'three/webgpu'
import { MapControls, OrbitControls } from '@react-three/drei'
import { Minus, Plus, ChevronDown, Sparkles, Box, Layers, Clock } from 'lucide-react'
import * as THREE from 'three/webgpu'
import { StudioSidebar } from './components/StudioSidebar'
import { ObjectToolbar } from './components/ObjectToolbar'
import { WorldObjects } from './WorldObjects'
import { UtahTeapot } from './components/UtahTeapot'
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

import { mod, length, smoothstep, positionWorld, uniform } from 'three/tsl'

/**
 * 無限ドットグリッド (TSL 移行版)
 */
function DotGrid() {
  const { camera } = useThree()
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.set(camera.position.x, camera.position.y, -2)
    }
  })

  // TSL Nodes
  const uColorNode = useMemo(() => uniform(new THREE.Color('#cad1da')), [])
  const uSpacingNode = useMemo(() => uniform(0.5), [])
  const uDotSizeNode = useMemo(() => uniform(0.03), [])

  const st = positionWorld.xy;
  const grid = mod(st.add(uSpacingNode.mul(0.5)), uSpacingNode).sub(uSpacingNode.mul(0.5));
  const dist = length(grid);
  const alphaNode = smoothstep(uDotSizeNode, uDotSizeNode.mul(0.5), dist);

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[200, 200]} />
      <meshBasicMaterial 
        colorNode={uColorNode}
        opacityNode={alphaNode}
        transparent 
      />
    </mesh>
  )
}

/**
 * 3D Studio層の地平線
 */
function Ground() {
  return (
    <group position={[0, 0, -5]}>
      <gridHelper args={[100, 50, "#cad1da", "#e5e7eb"]} rotation={[Math.PI / 2, 0, 0]} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>
    </group>
  )
}

function Scene({ onMouseMove, onBackgroundDoubleClick }: { onMouseMove: (pos: { x: number; y: number; z: number }) => void, onBackgroundDoubleClick: (pt: THREE.Vector3) => void }) {
  const isDragging = useStore((state) => state.isDragging);
  const interactionMode = useStore((state) => state.interactionMode);
  const zoom = useStore((state) => state.zoom);
  const currentLayer = useStore((state) => state.currentLayer);
  const { camera, gl } = useThree();

  // Wait for renderer to be ready to avoid 'touchAction' error in OrbitControls
  if (!gl || !(gl as any).domElement) return null;

  useEffect(() => {
    // Sync camera FOV with zoom state (FOVx100 = 50)
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = 50 / (zoom / 100);
      camera.updateProjectionMatrix();
    }
  }, [zoom, camera]);

  // Layer transition animation via useFrame for smoothness
  const targetPos = useRef(new THREE.Vector3(0, 0, 20));
  const isTransitioning = useRef(false);

  useEffect(() => {
    isTransitioning.current = true;
    if (currentLayer === 2) {
      targetPos.current.set(10, -15, 10);
    } else if (currentLayer === 3) {
      targetPos.current.set(0, -20, 5);
    } else {
      targetPos.current.set(0, 0, 20);
    }
    
    // Switch to target immediately to avoid fighting OrbitControls
    camera.position.copy(targetPos.current);
    if (currentLayer === 1) {
      camera.up.set(0, 1, 0);
      camera.lookAt(0, 0, 0);
    } else {
      camera.lookAt(0, 0, currentLayer === 3 ? 0 : -5);
    }
    
    // Reset transition flag after a short delay
    const timer = setTimeout(() => { isTransitioning.current = false; }, 500);
    return () => clearTimeout(timer);
  }, [currentLayer, camera]);

  // Disable default browser context menu to allow right-click panning
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    window.addEventListener('contextmenu', handleContextMenu);
    return () => window.removeEventListener('contextmenu', handleContextMenu);
  }, []);

  return (
    <>
      <MouseTracker onUpdate={onMouseMove} />
      <ambientLight intensity={currentLayer === 1 ? 0.8 : (currentLayer === 2 ? 0.5 : 0.3)} />
      <directionalLight position={[10, 10, 10]} intensity={currentLayer === 2 ? 1.5 : (currentLayer === 3 ? 2 : 0)} castShadow />
      <pointLight position={[-10, 5, 10]} intensity={0.5} />
      
      {currentLayer === 1 ? <DotGrid /> : <Ground />}

      {/* Background Hit Area for adding objects */}
      <mesh 
        position={[0, 0, currentLayer === 1 ? -1 : -5]} 
        onPointerDown={(e) => {
          if (e.button === 0 && interactionMode === 'select') {
            useStore.getState().setSelectedObjectIds([]);
          }
        }}
        onDoubleClick={(e) => {
          if (interactionMode === 'select') {
            e.stopPropagation();
            onBackgroundDoubleClick(e.point);
          }
        }}
      >
        <planeGeometry args={[1000, 1000]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      
      <Suspense fallback={null}>
        <WorldObjects />
      </Suspense>
      
      {currentLayer === 2 && <UtahTeapot />}

      <mesh>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="#c5a059" />
      </mesh>

      {currentLayer === 1 ? (
        <MapControls
          enableRotate={false}
          screenSpacePanning={true}
          enabled={interactionMode === 'pan' && !isDragging}
          domElement={gl.domElement}
        />
      ) : (
        <OrbitControls
          makeDefault
          target={[0, 0, -5]}
          enablePan={true}
          enableRotate={true}
          enabled={!isDragging}
          domElement={gl.domElement}
        />
      )}
    </>
  )
}

function App() {
  useEffect(() => {
    const checkWebGPU = async () => {
      if ('gpu' in navigator) {
        try {
          const adapter = await navigator.gpu.requestAdapter();
          if (adapter) {
            console.log('%c Weave: WebGPU is supported and active. ', 'background: #c5a059; color: #fff; font-weight: bold;');
          } else {
            console.warn('Weave: WebGPU is supported but no adapter found. Falling back to WebGL 2.');
          }
        } catch (e) {
          console.error('Weave: WebGPU support check failed.', e);
        }
      } else {
        console.log('Weave: WebGPU not supported. Using WebGL 2 fallback.');
      }
    };
    checkWebGPU();
  }, []);

  const [mousePos, setMousePos] = useState({ x: 0, y: 0, z: 0 })
  const [activeTab, setActiveTab] = useState<SidebarTabId | null>(null)
  const addObject = useStore((state) => state.addObject)
  const setZoom = useStore((state) => state.setZoom)
  const setInteractionMode = useStore((state) => state.setInteractionMode)
  const interactionMode = useStore((state) => state.interactionMode)
  const zoom = useStore((state) => state.zoom)
  const currentLayer = useStore((state) => state.currentLayer)
  const setCurrentLayer = useStore((state) => state.setCurrentLayer)

  const handleAddSticky = (point: THREE.Vector3) => {
    const objects = useStore.getState().objects;
    let targetX = point.x;
    let targetY = point.y;
    const S = 2.0; // Standard object width
    const step = S / 4; // 0.5

    // Find available cascade position
    let found = false;
    let attempts = 0;
    while (!found && attempts < 20) {
      const isOccupied = Object.values(objects).some(obj => 
        (obj.layerId || 1) === currentLayer &&
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
    const is3D = currentLayer === 2;
    const isCardSpace = currentLayer === 3;
    
    const newObject: WorldObject = {
      id,
      type: isCardSpace ? 'card' : 'sticky',
      position: { 
        x: targetX, 
        y: targetY, 
        z: isCardSpace ? point.z + 2 : (is3D ? point.z + 1.5 : point.z + 0.05) 
      },
      rotation: { 
        x: (isCardSpace || is3D) ? Math.PI / 2 : 0,
        y: 0, 
        z: 0 
      },
      scale: { x: 1, y: isCardSpace ? 1 : 1, z: 1 },
      style: isCardSpace ? {
        frontImage: `/assets/cards/tarot/RWS_0_${Math.floor(Math.random() * 21).toString().padStart(2, '0')}.webp`,
        backImage: '/assets/cards/tarot_back.png'
      } : {
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
    useStore.getState().setSelectedObjectIds([id]);
    if (!isCardSpace) {
      useStore.getState().setEditingObjectId(id);
    }
  };

  const handleAddClock = () => {
    const id = crypto.randomUUID();
    const newObject: WorldObject = {
      id,
      type: 'clock',
      layerId: currentLayer,
      position: { x: 0, y: 0, z: currentLayer === 1 ? 0.5 : 2 },
      rotation: { x: currentLayer === 1 ? 0 : Math.PI / 2, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      style: {},
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    addObject(newObject);
    useStore.getState().setSelectedObjectIds([id]);
  };

  const setIsInteracting = useStore((state) => state.setIsInteracting);
  const interactionTimeout = useRef<any>(null);

  const startInteraction = useCallback(() => {
    setIsInteracting(true);
    if (interactionTimeout.current) clearTimeout(interactionTimeout.current);
    interactionTimeout.current = setTimeout(() => {
      setIsInteracting(false);
    }, 500); 
  }, [setIsInteracting]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space' && interactionMode === 'select') {
         setInteractionMode('pan');
         startInteraction();
      }
      if (e.ctrlKey || e.metaKey) {
        if (e.key === '=' || e.key === '+' || e.key === '-') {
          e.preventDefault();
          startInteraction();
          if (e.key === '-' ) setZoom(zoom - 10);
          else setZoom(zoom + 10);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
         setInteractionMode('select');
         setIsInteracting(false);
      }
    };

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        startInteraction();
        const delta = e.deltaY > 0 ? -5 : 5;
        setZoom(useStore.getState().zoom + delta);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('wheel', handleWheel as any, { passive: false });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('wheel', handleWheel as any);
    };
  }, [interactionMode, zoom, setIsInteracting, setInteractionMode, setZoom, startInteraction]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (interactionTimeout.current) clearTimeout(interactionTimeout.current);
    };
  }, []);

  const [showZoomMenu, setShowZoomMenu] = useState(false);
  const ZOOM_PRESETS = [10, 25, 50, 75, 100, 125, 150, 200, 300, 400];

  const handlePointerMissed = () => {
    // 何もないところをクリックしたら選択解除
    useStore.getState().setSelectedObjectIds([]);
  };

  return (
    <div className={`w-full h-full relative overflow-hidden flex flex-row font-['Outfit'] ${interactionMode === 'pan' ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`}>
      {/* Sidebar Layer */}
      <StudioSidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Canvas Layer */}
      <div className="relative flex-1 h-full overflow-hidden flex flex-col">
        
        {/* Top Header Bar */}
        <header className="h-[64px] bg-white/80 backdrop-blur-xl border-b border-[var(--weave-muted)]/20 flex items-center justify-between px-6 shrink-0 z-40">
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[var(--weave-gold)] rounded-lg flex items-center justify-center shadow-md">
                   <div className="w-4 h-4 bg-white rounded-sm rotate-45" />
                </div>
                <h1 className="text-lg font-black tracking-widest uppercase text-[var(--weave-accent)]">Weave</h1>
             </div>
             <div className="h-6 w-px bg-[var(--weave-muted)]/20" />
              <div className="flex items-center gap-2 px-3 py-1.5 bg-black/5 rounded-lg border border-black/5">
                 <span className="text-[10px] font-black tracking-widest uppercase opacity-30">Frame</span>
                 <span className="text-[12px] font-bold">フレーム 1</span>
              </div>
              
              <div className="h-6 w-px bg-[var(--weave-muted)]/20" />
              
              {/* Layer Toggle */}
              <div className="flex items-center bg-black/5 p-1 rounded-xl border border-black/5">
                <button 
                  onClick={() => setCurrentLayer(1)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${currentLayer === 1 ? 'bg-white shadow-sm text-[var(--weave-accent)]' : 'text-[var(--weave-accent)]/40 hover:text-[var(--weave-accent)]'}`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-black tracking-widest uppercase">2D Board</span>
                </button>
                <button 
                  onClick={() => setCurrentLayer(2)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${currentLayer === 2 ? 'bg-white shadow-sm text-[var(--weave-accent)]' : 'text-[var(--weave-accent)]/40 hover:text-[var(--weave-accent)]'}`}
                >
                  <Box className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-black tracking-widest uppercase">3D Studio</span>
                </button>
                <button 
                  onClick={() => setCurrentLayer(3)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${currentLayer === 3 ? 'bg-white shadow-sm text-[var(--weave-accent)]' : 'text-[var(--weave-accent)]/40 hover:text-[var(--weave-accent)]'}`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-black tracking-widest uppercase">Card Space</span>
                </button>
              </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={handleAddClock}
              className="px-4 py-2 bg-gradient-to-br from-cyan-500 to-blue-600 hover:shadow-lg hover:shadow-cyan-500/30 rounded-xl transition-all group flex items-center gap-2"
            >
               <span className="text-[11px] font-black tracking-wider text-white uppercase">Cyber Clock</span>
               <Clock className="w-4 h-4 text-white" />
            </button>
            <button className="px-4 py-2 bg-gradient-to-br from-[#4f46e5] to-[#9333ea] hover:shadow-lg hover:shadow-indigo-500/30 rounded-xl transition-all group flex items-center gap-2">
               <span className="text-[11px] font-black tracking-wider text-white uppercase">Gemini Assist</span>
               <Sparkles className="w-4 h-4 text-white animate-pulse" />
            </button>
          </div>
        </header>

        <div className="flex-1 relative">
          <Canvas
            flat
            shadows
            gl={async ({ canvas, ...props }) => {
              console.log('R3F gl factory props:', { canvas, ...props })
              const renderer = new WebGPURenderer({ canvas, ...props, antialias: true })
              await renderer.init()
              return renderer
            }}
            onCreated={({ gl }) => {
              if (gl.domElement) {
                gl.domElement.style.touchAction = 'none'
              }
            }}
            camera={{ position: [0, 0, 20], fov: 50 }}
            onPointerMissed={handlePointerMissed}
          >
            <Suspense fallback={null}>
              <Scene onMouseMove={setMousePos} onBackgroundDoubleClick={handleAddSticky} />
            </Suspense>
          </Canvas>
        </div>

        {/* Floating Toolbars Layer */}
        <ObjectToolbar />

        {/* Bottom UI Bar (Zoom & Coordinates) */}
        <div className="fixed bottom-6 left-[110px] right-6 flex justify-between items-center pointer-events-none">
          {/* Zoom HUD */}
          <div className="relative pointer-events-auto flex items-center gap-3">
             {showZoomMenu && (
               <div className="absolute bottom-full left-0 mb-3 bg-white/95 backdrop-blur-2xl border border-[var(--weave-muted)]/30 rounded-2xl shadow-2xl p-2 min-w-[140px] animate-in fade-in slide-in-from-bottom-2 duration-300 z-50 pointer-events-auto">
                  <div className="grid grid-cols-2 gap-1 mb-2">
                    {ZOOM_PRESETS.map(p => (
                      <button 
                        key={p} 
                        onClick={() => { setZoom(p); setShowZoomMenu(false); }}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black font-mono transition-all ${zoom === p ? 'bg-[var(--weave-gold)] text-white' : 'hover:bg-black/5 opacity-60 hover:opacity-100'}`}
                      >
                        {p}%
                      </button>
                    ))}
                  </div>
                  <button 
                    onClick={() => { setZoom(100); setShowZoomMenu(false); }}
                    className="w-full px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider bg-black/5 hover:bg-[var(--weave-gold)] hover:text-white transition-all text-center"
                  >
                    全体表示
                  </button>
               </div>
             )}
             <div className="bg-white/80 backdrop-blur-xl border border-[var(--weave-muted)]/30 px-4 py-2 rounded-2xl shadow-xl flex items-center gap-4 animate-in fade-in slide-in-from-bottom-2 duration-700">
              <button 
                onClick={() => setZoom(zoom - 10)}
                className="p-1 hover:bg-black/5 rounded-lg opacity-40 hover:opacity-100"
                title="Zoom Out"
              >
                <Minus className="w-4 h-4" />
              </button>
              
              <button 
                onClick={() => setShowZoomMenu(!showZoomMenu)}
                className="flex flex-col items-center min-w-[64px] hover:bg-black/5 rounded-xl py-1 transition-colors group relative"
              >
                 <span className="text-[8px] font-black tracking-widest uppercase opacity-20 leading-none mb-1 group-hover:opacity-40">Zoom</span>
                 <span className="text-[13px] font-black font-mono leading-none flex items-center gap-1">
                    {Math.round(zoom)}%
                    <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${showZoomMenu ? 'rotate-180' : ''}`} />
                 </span>
              </button>

              <button 
                onClick={() => setZoom(zoom + 10)}
                className="p-1 hover:bg-black/5 rounded-lg opacity-40 hover:opacity-100"
                title="Zoom In"
              >
                <Plus className="w-4 h-4" />
              </button>
              
              <div className="w-px h-6 bg-[var(--weave-muted)]/20" />
              
              <input 
                type="range" 
                min="10" 
                max="400" 
                step="1" 
                value={zoom} 
                onChange={(e) => setZoom(parseInt(e.target.value))}
                className="w-24 h-1 bg-[var(--weave-muted)]/20 rounded-full appearance-none cursor-pointer accent-[var(--weave-gold)]"
              />
            </div>
          </div>

          {/* Coordinate Display */}
          <div className="bg-white/80 backdrop-blur-xl border border-[var(--weave-muted)]/30 px-4 py-2 rounded-2xl shadow-xl flex flex-row gap-4 items-center animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="text-[10px] font-black text-[var(--weave-gold)] tracking-[0.2em] uppercase border-r border-[var(--weave-muted)]/30 pr-4">Orbit Position</div>
            <div className="flex gap-4 font-mono text-[11px] font-bold">
               <span className="flex gap-1.5"><span className="opacity-30">X</span> {mousePos.x.toFixed(2)}</span>
               <span className="flex gap-1.5"><span className="opacity-30">Y</span> {mousePos.y.toFixed(2)}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default App
