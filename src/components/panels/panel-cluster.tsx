"use client";

import { PanelCard } from "@/components/panels/panel-card";
import { useViewportSize } from "@/hooks/use-viewport-size";
import { useJarvisStore } from "@/store/app-store";

export function PanelCluster() {
  const { width, height } = useViewportSize();
  const { panels, focus, selectedPanelId, expandedPanelId } = useJarvisStore((state) => ({
    panels: state.panels,
    focus: state.focus,
    selectedPanelId: state.selectedPanelId,
    expandedPanelId: state.expandedPanelId,
  }));

  return (
    <div className="pointer-events-none absolute inset-0 z-20 [perspective:1800px] [transform-style:preserve-3d]">
      {panels.map((panel) => {
        const x = panel.position.x * width * 0.38;
        const y = panel.position.y * height * 0.31;
        const focusStrength =
          panel.id === focus.lockedPanelId
            ? 1
            : panel.id === focus.panelId
              ? Math.max(0.38, focus.confidence)
              : 0;

        return (
          <PanelCard
            key={panel.id}
            panel={panel}
            x={x}
            y={y}
            focusStrength={focusStrength}
            isFocused={panel.id === focus.panelId}
            isLocked={panel.id === focus.lockedPanelId}
            isSelected={panel.id === selectedPanelId}
            isExpanded={expandedPanelId !== null && expandedPanelId !== panel.id}
          />
        );
      })}
    </div>
  );
}
