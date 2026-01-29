import Dexie from 'dexie';
import type { Table } from 'dexie';
import type { WorldObject } from '../types';

export class WeaveDatabase extends Dexie {
  objects!: Table<WorldObject>;

  constructor() {
    super('WeaveDatabase');
    this.version(1).stores({
      objects: 'id, type, parentId, createdAt' // Primary key and indexes
    });
  }
}

export const db = new WeaveDatabase();
