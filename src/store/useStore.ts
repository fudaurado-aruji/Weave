import { create } from 'zustand'

export type ViewMode = '2D' | '2.5D' | '3D'

interface ViewState {
  mode: ViewMode
  setMode: (mode: ViewMode) => void
  
  zoom: number
  setZoom: (zoom: number) => void
  
  pan: { x: number, y: number }
  setPan: (x: number, y: number) => void

  cameraResetTick: number
  triggerCameraReset: () => void
}

export const useStore = create<ViewState>((set) => ({
  mode: '2D',
  setMode: (mode) => set({ mode }),
  
  zoom: 100,
  setZoom: (zoom) => set({ zoom }),
  
  pan: { x: 0, y: 0 },
  setPan: (x, y) => set({ pan: { x, y } }),

  cameraResetTick: 0,
  triggerCameraReset: () => set((state) => ({ cameraResetTick: state.cameraResetTick + 1 })),
}))
