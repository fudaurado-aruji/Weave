import { 
  ChevronDown,
  Layout,
  MousePointer2,
  Hand
} from "lucide-react";
import { useStore } from "../store/useStore";

export const ObjectToolbar = () => {
  const selectedObjectIds = useStore((state) => state.selectedObjectIds);
  const objects = useStore((state) => state.objects);
  const firstObjectId = selectedObjectIds[0];
  const firstObject = objects[firstObjectId];

  // オブジェクトが選択されていない場合は最小限の表示にするか、非表示にする
  // ここでは「Weave Studio」のステータスバー的な役割を持たせる
  
  const setInteractionMode = useStore((state) => state.setInteractionMode);
  const interactionMode = useStore((state) => state.interactionMode);

  return (
    <div className="fixed top-[80px] left-[110px] right-6 h-14 bg-white/90 backdrop-blur-xl border border-[var(--weave-muted)]/30 rounded-2xl shadow-xl z-50 flex items-center px-6 gap-4 weave-washi-texture animate-in fade-in slide-in-from-top-2 duration-500">
      
      {/* Mode Switcher */}
      <div className="flex items-center gap-1 bg-black/5 p-1 rounded-xl">
        <button 
          onClick={() => setInteractionMode('select')}
          className={`p-2 rounded-lg transition-all ${interactionMode === 'select' ? 'bg-white shadow-sm text-[var(--weave-gold)]' : 'text-[var(--weave-accent)] opacity-40 hover:opacity-100'}`}
          title="Selection Mode (V)"
        >
          <MousePointer2 className="w-4 h-4" />
        </button>
        <button 
          onClick={() => setInteractionMode('pan')}
          className={`p-2 rounded-lg transition-all ${interactionMode === 'pan' ? 'bg-white shadow-sm text-[var(--weave-gold)]' : 'text-[var(--weave-accent)] opacity-40 hover:opacity-100'}`}
          title="Pan Mode (H)"
        >
          <Hand className="w-4 h-4" />
        </button>
      </div>

      <div className="w-px h-6 bg-[var(--weave-muted)]/20" />

      {/* Contextual Info */}
      <div className="flex-1 flex items-center gap-3">
        {selectedObjectIds.length > 0 ? (
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-[var(--weave-gold)] tracking-widest uppercase bg-[var(--weave-gold)]/10 px-2 py-1 rounded">
              {selectedObjectIds.length} Selective
            </span>
            <span className="text-[11px] font-bold opacity-40">
              {selectedObjectIds.length === 1 ? (firstObject?.type || 'Object') : 'Items selected'}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Layout className="w-4 h-4 opacity-20" />
            <span className="text-[11px] font-bold opacity-20 uppercase tracking-widest">Select an object to edit</span>
          </div>
        )}
      </div>

      <div className="w-px h-6 bg-[var(--weave-muted)]/20" />

      {/* View/Global Settings (Mock) */}
      <div className="flex items-center gap-2">
         <button className="flex items-center gap-2 px-3 py-1.5 hover:bg-black/5 rounded-lg transition-all group">
            <span className="text-[10px] font-black tracking-widest uppercase opacity-40 group-hover:opacity-100">View</span>
            <ChevronDown className="w-3 h-3 opacity-30" />
         </button>
         <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[var(--weave-gold)] to-amber-200 border-2 border-white shadow-md cursor-pointer hover:scale-110 transition-transform" />
      </div>
    </div>
  );
};
