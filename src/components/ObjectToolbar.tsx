import { 
  RotateCw, 
  Trash2, 
  Copy, 
  MoreHorizontal,
  ChevronDown,
  Square,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Plus,
  Minus
} from "lucide-react";

import { useStore } from "../store/useStore";

export const ObjectToolbar = () => {
  const selectedObjectIds = useStore((state) => state.selectedObjectIds);
  const removeObject = useStore((state) => state.removeObject);
  const updateObject = useStore((state) => state.updateObject);
  const firstObjectId = selectedObjectIds[0];
  const firstObject = useStore((state) => state.objects[firstObjectId]);

  if (selectedObjectIds.length === 0) return null;

  const handleUpdateStyle = (updates: any) => {
    selectedObjectIds.forEach(id => {
       const obj = useStore.getState().objects[id];
       if (obj) {
         updateObject(id, { style: { ...obj.style, ...updates } });
       }
    });
  };

  const handleDelete = () => {
    selectedObjectIds.forEach((id) => {
      removeObject(id);
    });
    // 削除後に選択解除
    useStore.getState().setSelectedObjectIds([]);
  };

  return (
    <div className="fixed top-4 left-[96px] right-4 h-14 bg-white/90 backdrop-blur-xl border border-[var(--weave-muted)]/30 rounded-2xl shadow-xl z-50 flex items-center px-4 gap-4 weave-washi-texture animate-in fade-in slide-in-from-top-2 duration-300">
      {/* Object Type Selector (Mock) */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--weave-gold)]/10 rounded-lg text-[var(--weave-gold)] transition-all cursor-pointer hover:bg-[var(--weave-gold)]/20">
        <Square className="w-4 h-4" />
        <span className="text-[10px] font-black tracking-widest uppercase">SHAPE</span>
        <ChevronDown className="w-3 h-3 opacity-50" />
      </div>

      <div className="w-px h-6 bg-[var(--weave-muted)]/20" />

      {/* Basic Actions */}
      <div className="flex items-center gap-1">
        <button className="p-2 hover:bg-black/5 rounded-lg text-[var(--weave-accent)] opacity-60 hover:opacity-100 transition-all">
          <Copy className="w-4 h-4" />
        </button>
        <button 
          onClick={handleDelete}
          className="p-2 hover:bg-red-50 rounded-lg text-red-400 opacity-60 hover:opacity-100 transition-all"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="w-px h-6 bg-[var(--weave-muted)]/20" />

      {/* Styling Actions (Mock) */}
      <div className="flex items-center gap-4 flex-1">
        <div className="flex flex-col gap-1 flex-1 max-w-[120px]">
          <div className="flex justify-between items-center px-1">
            <span className="text-[8px] font-black opacity-30 uppercase tracking-widest">Opacity</span>
            <span className="text-[9px] font-mono font-bold">100%</span>
          </div>
          <div className="h-1 w-full bg-[var(--weave-muted)]/20 rounded-full overflow-hidden">
             <div className="h-full w-full bg-[var(--weave-gold)]" />
          </div>
        </div>

        <div className="flex items-center gap-1 bg-black/5 rounded-lg p-1">
          <button className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-md transition-all text-[var(--weave-accent)]">
            <RotateCw className="w-3.5 h-3.5 scale-x-[-1]" />
          </button>
          <span className="text-[10px] font-mono font-bold min-w-[30px] text-center">0°</span>
          <button className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-md transition-all text-[var(--weave-accent)]">
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="w-px h-6 bg-[var(--weave-muted)]/20" />

      {/* Text Settings */}
      <div className="flex items-center gap-1 bg-black/5 rounded-lg p-1">
        <div className="flex items-center gap-0.5 px-2 mr-1">
          <Type className="w-3.5 h-3.5 opacity-40 mr-1" />
          <button 
            onClick={() => {
              const currentSize = firstObject?.style.fontSize || 0.2;
              handleUpdateStyle({ fontSize: Math.max(0.05, currentSize - 0.05) });
            }}
            className="p-1 hover:bg-white rounded-md transition-all"
          >
            <Minus className="w-3 h-3" />
          </button>
          <span className="text-[10px] font-mono font-bold min-w-[24px] text-center">
            {Math.round((firstObject?.style.fontSize || 0.2) * 100)}
          </span>
          <button 
            onClick={() => {
              const currentSize = firstObject?.style.fontSize || 0.2;
              handleUpdateStyle({ fontSize: Math.min(2.0, currentSize + 0.05) });
            }}
            className="p-1 hover:bg-white rounded-md transition-all"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>

        <div className="w-px h-4 bg-[var(--weave-muted)]/20 mx-1" />

        <button 
          onClick={() => handleUpdateStyle({ textAlign: 'left' })}
          className={`p-1.5 rounded-md transition-all ${firstObject?.style.textAlign === 'left' ? 'bg-white shadow-sm text-[var(--weave-gold)]' : 'hover:bg-white text-[var(--weave-accent)] opacity-60'}`}
        >
          <AlignLeft className="w-3.5 h-3.5" />
        </button>
        <button 
          onClick={() => handleUpdateStyle({ textAlign: 'center' })}
          className={`p-1.5 rounded-md transition-all ${(!firstObject?.style.textAlign || firstObject?.style.textAlign === 'center') ? 'bg-white shadow-sm text-[var(--weave-gold)]' : 'hover:bg-white text-[var(--weave-accent)] opacity-60'}`}
        >
          <AlignCenter className="w-3.5 h-3.5" />
        </button>
        <button 
          onClick={() => handleUpdateStyle({ textAlign: 'right' })}
          className={`p-1.5 rounded-md transition-all ${firstObject?.style.textAlign === 'right' ? 'bg-white shadow-sm text-[var(--weave-gold)]' : 'hover:bg-white text-[var(--weave-accent)] opacity-60'}`}
        >
          <AlignRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="w-px h-6 bg-[var(--weave-muted)]/20" />

      {/* More Button */}
      <button className="p-2 hover:bg-black/5 rounded-lg text-[var(--weave-accent)] opacity-40">
        <MoreHorizontal className="w-5 h-5" />
      </button>
    </div>
  );
};
