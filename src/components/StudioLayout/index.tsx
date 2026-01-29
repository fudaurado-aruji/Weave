import { 
  Layout, 
  Shapes, 
  Type, 
  Square, 
  History, 
  Box, 
  Globe, 
  Undo2, 
  Redo2, 
  Image as ImageIcon, 
  Camera, 
  Sparkles, 
  Clock, 
  MousePointer2, 
  Hand,
  ChevronDown
} from 'lucide-react'

import { useStore, type ViewMode } from '../../store/useStore'
import { useState } from 'react'

export function StudioLayout({ children }: { children: React.ReactNode }) {
  const { mode, setMode, zoom, setZoom, triggerCameraReset } = useStore()
  const [activeTool, setActiveTool] = useState<'select' | 'pan'>('select')

  const cycleMode = () => {
    const modes: ViewMode[] = ['2D', '2.5D', '3D']
    const nextIndex = (modes.indexOf(mode) + 1) % modes.length
    setMode(modes[nextIndex])
  }

  return (
    <div className="w-full h-full bg-[#f8f9fa] flex flex-col font-['Outfit'] overflow-hidden select-none">
      
      {/* Top Header Bar */}
      <header className="h-12 bg-white border-b border-gray-200 flex items-center justify-between px-4 shrink-0 z-50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <img src="/weave-logo.png" alt="Weave Logo" className="w-6 h-6 object-contain" />
            <span className="text-xs font-black uppercase tracking-tighter">Weave V2</span>
          </div>
          <div className="h-4 w-px bg-gray-200" />
          <div className="flex items-center gap-1">
            <button className="p-1.5 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-900 transition-colors">
              <Undo2 className="w-4 h-4" />
            </button>
            <button className="p-1.5 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-900 transition-colors">
              <Redo2 className="w-4 h-4" />
            </button>
          </div>
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-4">
            フレーム 1 <span className="text-[var(--weave-gold)] ml-2">[{mode}]</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-1.5 hover:bg-gray-100 rounded text-gray-600 flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
          </button>
          <button className="p-1.5 hover:bg-gray-100 rounded text-gray-600 flex items-center gap-2">
            <Camera className="w-4 h-4" />
          </button>
          <button className="p-1.5 hover:bg-gray-100 rounded text-gray-600 flex items-center gap-2">
            <Layout className="w-4 h-4" />
          </button>
          <button className="ml-2 w-8 h-8 rounded-lg bg-red-400 flex items-center justify-center hover:opacity-80 transition-opacity">
            <Sparkles className="w-4 h-4 text-white" />
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar */}
        <aside className="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-4 gap-6 shrink-0 z-40">
          <SidebarIcon icon={<Layout className="w-5 h-5" />} label="テンプレート" />
          <SidebarIcon icon={<Shapes className="w-5 h-5" />} label="シェイプ" />
          <SidebarIcon icon={<Type className="w-5 h-5" />} label="テキスト" />
          <SidebarIcon icon={<Square className="w-5 h-5" />} label="エリア" />
          <SidebarIcon icon={<History className="w-5 h-5" />} label="ヒストリー" />
          <SidebarIcon icon={<Box className="w-5 h-5" />} label="モジュール" />
          <div className="mt-auto w-full">
            <SidebarIcon 
              icon={<Globe className="w-5 h-5" />} 
              label="ワールド" 
              active 
              onClick={cycleMode}
            />
          </div>
        </aside>

        {/* Canvas Area */}
        <main className="flex-1 relative bg-[#f1f3f5] overflow-hidden">
          <div className="absolute inset-0 border-[6px] border-gray-300 pointer-events-none z-10 opacity-50" />
          <div className="w-full h-full bg-white shadow-inner relative">
             {children}
          </div>

          {/* Bottom Tool Bar */}
          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end pointer-events-none z-20">
            <div className="flex gap-2 pointer-events-auto">
              <button 
                onClick={() => setActiveTool('select')}
                className={`border p-2 rounded-lg shadow-sm transition-all ${activeTool === 'select' ? 'bg-black text-white border-black' : 'bg-white border-gray-200 text-gray-900 hover:bg-gray-50'}`}
              >
                <MousePointer2 className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setActiveTool('pan')}
                className={`border p-2 rounded-lg shadow-sm transition-all ${activeTool === 'pan' ? 'bg-black text-white border-black' : 'bg-white border-gray-200 text-gray-900 hover:bg-gray-50'}`}
              >
                <Hand className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-4 pointer-events-auto">
              {/* Zoom Slider integrated into the group to avoid overlap */}
              <div className="flex items-center w-32 group">
                <input 
                  type="range" 
                  min="10" 
                  max="300" 
                  value={zoom} 
                  onChange={(e) => setZoom(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[var(--weave-gold)]" 
                />
              </div>

              <div className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-sm">
                <button 
                  onClick={() => setZoom(100)}
                  className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
                >
                  全体表示
                </button>
                <div className="w-px h-3 bg-gray-200" />
                <div className="flex items-center gap-1 min-w-[60px] justify-between">
                  <span className="text-xs font-mono font-bold">{zoom}%</span>
                  <ChevronDown className="w-3 h-3 text-gray-400" />
                </div>
              </div>

              <button 
                onClick={triggerCameraReset}
                className="bg-white border border-gray-200 p-2 rounded-lg shadow-sm hover:bg-gray-50 text-gray-600 transition-all group"
                title="視点をリセット"
              >
                <Camera className="w-5 h-5 group-active:scale-95 transition-transform" />
              </button>
              <button className="bg-white border border-gray-200 p-2 rounded-lg shadow-sm hover:bg-gray-50 text-gray-600 transition-all">
                <Clock className="w-5 h-5" />
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

function SidebarIcon({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center gap-1 group w-full ${active ? 'text-[var(--weave-gold)]' : 'text-gray-400 hover:text-gray-600'}`}
    >
      <div className={`p-2 rounded-xl transition-all ${active ? 'bg-[#fdf9f0]' : 'group-hover:bg-gray-50'}`}>
        {icon}
      </div>
      <span className={`text-[8px] font-bold uppercase tracking-tighter ${active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 transition-opacity'}`}>
        {label}
      </span>
    </button>
  )
}
