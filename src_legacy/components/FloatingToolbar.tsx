import { 
  Copy, 
  Trash2, 
  MoreHorizontal, 
  Square, 
  Circle, 
  Triangle, 
  Diamond, 
  Hexagon, 
  Star,
  Palette,
  Minus,
  Plus,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ChevronDown,
  Unlock,
  Lock,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import { useStore } from "../store/useStore";
import type { ShapeType, WorldObject } from "../types";
import { useState } from "react";

interface FloatingToolbarProps {
  object: WorldObject;
}

const SHAPE_ICONS: Record<ShapeType, any> = {
  rectangle: Square,
  circle: Circle,
  triangle: Triangle,
  diamond: Diamond,
  hexagon: Hexagon,
  star: Star,
};

const COLORS = [
  '#ffffff', '#f8fafc', '#f1f5f9', '#e2e8f0', // Whites/Grays
  '#fee2e2', '#fef3c7', '#ecfccb', '#d1fae5', // Pastels
  '#ef4444', '#f59e0b', '#10b981', '#3b82f6', // Standards
  '#6366f1', '#a855f7', '#ec4899', '#1e293b', // Deep
];

export const FloatingToolbar = ({ object }: FloatingToolbarProps) => {
  const updateObject = useStore((state) => state.updateObject);
  const removeObject = useStore((state) => state.removeObject);
  const addObject = useStore((state) => state.addObject);
  const setSelectedObjectIds = useStore((state) => state.setSelectedObjectIds);
  
  const [showColorPicker, setShowColorPicker] = useState<'fill' | 'stroke' | null>(null);
  const [showShapePicker, setShowShapePicker] = useState(false);

  const handleUpdateStyle = (updates: any) => {
    updateObject(object.id, { 
      style: { ...object.style, ...updates } 
    });
  };

  const handleDuplicate = () => {
    const newId = crypto.randomUUID();
    const offsetX = object.scale.x * 0.5;
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

  const handleReorder = (direction: 'front' | 'back') => {
    const objects = useStore.getState().objects;
    const zValues = Object.values(objects).map(obj => obj.position.z);
    const minZ = Math.min(...zValues, 0);
    const maxZ = Math.max(...zValues, 0);

    if (direction === 'front') {
      updateObject(object.id, { position: { ...object.position, z: maxZ + 0.1 } });
    } else {
      updateObject(object.id, { position: { ...object.position, z: minZ - 0.1 } });
    }
  };

  const ShapeIcon = SHAPE_ICONS[object.style.shapeType || 'rectangle'] || Square;

  return (
    <div 
      className="flex flex-col gap-2 items-center pointer-events-auto"
      onPointerDown={(e) => e.stopPropagation()}
      onPointerUp={(e) => e.stopPropagation()}
      onWheel={(e) => e.stopPropagation()}
    >
      {/* Popovers */}
      {showColorPicker && (
        <div className="bg-white/95 backdrop-blur-xl border border-[var(--weave-muted)]/30 rounded-xl shadow-2xl p-3 grid grid-cols-4 gap-1.5 animate-in fade-in zoom-in-95 duration-200">
          {COLORS.map((color) => (
            <button
              key={color}
              onClick={() => {
                handleUpdateStyle(showColorPicker === 'fill' ? { fillColor: color } : { strokeColor: color });
                setShowColorPicker(null);
              }}
              className="w-6 h-6 rounded-md border border-black/5 hover:scale-110 transition-transform shadow-sm"
              style={{ backgroundColor: color }}
            />
          ))}
          <button 
             onClick={() => {
                handleUpdateStyle(showColorPicker === 'fill' ? { fillColor: 'transparent' } : { strokeColor: 'transparent' });
                setShowColorPicker(null);
             }}
             className="col-span-4 mt-1 text-[9px] font-black tracking-widest uppercase py-1 hover:bg-black/5 rounded"
          >
            Transparent
          </button>
        </div>
      )}

      {showShapePicker && (
        <div className="absolute top-full left-0 mt-2 bg-white/95 backdrop-blur-xl border border-[var(--weave-muted)]/30 rounded-2xl shadow-2xl p-3 grid grid-cols-3 gap-2 animate-in fade-in slide-in-from-top-2 duration-200 z-[60]">
          {(Object.entries(SHAPE_ICONS) as [ShapeType, any][]).map(([type, Icon]) => (
            <button
              key={type}
              onClick={(e) => {
                e.stopPropagation();
                handleUpdateStyle({ shapeType: type });
                setShowShapePicker(false);
              }}
              className={`p-3 rounded-xl transition-all flex items-center justify-center ${object.style.shapeType === type ? 'bg-[var(--weave-gold)] text-white shadow-lg' : 'hover:bg-black/5 text-[var(--weave-accent)] opacity-60 hover:opacity-100'}`}
              title={type}
            >
              <Icon className="w-5 h-5" />
            </button>
          ))}
        </div>
      )}

      {/* Main Bar */}
      <div className="flex items-center gap-1 bg-white/90 backdrop-blur-xl shadow-2xl border border-[var(--weave-muted)]/30 rounded-2xl p-1.5 animate-in fade-in zoom-in-95 duration-300 select-none relative">
        
        {/* Shape Transform */}
        <button 
          onClick={(e) => { e.stopPropagation(); setShowShapePicker(!showShapePicker); }}
          className="p-1.5 hover:bg-black/5 rounded-xl flex items-center gap-1 transition-all group"
        >
          <ShapeIcon className="w-4 h-4 text-[var(--weave-gold)]" />
          <ChevronDown className={`w-3 h-3 opacity-30 group-hover:opacity-100 transition-all ${showShapePicker ? 'rotate-180' : ''}`} />
        </button>

        <div className="w-px h-5 bg-[var(--weave-muted)]/20 mx-1" />

        {/* Color Buttons */}
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setShowColorPicker(showColorPicker === 'fill' ? null : 'fill')}
            className="w-7 h-7 rounded-lg border-2 border-white shadow-sm hover:scale-110 transition-transform flex items-center justify-center relative group"
            style={{ backgroundColor: object.style.fillColor || '#ffffff' }}
          >
             <Palette className={`w-3 h-3 mix-blend-difference invert opacity-0 group-hover:opacity-50 transition-opacity`} />
          </button>
          <button 
            onClick={() => setShowColorPicker(showColorPicker === 'stroke' ? null : 'stroke')}
            className="w-7 h-7 rounded-lg border-2 border-white shadow-sm hover:scale-110 transition-transform flex items-center justify-center relative group overflow-hidden"
          >
             <div className="absolute inset-0 border-[3px]" style={{ borderColor: object.style.strokeColor || '#cad1da' }} />
             <div className="absolute inset-[3px] bg-white opacity-50" />
             <Palette className={`w-3 h-3 mix-blend-difference invert opacity-0 group-hover:opacity-50 transition-opacity z-10`} />
          </button>
        </div>

        <div className="w-px h-5 bg-[var(--weave-muted)]/20 mx-1" />

        {/* Opacity */}
        <div className="flex flex-col gap-0.5 px-2 min-w-[60px]">
           <div className="flex justify-between items-center text-[7px] font-black uppercase tracking-tighter opacity-30">
              <span>Opac</span>
              <span>{Math.round((object.style.opacity ?? 1) * 100)}%</span>
           </div>
           <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.1" 
              value={object.style.opacity ?? 1}
              onChange={(e) => handleUpdateStyle({ opacity: parseFloat(e.target.value) })}
              className="w-full h-1 bg-[var(--weave-muted)]/20 rounded-full appearance-none cursor-pointer accent-[var(--weave-gold)]"
           />
        </div>

        <div className="w-px h-5 bg-[var(--weave-muted)]/20 mx-1" />

        {/* Stroke Weight */}
        <div className="flex items-center gap-0.5 px-2 font-['Outfit'] border-x border-[var(--weave-muted)]/20 mx-1">
          <div className="flex flex-col items-center mr-1">
             <span className="text-[7px] font-black uppercase tracking-tighter opacity-30">Border</span>
             <span className="text-[10px] font-mono font-black">{object.style.strokeWidth ?? 2}</span>
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); handleUpdateStyle({ strokeWidth: Math.max(0, (object.style.strokeWidth || 2) - 1) }); }}
            className="p-1 hover:bg-black/5 rounded-md opacity-40 hover:opacity-100"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); handleUpdateStyle({ strokeWidth: (object.style.strokeWidth || 2) + 1 }); }}
            className="p-1 hover:bg-black/5 rounded-md opacity-40 hover:opacity-100"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="w-px h-5 bg-[var(--weave-muted)]/20 mx-1" />

        {/* Text Options (If text/sticky) */}
        <div className="flex items-center gap-1">
           <button 
             onClick={(e) => { e.stopPropagation(); handleUpdateStyle({ textAlign: 'left' }); }}
             className={`p-1.5 rounded-lg transition-all ${object.style.textAlign === 'left' ? 'text-[var(--weave-gold)] bg-[var(--weave-gold)]/10' : 'opacity-40 hover:opacity-100'}`}
             title="Align Left"
           >
             <AlignLeft className="w-3.5 h-3.5" />
           </button>
           <button 
             onClick={(e) => { e.stopPropagation(); handleUpdateStyle({ textAlign: 'center' }); }}
             className={`p-1.5 rounded-lg transition-all ${(!object.style.textAlign || object.style.textAlign === 'center') ? 'text-[var(--weave-gold)] bg-[var(--weave-gold)]/10' : 'opacity-40 hover:opacity-100'}`}
             title="Align Center"
           >
             <AlignCenter className="w-3.5 h-3.5" />
           </button>
           <button 
             onClick={(e) => { e.stopPropagation(); handleUpdateStyle({ textAlign: 'right' }); }}
             className={`p-1.5 rounded-lg transition-all ${object.style.textAlign === 'right' ? 'text-[var(--weave-gold)] bg-[var(--weave-gold)]/10' : 'opacity-40 hover:opacity-100'}`}
             title="Align Right"
           >
             <AlignRight className="w-3.5 h-3.5" />
           </button>
        </div>

        <div className="w-px h-5 bg-[var(--weave-muted)]/20 mx-1" />

        {/* Reorder */}
        <div className="flex items-center gap-0.5">
           <button 
             onClick={() => handleReorder('front')}
             className="p-1.5 hover:bg-black/5 rounded-lg opacity-40 hover:opacity-100 transition-all"
             title="Bring to Front"
           >
             <ArrowUp className="w-3.5 h-3.5" />
           </button>
           <button 
             onClick={() => handleReorder('back')}
             className="p-1.5 hover:bg-black/5 rounded-lg opacity-40 hover:opacity-100 transition-all"
             title="Send to Back"
           >
             <ArrowDown className="w-3.5 h-3.5" />
           </button>
        </div>

        <div className="w-px h-5 bg-[var(--weave-muted)]/20 mx-1" />

        {/* Core Actions */}
        <div className="flex items-center gap-0.5">
          <button 
            onClick={() => updateObject(object.id, { isLocked: !object.isLocked })}
            className={`p-1.5 rounded-lg transition-all ${object.isLocked ? 'text-red-500 bg-red-50' : 'opacity-40 hover:opacity-100'}`}
          >
            {object.isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
          </button>
          <button 
            onClick={handleDuplicate}
            className="p-1.5 hover:bg-black/5 rounded-lg opacity-40 hover:opacity-100 transition-all"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button 
            onClick={() => {
              removeObject(object.id);
              setSelectedObjectIds([]);
            }}
            className="p-1.5 hover:bg-red-50 hover:text-red-500 rounded-lg opacity-40 hover:opacity-100 transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <div className="w-px h-5 bg-[var(--weave-muted)]/20 mx-1" />

        <button className="p-1.5 hover:bg-black/5 rounded-lg opacity-40 hover:opacity-100">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
