import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { WorldObject } from '../types';
import { db } from '../db/schema';

interface WeaveState {
  objects: Record<string, WorldObject>;
  selectedObjectIds: string[];
  isDragging: boolean;
  editingObjectId: string | null;
  interactionMode: 'select' | 'pan';
  zoom: number;
  isInteracting: boolean;
  currentLayer: 1 | 2 | 3;
  
  // Actions
  setObjects: (objects: WorldObject[]) => void;
  addObject: (object: WorldObject) => void;
  updateObject: (id: string, updates: Partial<WorldObject>) => void;
  persistObject: (id: string) => Promise<void>;
  removeObject: (id: string) => void;
  setSelectedObjectIds: (ids: string[]) => void;
  setEditingObjectId: (id: string | null) => void;
  setIsDragging: (isDragging: boolean) => void;
  setInteractionMode: (mode: 'select' | 'pan') => void;
  setZoom: (zoom: number) => void;
  setIsInteracting: (isInteracting: boolean) => void;
  setCurrentLayer: (layer: 1 | 2 | 3) => void;
  
  // Sync
  loadFromDB: () => Promise<void>;
}

export const useStore = create<WeaveState>()(
  immer((set, get) => ({
    objects: {},
    selectedObjectIds: [],
    isDragging: false,
    editingObjectId: null,
    interactionMode: 'select',
    zoom: 100, // Zoom percentage (100 = 100%)
    isInteracting: false,
    currentLayer: 1,

    setObjects: (objects) => {
      set((state) => {
        state.objects = objects.reduce((acc, obj) => {
          acc[obj.id] = { ...obj, layerId: obj.layerId || 1 }; // Default to layer 1 if missing
          return acc;
        }, {} as Record<string, WorldObject>);
      });
    },

    addObject: (object) => {
      set((state) => {
        const layerId = state.currentLayer;
        const newObj = { ...object, layerId: object.layerId || layerId };
        state.objects[object.id] = newObj;
        // Async sync to DB
        db.objects.put(newObj).catch(console.error);
      });
    },

    updateObject: (id, updates) => {
      set((state) => {
        if (state.objects[id]) {
          state.objects[id] = { ...state.objects[id], ...updates, updatedAt: Date.now() };
        }
      });
    },

    persistObject: async (id) => {
      const obj = get().objects[id];
      if (obj) {
        await db.objects.put(obj).catch(console.error);
      }
    },

    removeObject: (id) => {
      set((state) => {
        delete state.objects[id];
      });
      // Async sync to DB
      db.objects.delete(id).catch(console.error);
    },

    setSelectedObjectIds: (ids) => {
      set((state) => {
        state.selectedObjectIds = ids;
      });
    },

    setEditingObjectId: (id) => {
      set((state) => {
        state.editingObjectId = id;
      });
    },

    setIsDragging: (isDragging) => {
      set((state) => {
        state.isDragging = isDragging;
      });
    },

    setInteractionMode: (mode) => {
      set((state) => {
        state.interactionMode = mode;
      });
    },

    setZoom: (zoom) => {
      set((state) => {
        state.zoom = Math.max(10, Math.min(400, zoom));
      });
    },

    setIsInteracting: (isInteracting) => {
      set((state) => {
        state.isInteracting = isInteracting;
      });
    },
    
    setCurrentLayer: (layer) => {
      set((state) => {
        state.currentLayer = layer;
      });
    },

    loadFromDB: async () => {
      const allObjects = await db.objects.toArray();
      get().setObjects(allObjects);
    },
  }))
);
