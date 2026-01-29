import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, MapControls } from '@react-three/drei'
import * as THREE from 'three/webgpu'
import { useStore } from '../store/useStore'

export function CameraController() {
  const mode = useStore((state) => state.mode)
  const zoom = useStore((state) => state.zoom)
  const cameraResetTick = useStore((state) => state.cameraResetTick)
  const { camera } = useThree()
  
  // Controls refs for smooth switching
  const orbitRef = useRef<any>(null)
  const mapRef = useRef<any>(null)

  useEffect(() => {
    if (mode === '2D' || mode === '2.5D') {
      // Force hard reset when switching back to plane modes or triggered by button
      if (orbitRef.current) orbitRef.current.reset()
      if (mapRef.current) mapRef.current.reset()
      
      // Ensure camera up is reset to align with the grid
      camera.up.set(0, 1, 0)
    } else if (mode === '3D') {
      // Also reset 3D orbit if specifically triggered
      if (orbitRef.current) orbitRef.current.reset()
    }
  }, [mode, camera, cameraResetTick])

  useFrame(() => {
    const targetZ = 1000 / zoom
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.1)
    
    if (mode === '2D' || mode === '2.5D') {
      const targetRotationX = mode === '2D' ? 0 : -Math.PI / 4
      
      // Interpolate rotation for smooth landing
      camera.rotation.x = THREE.MathUtils.lerp(camera.rotation.x, targetRotationX, 0.1)
      camera.rotation.y = THREE.MathUtils.lerp(camera.rotation.y, 0, 0.1)
      camera.rotation.z = THREE.MathUtils.lerp(camera.rotation.z, 0, 0.1)

      // Keep target under the camera
      const targetPos = new THREE.Vector3(camera.position.x, camera.position.y, 0)
      if (orbitRef.current) {
        orbitRef.current.target.lerp(targetPos, 0.2)
        orbitRef.current.update()
      }
      if (mapRef.current) {
        mapRef.current.target.lerp(targetPos, 0.2)
        mapRef.current.update()
      }
    }
  })

  return (
    <>
      {mode === '2D' && (
        <MapControls 
          ref={mapRef}
          enableRotate={false} 
          screenSpacePanning={true}
          makeDefault
        />
      )}
      {mode === '2.5D' && (
        <MapControls 
          ref={mapRef}
          enableRotate={true}
          screenSpacePanning={true}
          makeDefault
        />
      )}
      {mode === '3D' && (
        <OrbitControls 
          ref={orbitRef}
          makeDefault
        />
      )}
    </>
  )
}
