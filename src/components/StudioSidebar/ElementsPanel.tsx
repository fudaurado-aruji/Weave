import { Square, Circle, Triangle, Diamond, Hexagon, Star, X } from "lucide-react";
import { useStore } from "../../store/useStore";
import type { WorldObject, ShapeType } from "../../types";

interface ElementsPanelProps {
  onClose: () => void;
}

const SHAPES: { type: ShapeType; icon: any; label: string }[] = [
  { type: 'rectangle', icon: Square, label: 'Rectangle' },
  { type: 'circle', icon: Circle, label: 'Circle' },
  { type: 'triangle', icon: Triangle, label: 'Triangle' },
  { type: 'diamond', icon: Diamond, label: 'Diamond' },
  { type: 'hexagon', icon: Hexagon, label: 'Hexagon' },
  { type: 'star', icon: Star, label: 'Star' },
];

export const ElementsPanel = ({ onClose }: ElementsPanelProps) => {
  const addObject = useStore((state) => state.addObject);
  const objects = useStore((state) => state.objects);

  const handleAddShape = (shapeType: ShapeType) => {
    // 既存オブジェクトの数に基づいて位置をずらす (X+2, Y-2 ずつ)
    const count = Object.keys(objects).length;
    const offset = count * 2;
    
    const id = crypto.randomUUID();
    const newObject: WorldObject = {
      id,
      type: 'shape',
      position: { x: offset % 20, y: -(offset % 20), z: 0 }, // 周期的に戻るように
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      style: {
        fillColor: '#ffffff',
        strokeColor: '#cad1da',
        strokeWidth: 2,
        opacity: 1,
        shapeType: shapeType,
      } as any,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    addObject(newObject);
  };

  return (
    <div className="absolute top-0 left-[80px] bottom-0 w-[300px] bg-white/95 backdrop-blur-3xl border-r border-[var(--weave-muted)]/30 z-40 flex flex-col shadow-2xl animate-in slide-in-from-left-4 duration-300 weave-washi-texture">
      <div className="p-6 flex items-center justify-between border-b border-[var(--weave-muted)]/10">
        <h2 className="text-[12px] font-black tracking-[0.3em] uppercase text-[var(--weave-gold)]">Elements</h2>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-black/5 rounded-lg transition-colors text-[var(--weave-accent)] opacity-40 hover:opacity-100"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 no-scrollbar flex flex-col gap-8">
        {/* Shapes Section */}
        <section>
          <h3 className="text-[9px] font-black tracking-[0.2em] uppercase opacity-30 mb-4 border-l-2 border-[var(--weave-gold)] pl-3">Shapes</h3>
          <div className="grid grid-cols-3 gap-3">
            {SHAPES.map((shape) => {
              const Icon = shape.icon;
              return (
                <button
                  key={shape.type}
                  onClick={() => handleAddShape(shape.type)}
                  className="aspect-square bg-[var(--weave-bg-light)] border border-[var(--weave-muted)]/20 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-[var(--weave-gold)]/50 hover:bg-white transition-all group suiren-shadow active:scale-95"
                  title={shape.label}
                >
                  <Icon className="w-6 h-6 text-[var(--weave-accent)] opacity-40 group-hover:opacity-100 group-hover:text-[var(--weave-gold)] transition-all" />
                  <span className="text-[7px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                    {shape.type.slice(0, 3)}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Text Section (Placeholder) */}
        <section>
          <h3 className="text-[9px] font-black tracking-[0.2em] uppercase opacity-30 mb-4 border-l-2 border-[var(--weave-gold)] pl-3">Text</h3>
          <button className="w-full py-4 bg-[var(--weave-gold)]/5 border border-dashed border-[var(--weave-gold)]/30 rounded-xl text-[10px] font-black tracking-widest uppercase text-[var(--weave-gold)] hover:bg-[var(--weave-gold)]/10 transition-all active:scale-[0.98]">
            Add Text Box
          </button>
        </section>
      </div>

      <div className="p-4 border-t border-[var(--weave-muted)]/10 bg-black/5">
         <p className="text-[8px] font-black uppercase tracking-[0.2em] opacity-20 text-center">Weave Elements Center</p>
      </div>
    </div>
  );
};
