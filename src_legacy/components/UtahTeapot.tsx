import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three/webgpu'
import { TeapotGeometry } from 'three/examples/jsm/geometries/TeapotGeometry.js'

export function UtahTeapot() {
  const meshRef = useRef<THREE.Mesh>(null)
  
  const geometry = useMemo(() => {
    // TeapotGeometry(size, segments, bottom, lid, body, fitLid, blinn)
    return new TeapotGeometry(0.5, 10)
  }, [])

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.5
      meshRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.3) * 0.2
    }
  })

  return (
    <mesh ref={meshRef} position={[0, 0, 1]} castShadow>
      <primitive object={geometry} attach="geometry" />
      <meshPhysicalMaterial 
        color="#c5a059" 
        metalness={0.8} 
        roughness={0.2} 
        clearcoat={1}
        reflectivity={1}
      />
    </mesh>
  )
}
