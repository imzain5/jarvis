"use client";

import { AnimatePresence, motion } from "motion/react";

import { PanelContent } from "@/components/panels/panel-content";
import type { PanelRuntime } from "@/types/interaction";

type ExpandedPanelProps = {
  panel: PanelRuntime | null;
  onClose: () => void;
};

export function ExpandedPanel({ panel, onClose }: ExpandedPanelProps) {
  return (
    <AnimatePresence>
      {panel ? (
        <motion.div
          className="absolute inset-0 z-40 flex items-center justify-center bg-[radial-gradient(circle_at_center,rgba(31,93,122,0.18),rgba(0,0,0,0.72))] px-6 py-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="hud-glass relative max-h-full w-full max-w-6xl overflow-hidden rounded-[2.25rem] border border-cyan-200/20 p-8"
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ type: "spring", stiffness: 160, damping: 22 }}
          >
            <div className="scan-lines" />
            <div className="relative z-10 flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.34em] text-soft">{panel.kicker}</p>
                <h2 className="font-display mt-3 text-3xl tracking-[0.1em] text-white">{panel.title}</h2>
                <p className="mt-3 max-w-3xl text-base leading-7 text-soft">{panel.subtitle}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-cyan-200/20 bg-black/24 px-4 py-2 text-xs uppercase tracking-[0.32em] text-soft transition hover:border-cyan-200/42 hover:text-white"
              >
                Collapse
              </button>
            </div>

            <div className="relative z-10 mt-8 grid gap-6 lg:grid-cols-[1.25fr_0.8fr]">
              <div className="rounded-[2rem] border border-cyan-200/10 bg-black/20 p-6">
                <PanelContent panel={panel} expanded />
              </div>
              <div className="grid gap-4">
                <div className="rounded-[1.75rem] border border-white/8 bg-white/4 p-5">
                  <p className="text-[10px] uppercase tracking-[0.34em] text-soft">Interaction notes</p>
                  <div className="mt-4 grid gap-3 text-sm leading-6 text-soft">
                    <p>Pinch and move to reposition the holographic layer with spring damping.</p>
                    <p>Hold a grab or sustain a locked pinch to pull the interface toward you.</p>
                    <p>Blink confirmation stays intentionally conservative to avoid accidental triggers.</p>
                  </div>
                </div>
                <div className="rounded-[1.75rem] border border-cyan-200/10 bg-cyan-200/5 p-5">
                  <p className="text-[10px] uppercase tracking-[0.34em] text-soft">Scene pulse</p>
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    {[74, 86, 91, 66, 78, 88].map((value, index) => (
                      <div key={value + index} className="rounded-2xl bg-black/16 p-3">
                        <p className="text-[10px] uppercase tracking-[0.28em] text-dim">Node {index + 1}</p>
                        <p className="font-display mt-2 text-xl text-white">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
