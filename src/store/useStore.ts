import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { WorldObject } from '../types';
import { db } from '../db/schema';

interface WeaveState {
  objects: Record<string, WorldObject>;
  selectedObjectIds: string[];
  
  // Actions
  setObjects: (objects: WorldObject[]) => void;
  addObject: (object: WorldObject) => void;
  updateObject: (id: string, updates: Partial<WorldObject>) => void;
  removeObject: (id: string) => void;
  setSelectedObjectIds: (ids: string[]) => void;
  
  // Sync
  loadFromDB: () => Promise<void>;
}

export const useStore = create<WeaveState>()(
  immer((set, get) => ({
    objects: {},
    selectedObjectIds: [],

    setObjects: (objects) => {
      set((state) => {
        state.objects = objects.reduce((acc, obj) => {
          acc[obj.id] = obj;
          return acc;
        }, {} as Record<string, WorldObject>);
      });
    },

    addObject: (object) => {
      set((state) => {
        state.objects[object.id] = object;
      });
      // Async sync to DB
      db.objects.put(object).catch(console.error);
    },

    updateObject: (id, updates) => {
      set((state) => {
        if (state.objects[id]) {
          const updated = { ...state.objects[id], ...updates, updatedAt: Date.now() };
          state.objects[id] = updated;
          // Async sync to DB
          db.objects.put(updated).catch(console.error);
        }
      });
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

    loadFromDB: async () => {
      const allObjects = await db.objects.toArray();
      get().setObjects(allObjects);
    },
  }))
);
