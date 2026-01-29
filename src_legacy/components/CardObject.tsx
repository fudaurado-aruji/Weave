import { useRef } from 'react'
import * as THREE from 'three/webgpu'
import { useTexture } from '@react-three/drei'
import { useStore } from '../store/useStore'

export function CardObject({ id }: { id: string }) {
  const object = useStore((state) => state.objects[id]);
  if (!object) return null;

  const groupRef = useRef<THREE.Group>(null);
  const isSelected = useStore((state) => state.selectedObjectIds.includes(id));
  const updateObject = useStore((state) => state.updateObject);
  const setIsDragging = useStore((state) => state.setIsDragging);

  const frontTexture = useTexture(object.style.frontImage || '/assets/cards/tarot/RWS_0_00.webp');
  const backTexture = useTexture(object.style.backImage || '/assets/cards/tarot_back.png');

  // Interaction State
  const transformState = useRef({
    isDragging: false,
    offset: new THREE.Vector3(),
    initialPos: new THREE.Vector3(),
  });

  const handleMoveStart = (e: any) => {
    if (useStore.getState().interactionMode !== 'select') return;
    e.stopPropagation();

    if (!isSelected) {
       useStore.getState().setSelectedObjectIds([id]);
    }

    transformState.current.isDragging = true;
    setIsDragging(true);

    const intersection = e.point;
    transformState.current.offset.copy(intersection).sub(groupRef.current!.position);
    transformState.current.initialPos.copy(groupRef.current!.position);
    
    e.target.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: any) => {
    if (!transformState.current.isDragging) return;
    e.stopPropagation();

    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -transformState.current.initialPos.z);
    const mousePos = new THREE.Vector3();
    e.ray.intersectPlane(plane, mousePos);
    if (!mousePos) return;

    const newPos = mousePos.sub(transformState.current.offset);
    groupRef.current!.position.set(newPos.x, newPos.y, newPos.z);
  };

  const handlePointerUp = (e: any) => {
    if (!transformState.current.isDragging) return;
    e.stopPropagation();

    const finalPos = groupRef.current!.position;
    updateObject(id, {
      position: { x: finalPos.x, y: finalPos.y, z: finalPos.z }
    });
    useStore.getState().persistObject(id);

    transformState.current.isDragging = false;
    setIsDragging(false);
    e.target.releasePointerCapture(e.pointerId);
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
      {/* Front Side */}
      <mesh onPointerDown={handleMoveStart} position={[0, 0, 0.01]}>
        <planeGeometry args={[1, 1.6]} />
        <meshBasicMaterial map={frontTexture} side={THREE.FrontSide} />
      </mesh>

      {/* Back Side */}
      <mesh onPointerDown={handleMoveStart} position={[0, 0, -0.01]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[1, 1.6]} />
        <meshBasicMaterial map={backTexture} side={THREE.FrontSide} />
      </mesh>

      {/* Card Body (Thickness) */}
      <mesh onPointerDown={handleMoveStart}>
        <boxGeometry args={[1, 1.6, 0.015]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* Selection Highlight */}
      {isSelected && (
        <lineSegments position={[0, 0, 0.02]}>
          <edgesGeometry args={[new THREE.BoxGeometry(1.05, 1.65, 0.03)]} />
          <lineBasicMaterial color="#c5a059" linewidth={2} />
        </lineSegments>
      )}
    </group>
  )
}
