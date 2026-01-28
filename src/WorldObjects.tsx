import { useRef, useMemo, useEffect } from 'react'
import { useStore } from './store/useStore'
import type { WorldObject } from './types'
import * as THREE from 'three'
import { Html } from '@react-three/drei'
import { Copy, Trash2, MoreHorizontal } from 'lucide-react'

export function WorldObjectRenderer({ object }: { object: WorldObject }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const isSelected = useStore((state) => state.selectedObjectIds.includes(object.id));
  const setSelectedObjectIds = useStore((state) => state.setSelectedObjectIds);
  const selectedObjectIds = useStore((state) => state.selectedObjectIds);
  const removeObject = useStore((state) => state.removeObject);
  const addObject = useStore((state) => state.addObject);

  // 正三角形の計算 (一辺の長さを2とする)
  // 高さ = √3 ≒ 1.732
  // 重心を (0,0) にするため、
  // 上頂点: (0, 2/√3)  ≒ (0, 1.1547)
  // 下辺: Y = -1/√3 ≒ -0.57735
  const geometry = useMemo(() => {
    const isCircle = (object.style as any).shapeType === 'circle';
    if (isCircle) return new THREE.CircleGeometry(1, 32);
    
    const isTriangle = (object.style as any).shapeType === 'triangle';
    if (isTriangle) {
      const shape = new THREE.Shape();
      const h = Math.sqrt(3);
      // 正三角形の頂点定義 (重心中心)
      shape.moveTo(0, h * 2/3);       // Top
      shape.lineTo(-1, -h / 3);       // Bottom Left
      shape.lineTo(1, -h / 3);        // Bottom Right
      shape.closePath();
      return new THREE.ShapeGeometry(shape);
    }

    const isDiamond = (object.style as any).shapeType === 'diamond';
    if (isDiamond) {
      const shape = new THREE.Shape();
      shape.moveTo(0, 1.2);
      shape.lineTo(1, 0);
      shape.lineTo(0, -1.2);
      shape.lineTo(-1, 0);
      shape.closePath();
      return new THREE.ShapeGeometry(shape);
    }

    const isHexagon = (object.style as any).shapeType === 'hexagon';
    if (isHexagon) {
      const shape = new THREE.Shape();
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2 + Math.PI / 6;
        const x = Math.cos(angle);
        const y = Math.sin(angle);
        if (i === 0) shape.moveTo(x, y);
        else shape.lineTo(x, y);
      }
      shape.closePath();
      return new THREE.ShapeGeometry(shape);
    }

    const isStar = (object.style as any).shapeType === 'star';
    if (isStar) {
      const shape = new THREE.Shape();
      for (let i = 0; i < 10; i++) {
        // 開始角度を上向き (Math.PI / 2) に修正し、角度計算を反転
        const angle = (i / 10) * Math.PI * 2 + Math.PI / 2;
        const r = i % 2 === 0 ? 1 : 0.45; // 2x2に収まるよう半径を1に調整
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;
        if (i === 0) shape.moveTo(x, y);
        else shape.lineTo(x, y);
      }
      shape.closePath();
      return new THREE.ShapeGeometry(shape);
    }

    return new THREE.PlaneGeometry(2, 2);
  }, [(object.style as any).shapeType]);

  const handlePointerDown = (e: any) => {
    e.stopPropagation(); 
    if (!isSelected) {
       setSelectedObjectIds([object.id]);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeObject(object.id);
    setSelectedObjectIds(selectedObjectIds.filter(id => id !== object.id));
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    const id = crypto.randomUUID();
    const newObject = {
      ...object,
      id,
      position: { x: object.position.x + 2, y: object.position.y - 2, z: object.position.z },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    addObject(newObject);
    setSelectedObjectIds([id]); // Select new object
  };

  return (
    <group
      position={[object.position.x, object.position.y, object.position.z]}
      rotation={[object.rotation.x, object.rotation.y, object.rotation.z]}
      scale={[object.scale.x, object.scale.y, object.scale.z]}
      onClick={handlePointerDown}
    >
      {/* HTML Overlay for Bounding Box & Floating Toolbar */}
      {isSelected && (
        <>
          {/* Bounding Box: 3D空間に直接配置 (transform採用)
              scale={0.01} とすることで、HTML側の 100px が 3D空間の 1ユニットに対応します。
              Geometryが 2x2 (幅2ユニット) なので、200px でピッタリ重なります。
          */}
          <Html 
            transform 
            center
            scale={0.01}
            position={[0, 0, 0.02]}
            style={{ pointerEvents: 'none' }}
          >
            <div 
              style={{ 
                width: '205px', // 2ユニット(200px)よりわずかに大きくして縁を見せる
                height: '205px', 
                border: '10px solid #ff0000', // テスト用にハッキリ見える太さ
                boxSizing: 'border-box'
              }} 
            />
          </Html>

          {/* Floating Toolbar: こちらはスケールさせず常に同じ大きさで見せたいので transform なし */}
          <Html 
            center 
            distanceFactor={20} 
            position={[0, 1.2, 0.1]} 
          >
             <div 
                className="flex items-center gap-1 bg-white/90 backdrop-blur-md shadow-lg border border-[var(--weave-muted)]/30 rounded-lg p-1 animate-in fade-in zoom-in-95 duration-200 pointer-events-auto whitespace-nowrap"
                onMouseDown={(e) => e.stopPropagation()}
             >
                <button 
                  onClick={handleDuplicate}
                  className="p-1.5 hover:bg-[var(--weave-gold)]/10 rounded-md text-[var(--weave-accent)] opacity-70 hover:opacity-100 transition-colors"
                  title="Duplicate"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <div className="w-px h-4 bg-[var(--weave-muted)]/20 mx-0.5" />
                <button 
                  onClick={handleDelete}
                  className="p-1.5 hover:bg-red-50 rounded-md text-[var(--weave-accent)] opacity-70 hover:text-red-500 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="w-px h-4 bg-[var(--weave-muted)]/20 mx-0.5" />
                <button 
                  className="p-1.5 hover:bg-[var(--weave-gold)]/10 rounded-md text-[var(--weave-accent)] opacity-70 hover:opacity-100 transition-colors"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
             </div>
          </Html>
        </>
      )}

      {/* Shadow layer for Sticky */}
      {object.type === 'sticky' && (
        <mesh position={[0.05, -0.05, -0.01]}>
          <planeGeometry args={[2.05, 2.05]} />
          <meshBasicMaterial color="black" transparent opacity={0.1} />
        </mesh>
      )}
      
      <mesh ref={meshRef}>
        <primitive object={geometry} attach="geometry" />
        <meshStandardMaterial 
          color={object.style.fillColor || '#ffffff'} 
          transparent 
          opacity={object.style.opacity ?? 1}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}

export function WorldObjects() {
  const objects = useStore((state) => state.objects);
  const selectedObjectIds = useStore((state) => state.selectedObjectIds);
  const loadFromDB = useStore((state) => state.loadFromDB);
  const setSelectedObjectIds = useStore((state) => state.setSelectedObjectIds);
  const removeObject = useStore((state) => state.removeObject);

  useEffect(() => {
    loadFromDB();
  }, [loadFromDB]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ESC: Deselect
      if (e.key === 'Escape') {
        setSelectedObjectIds([]);
      }
      // Delete/Backspace: Remove selected
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedObjectIds.length > 0) {
        // Prevent backspace from navigating back if not in input
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
        
        selectedObjectIds.forEach(id => removeObject(id));
        setSelectedObjectIds([]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedObjectIds, removeObject, setSelectedObjectIds]);

  return (
    <>
      {Object.values(objects).map((obj) => (
        <WorldObjectRenderer key={obj.id} object={obj} />
      ))}
    </>
  )
}
