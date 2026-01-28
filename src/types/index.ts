export type ObjectType = 'shape' | 'text' | 'sticky' | 'connector';

export type ShapeType =
  | 'rectangle'
  | 'circle'
  | 'triangle'
  | 'diamond'
  | 'hexagon'
  | 'star';

export interface Vector3Obj {
  x: number;
  y: number;
  z: number;
}

export interface ObjectStyle {
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  opacity?: number;
  borderRadius?: number;
  fontSize?: number;
  textColor?: string;
  fontFamily?: string;
  textAlign?: 'left' | 'center' | 'right';
}

export interface WorldObject {
  id: string;
  type: ObjectType;
  position: Vector3Obj;
  rotation: Vector3Obj;
  scale: Vector3Obj;
  style: ObjectStyle;
  content?: string;
  parentId?: string;
  isLocked?: boolean;     // Position and size lock
  isPickable?: boolean;   // Click/Selection detection
  isBBoxHidden?: boolean; // Hide selection border and handles
  createdAt: number;
  updatedAt: number;
}

export interface ViewState {
  cameraPosition: Vector3Obj;
  selectedObjectIds: string[];
}

export type SidebarTabId =
  | 'pages'
  | 'elements'
  | 'layouts'
  | 'design'
  | 'settings';
