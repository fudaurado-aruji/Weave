import { useRef, useState, useEffect } from 'react'
import * as THREE from 'three/webgpu'
import { Text, Float } from '@react-three/drei'
import { useStore } from '../store/useStore'

export function ClockObject({ id }: { id: string }) {
  const object = useStore((state) => state.objects[id]);
  if (!object) return null;

  const [time, setTime] = useState(new Date());
  const groupRef = useRef<THREE.Group>(null);
  const isSelected = useStore((state) => state.selectedObjectIds.includes(id));
  const updateObject = useStore((state) => state.updateObject);
  const setIsDragging = useStore((state) => state.setIsDragging);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeString = time.toLocaleTimeString('ja-JP', { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit',
    hour12: false 
  });

  const dateString = time.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short'
  });

  // Interaction (keeping it consistent with other objects)
  const transformState = useRef({
    isDragging: false,
    offset: new THREE.Vector3(),
    initialPos: new THREE.Vector3(),
  });

  const handleMoveStart = (e: any) => {
    if (useStore.getState().interactionMode !== 'select') return;
    e.stopPropagation();
    if (!isSelected) useStore.getState().setSelectedObjectIds([id]);
    transformState.current.isDragging = true;
    setIsDragging(true);
    transformState.current.offset.copy(e.point).sub(groupRef.current!.position);
    transformState.current.initialPos.copy(groupRef.current!.position);
    e.target.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: any) => {
    if (!transformState.current.isDragging) return;
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -transformState.current.initialPos.z);
    const mousePos = new THREE.Vector3();
    e.ray.intersectPlane(plane, mousePos);
    if (mousePos) {
      const newPos = mousePos.sub(transformState.current.offset);
      groupRef.current!.position.set(newPos.x, newPos.y, newPos.z);
    }
  };

  const handlePointerUp = (e: any) => {
    if (!transformState.current.isDragging) return;
    updateObject(id, { position: groupRef.current!.position.clone() });
    useStore.getState().persistObject(id);
    transformState.current.isDragging = false;
    setIsDragging(false);
    e.target.releasePointerCapture(e.pointerId);
  };

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
      <group
        ref={groupRef}
        position={[object.position.x, object.position.y, object.position.z]}
        rotation={[object.rotation.x, object.rotation.y, object.rotation.z]}
        onPointerDown={handleMoveStart}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* Cyber Panel */}
        <mesh>
          <planeGeometry args={[3, 1.5]} />
          <meshPhysicalMaterial 
            color="#000000"
            metalness={0.9}
            roughness={0.1}
            transmission={0.5}
            thickness={2}
            transparent
            opacity={0.8}
          />
        </mesh>
        
        {/* Decorative Borders */}
        <lineSegments>
          <edgesGeometry args={[new THREE.PlaneGeometry(3, 1.5)]} />
          <lineBasicMaterial color="#00f2ff" linewidth={2} />
        </lineSegments>

        {/* Time Text */}
        <Text
          position={[0, 0.1, 0.05]}
          fontSize={0.5}
          color="#00f2ff"
          anchorX="center"
          anchorY="middle"
        >
          {timeString}
          <meshStandardMaterial emissive="#00f2ff" emissiveIntensity={2} />
        </Text>

        {/* Date Text */}
        <Text
          position={[0, -0.4, 0.05]}
          fontSize={0.15}
          color="#00f2ff"
          fillOpacity={0.6}
          anchorX="center"
          anchorY="middle"
        >
          {dateString}
        </Text>

        {/* Scanline Effect (Simulation) */}
        <mesh position={[0, 0, 0.02]}>
          <planeGeometry args={[3, 1.5]} />
          <meshBasicMaterial 
            transparent 
            opacity={0.05} 
            color="#00f2ff"
            wireframe
          />
        </mesh>

        {/* Selection Highlight */}
        {isSelected && (
          <mesh position={[0, 0, -0.05]}>
            <planeGeometry args={[3.2, 1.7]} />
            <meshBasicMaterial color="#c5a059" wireframe />
          </mesh>
        )}
      </group>
    </Float>
  )
}
