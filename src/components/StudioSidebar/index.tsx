import { 
  Plus, 
  Shapes, 
  Grid, 
  Palette, 
  Settings, 
  Layers,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ElementsPanel } from "./ElementsPanel";

import type { SidebarTabId } from "../../types";

interface SidebarTabConfig {
  id: SidebarTabId;
  icon: LucideIcon;
  label: string;
}

const TOP_TABS: SidebarTabConfig[] = [
  { id: "pages", icon: Layers, label: "PAGES" },
  { id: "elements", icon: Shapes, label: "ELEMENTS" },
  { id: "layouts", icon: Grid, label: "LAYOUTS" },
  { id: "design", icon: Palette, label: "DESIGN" },
];

const BOTTOM_TABS: SidebarTabConfig[] = [
  { id: "settings", icon: Settings, label: "SETTINGS" },
];

interface StudioSidebarProps {
  activeTab: SidebarTabId | null;
  onTabChange: (tab: SidebarTabId | null) => void;
}

export const StudioSidebar = ({
  activeTab,
  onTabChange,
}: StudioSidebarProps) => {
  const renderTab = (tab: SidebarTabConfig) => {
    const isActive = activeTab === tab.id;
    const Icon = tab.icon;

    return (
      <button
        key={tab.id}
        onClick={() => onTabChange(isActive ? null : tab.id)}
        className={`w-full py-4 flex flex-col items-center justify-center gap-1.5 transition-all duration-300 relative group
          ${
            isActive
              ? "text-[var(--weave-gold)] bg-[rgba(197,160,89,0.05)]"
              : "text-[var(--weave-accent)] opacity-40 hover:opacity-100 hover:bg-black/5"
          }`}
      >
        {isActive && (
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--weave-gold)] shadow-[2px_0_10px_rgba(197,160,89,0.3)]" />
        )}
        <Icon
          className={`w-6 h-6 transition-transform duration-500 ${isActive ? "scale-110" : "group-hover:scale-110"}`}
        />
        <span className="text-[9px] font-black tracking-[0.2em] uppercase text-center leading-none">
          {tab.label}
        </span>
      </button>
    );
  };

  return (
    <>
      <aside className="w-[80px] h-full bg-white/90 backdrop-blur-xl border-r border-[var(--weave-muted)]/30 flex flex-col shrink-0 z-50 weave-washi-texture relative">
        <div className="flex flex-col items-center py-6 border-b border-[var(--weave-muted)]/10">
          <div className="w-10 h-10 bg-[var(--weave-gold)] rounded-xl flex items-center justify-center shadow-lg transform rotate-45 group hover:rotate-[135deg] transition-transform duration-700">
             <div className="transform -rotate-45">
                <Plus className="w-6 h-6 text-white" />
             </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar py-2">
          {TOP_TABS.map(renderTab)}
        </div>

        <div className="border-t border-[var(--weave-muted)]/10 py-2">
          {BOTTOM_TABS.map(renderTab)}
        </div>
      </aside>

      {activeTab === 'elements' && (
        <ElementsPanel onClose={() => onTabChange(null)} />
      )}
    </>
  );
};
