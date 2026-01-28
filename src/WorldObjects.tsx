import { useRef, useMemo, useEffect } from 'react'
import { useStore } from './store/useStore'
import { useShallow } from 'zustand/react/shallow'
import type { WorldObject } from './types'
import * as THREE from 'three'
import { Html, Text } from '@react-three/drei'
import { Copy, Trash2, MoreHorizontal } from 'lucide-react'

export function WorldObjectRenderer({ id }: { id: string }) {
  const object = useStore((state) => state.objects[id]);
  if (!object) return null;

  const groupRef = useRef<THREE.Group>(null);
  const isSelected = useStore((state) => state.selectedObjectIds.includes(id));
  const isEditing = useStore((state) => state.editingObjectId === id);
  const setSelectedObjectIds = useStore((state) => state.setSelectedObjectIds);
  const setEditingObjectId = useStore((state) => state.setEditingObjectId);
  const updateObject = useStore((state) => state.updateObject);
  const setIsDragging = useStore((state) => state.setIsDragging);
  const addObject = useStore((state) => state.addObject);
  const removeObject = useStore((state) => state.removeObject);

  // Interaction State (Direct mutation targets)
  const transformState = useRef({
    isDragging: false,
    isResizing: false,
    handleDir: [0, 0] as [number, number],
    handleIdx: -1,
    offset: new THREE.Vector3(),
    initialPos: new THREE.Vector3(),
    initialScale: new THREE.Vector3(),
    fixedPoint: new THREE.Vector3(),
    aspectRatio: 1,
  });

  const handlesRef = useRef<THREE.Group>(null);
  const textGroupRef = useRef<THREE.Group>(null);
  const textRef = useRef<any>(null);

  // 1. Start Dragging (Triggered by Object Body)
  const handleMoveStart = (e: any) => {
    if (object.isPickable === false) return;
    e.stopPropagation();
    if (object.isLocked) return;

    if (!isSelected) {
       setSelectedObjectIds([id]);
    }
    
    transformState.current.isDragging = true;
    transformState.current.isResizing = false;
    setIsDragging(true);

    const intersection = e.point;
    transformState.current.offset.copy(intersection).sub(groupRef.current!.position);
    transformState.current.initialPos.copy(groupRef.current!.position);
    
    e.target.setPointerCapture(e.pointerId);
  };

  const handleDoubleClick = (e: any) => {
    if (object.isPickable === false) return;
    e.stopPropagation();
    setEditingObjectId(id);
    setSelectedObjectIds([id]);
  };

  // 2. Start Resizing (Triggered by Handles)
  const handleResizeStart = (e: any, xDir: number, yDir: number, idx: number) => {
    if (object.isLocked) return;
    e.stopPropagation();
    transformState.current.isResizing = true;
    transformState.current.isDragging = false;
    transformState.current.handleDir = [xDir, yDir];
    transformState.current.handleIdx = idx;
    setIsDragging(true);

    const pos = groupRef.current!.position;
    const scale = groupRef.current!.scale;

    // Fixed point is the opposite corner/side
    const fixedX = pos.x - (xDir * scale.x);
    const fixedY = pos.y - (yDir * scale.y);

    transformState.current.fixedPoint.set(fixedX, fixedY, pos.z);
    transformState.current.initialPos.copy(pos);
    transformState.current.initialScale.copy(scale);
    transformState.current.aspectRatio = scale.x / scale.y;

    e.target.setPointerCapture(e.pointerId);
  };

  // 3. Pointer Move (Direct Mutation for Performance)
  const handlePointerMove = (e: any) => {
    const { isDragging, isResizing, offset, fixedPoint, initialPos, initialScale, aspectRatio, handleDir } = transformState.current;
    if (!isDragging && !isResizing) return;

    e.stopPropagation();
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -initialPos.z);
    const mousePos = new THREE.Vector3();
    e.ray.intersectPlane(plane, mousePos);
    if (!mousePos) return;

    if (isDragging) {
      const newPos = mousePos.sub(offset);
      // Shift key for axis locking
      if (e.shiftKey) {
        const dx = Math.abs(newPos.x - initialPos.x);
        const dy = Math.abs(newPos.y - initialPos.y);
        if (dx > dy) newPos.y = initialPos.y;
        else newPos.x = initialPos.x;
      }
      groupRef.current!.position.set(newPos.x, newPos.y, newPos.z);
    } 
    else if (isResizing) {
      const hx = handleDir[0];
      const hy = handleDir[1];
      
      let targetX = mousePos.x;
      let targetY = mousePos.y;

      // 1. Calculate candidate dimensions relative to fixed point
      let currentWidth = Math.abs(targetX - fixedPoint.x);
      let currentHeight = Math.abs(targetY - fixedPoint.y);

      // 2. Flip Logic: Check if we are past the fixed point
      // If the mouse has crossed the threshold, keep scaling in the opposite direction
      // Current math already does this due to Math.abs and symmetric center calculation.
      
      // Minimum size threshold to feel the "crunch" before flipping
      const minSize = 0.1;
      if (hx !== 0 && currentWidth < minSize) currentWidth = minSize;
      if (hy !== 0 && currentHeight < minSize) currentHeight = minSize;

      // 3. ASPECT RATIO LOCK (Only for corner handles + Modifier key)
      if (hx !== 0 && hy !== 0 && (e.ctrlKey || e.metaKey)) {
        if (currentWidth / currentHeight > aspectRatio) {
          currentHeight = currentWidth / aspectRatio;
        } else {
          currentWidth = currentHeight * aspectRatio;
        }
        // Project targetX/Y back from fixedPoint
        targetX = fixedPoint.x + Math.sign(targetX - fixedPoint.x || hx) * currentWidth;
        targetY = fixedPoint.y + Math.sign(targetY - fixedPoint.y || hy) * currentHeight;
      }

      // Select active axis values
      const finalTargetX = hx !== 0 ? targetX : fixedPoint.x;
      const finalTargetY = hy !== 0 ? targetY : fixedPoint.y;

      // Update Scale (Geometry is 2x2, so divide distance by 2)
      const newScaleX = hx !== 0 ? Math.max(minSize, Math.abs(finalTargetX - fixedPoint.x) / 2) : initialScale.x;
      const newScaleY = hy !== 0 ? Math.max(minSize, Math.abs(finalTargetY - fixedPoint.y) / 2) : initialScale.y;

      // Update Center (Midpoint between fixedPoint and target)
      const newCenterX = (fixedPoint.x + finalTargetX) / 2;
      const newCenterY = (fixedPoint.y + finalTargetY) / 2;

      groupRef.current!.position.set(newCenterX, newCenterY, initialPos.z);
      groupRef.current!.scale.set(newScaleX, newScaleY, initialScale.z);

      // 4. Counter-scale Handles to keep them square and constant size
      if (handlesRef.current) {
        handlesRef.current.children.forEach((handle: any) => {
          handle.scale.set(0.12 / newScaleX, 0.12 / newScaleY, 1);
        });
      }

      // 5. Counter-scale Text and update Wrapping during resize
      if (textGroupRef.current) {
        textGroupRef.current.scale.set(1 / newScaleX, 1 / newScaleY, 1);
      }
      if (textRef.current) {
        textRef.current.maxWidth = newScaleX * 1.8;
        if (textRef.current.sync) textRef.current.sync();
      }
    }
  };

  // 4. Pointer Up (Sync back to Store and DB)
  const handlePointerUp = (e: any) => {
    if (!transformState.current.isDragging && !transformState.current.isResizing) return;
    
    e.stopPropagation();
    const finalPos = groupRef.current!.position;
    const finalScale = groupRef.current!.scale;

    updateObject(id, {
      position: { x: finalPos.x, y: finalPos.y, z: finalPos.z },
      scale: { x: finalScale.x, y: finalScale.y, z: finalScale.z }
    });
    // Final sync to DB
    useStore.getState().persistObject(id);

    transformState.current.isDragging = false;
    transformState.current.isResizing = false;
    transformState.current.handleIdx = -1;
    setIsDragging(false);
    e.target.releasePointerCapture(e.pointerId);
  };

  const handlePointerEnter = () => { 
    if (!transformState.current.isResizing) document.body.style.cursor = 'grab'; 
  };
  const handlePointerLeave = () => { 
    if (!transformState.current.isDragging && !transformState.current.isResizing) document.body.style.cursor = 'auto'; 
  };

  // Geometry calculation
  const geometry = useMemo(() => {
    const isCircle = (object.style as any).shapeType === 'circle';
    if (isCircle) return new THREE.CircleGeometry(1, 32);
    const isTriangle = (object.style as any).shapeType === 'triangle';
    if (isTriangle) {
      const shape = new THREE.Shape();
      const h = Math.sqrt(3);
      shape.moveTo(0, h * 2/3); shape.lineTo(-1, -h / 3); shape.lineTo(1, -h / 3); shape.closePath();
      return new THREE.ShapeGeometry(shape);
    }
    const isStar = (object.style as any).shapeType === 'star';
    if (isStar) {
      const shape = new THREE.Shape();
      for (let i = 0; i < 10; i++) {
        const angle = (i / 10) * Math.PI * 2 + Math.PI / 2;
        const r = i % 2 === 0 ? 1 : 0.45;
        if (i === 0) shape.moveTo(Math.cos(angle) * r, Math.sin(angle) * r);
        else shape.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
      }
      shape.closePath();
      return new THREE.ShapeGeometry(shape);
    }
    const hex = (object.style as any).shapeType === 'hexagon';
    if (hex) {
       const shape = new THREE.Shape();
       for (let i = 0; i < 6; i++) {
         const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
         if (i === 0) shape.moveTo(Math.cos(a), Math.sin(a));
         else shape.lineTo(Math.cos(a), Math.sin(a));
       }
       shape.closePath(); return new THREE.ShapeGeometry(shape);
    }
    return new THREE.PlaneGeometry(2, 2);
  }, [(object.style as any).shapeType]);

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newId = crypto.randomUUID();
    const offsetX = object.scale.x * 0.5; // Width S = 2 * scale.x, so S/4 = 0.5 * scale.x
    const offsetY = object.scale.y * 0.5;

    const newObject: WorldObject = { 
      ...object, 
      id: newId, 
      position: { x: object.position.x + offsetX, y: object.position.y - offsetY, z: object.position.z }, 
      createdAt: Date.now(), 
      updatedAt: Date.now() 
    };
    addObject(newObject);
    setSelectedObjectIds([newId]);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeObject(id);
    setSelectedObjectIds([]);
  };

  return (
    <group
      ref={groupRef}
      position={[object.position.x, object.position.y, object.position.z]}
      rotation={[object.rotation.x, object.rotation.y, object.rotation.z]}
      scale={[object.scale.x, object.scale.y, object.scale.z]}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* 1. Body Mesh (DRAG TARGET) */}
      <mesh 
        onPointerDown={handleMoveStart}
        onDoubleClick={handleDoubleClick}
        onPointerEnter={() => {
          if (object.isPickable !== false && !object.isLocked) handlePointerEnter();
        }}
        onPointerLeave={handlePointerLeave}
        visible={!isEditing}
      >
        <primitive object={geometry} attach="geometry" />
        <meshStandardMaterial color={object.style.fillColor || '#ffffff'} transparent opacity={object.style.opacity ?? 1} side={THREE.DoubleSide} />
      </mesh>

      {/* 2. Bounding Box & Handles */}
      {isSelected && !object.isBBoxHidden && (
        <group position={[0, 0, 0.01]}>
          <lineSegments>
            <edgesGeometry args={[new THREE.PlaneGeometry(2, 2.02)]} />
            <lineBasicMaterial color="#c5a059" linewidth={1} />
          </lineSegments>
          
          {/* Handles (Flat 2D Plane) */}
          <group ref={handlesRef}>
            {[
              [1, 1], [-1, 1], [1, -1], [-1, -1],
              [0, 1], [0, -1], [1, 0], [-1, 0]
            ].map(([hx, hy], i) => (
              <mesh 
                key={i} 
                position={[hx, hy, 0.01]}
                scale={[0.12 / object.scale.x, 0.12 / object.scale.y, 1]}
                visible={transformState.current.handleIdx === -1 || transformState.current.handleIdx === i}
                onPointerDown={(e) => handleResizeStart(e, hx, hy, i)}
                onPointerEnter={(e) => {
                  e.stopPropagation();
                  if (hx === 0) document.body.style.cursor = 'ns-resize';
                  else if (hy === 0) document.body.style.cursor = 'ew-resize';
                  else if (hx === hy) document.body.style.cursor = 'nesw-resize';
                  else document.body.style.cursor = 'nwse-resize';
                }}
                onPointerLeave={(e) => {
                  e.stopPropagation();
                  if (!transformState.current.isDragging) document.body.style.cursor = 'auto';
                }}
              >
                <planeGeometry args={[1, 1]} />
                <meshBasicMaterial color="#ffffff" />
                <lineSegments position={[0, 0, 0.01]}>
                  <edgesGeometry args={[new THREE.PlaneGeometry(1, 1)]} />
                  <lineBasicMaterial color="#c5a059" />
                </lineSegments>
              </mesh>
            ))}
          </group>
        </group>
      )}

      {/* 2.5 Text Display (Only when NOT editing) */}
      {!isEditing && object.content && (
        <group ref={textGroupRef} scale={[1 / object.scale.x, 1 / object.scale.y, 1]}>
          <Text
            ref={textRef}
            position={[0, 0, 0.02]}
            fontSize={object.style.fontSize || 0.2}
            color={object.style.textColor || "#333333"}
            anchorX={(object.style.textAlign as any) || "center"}
            anchorY="middle"
            maxWidth={object.scale.x * 1.8} 
            overflowWrap="break-word"
            font={object.style.fontFamily}
          >
            {object.content}
          </Text>
        </group>
      )}

      {/* 2.6 Inline Editing UI */}
      {isEditing && (
        <group ref={textGroupRef} scale={[1 / object.scale.x, 1 / object.scale.y, 1]}>
          <Html center distanceFactor={20} position={[0, 0, 0.1]}>
            <textarea
              autoFocus
              className="bg-white/90 backdrop-blur-sm border-2 border-[var(--weave-gold)] rounded p-2 outline-none shadow-xl text-center resize-none overflow-hidden"
              style={{
                width: `${object.scale.x * 200}px`,
                height: `${object.scale.y * 200}px`,
                fontSize: `${(object.style.fontSize || 0.2) * 40}px`,
                color: object.style.textColor || "#333333",
                fontFamily: object.style.fontFamily || "inherit",
              }}
              defaultValue={object.content || ""}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  e.currentTarget.blur();
                }
                if (e.key === 'Escape') {
                  e.currentTarget.blur();
                }
              }}
              onBlur={(e) => {
                const newContent = e.target.value;
                updateObject(id, { content: newContent });
                useStore.getState().persistObject(id);
                setEditingObjectId(null);
              }}
            />
          </Html>
        </group>
      )}

      {/* 3. Floating Toolbar */}
      {isSelected && (
        <Html 
          center 
          distanceFactor={20} 
          position={[0, 1 + 0.3 / object.scale.y, 0.2]} 
        >
           <div className="flex items-center gap-1 bg-white/90 backdrop-blur-md shadow-lg border border-[var(--weave-muted)]/30 rounded-lg p-1 animate-in fade-in zoom-in-95 duration-200 pointer-events-auto whitespace-nowrap">
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
              <button className="p-1.5 hover:bg-[var(--weave-gold)]/10 rounded-md text-[var(--weave-accent)] opacity-70 hover:opacity-100 transition-colors">
                <MoreHorizontal className="w-4 h-4" />
              </button>
           </div>
        </Html>
      )}

      {/* Sticky Shadow */}
      {object.type === 'sticky' && !isSelected && (
        <mesh position={[0.05, -0.05, -0.01]}>
          <planeGeometry args={[2.05, 2.05]} />
          <meshBasicMaterial color="black" transparent opacity={0.1} />
        </mesh>
      )}
    </group>
  );
}

export function WorldObjects() {
  const objectIds = useStore(useShallow((state) => Object.keys(state.objects)));
  const loadFromDB = useStore((state) => state.loadFromDB);

  useEffect(() => {
    loadFromDB();
  }, [loadFromDB]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        useStore.getState().setSelectedObjectIds([]);
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const selectedIds = useStore.getState().selectedObjectIds;
        if (selectedIds.length > 0) {
          if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
          selectedIds.forEach(id => useStore.getState().removeObject(id));
          useStore.getState().setSelectedObjectIds([]);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      {objectIds.map((id) => (
        <WorldObjectRenderer key={id} id={id} />
      ))}
    </>
  )
}
