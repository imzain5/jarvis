"use client";

import { motion } from "motion/react";

import type { PanelRuntime } from "@/types/interaction";

type PanelContentProps = {
  panel: PanelRuntime;
  expanded?: boolean;
};

const moduleCells = [
  "Render",
  "Orbit",
  "Optics",
  "Target",
  "Archive",
  "Shield",
  "Pulse",
  "Matrix",
];

const timelineBars = [42, 68, 34, 78, 54, 82, 46, 70, 58, 88, 40, 72];

export function PanelContent({ panel, expanded = false }: PanelContentProps) {
  if (panel.type === "system") {
    return (
      <div className="grid gap-4">
        <div className="grid grid-cols-3 gap-3">
          {[
            ["Power", "94%"],
            ["Latency", "11ms"],
            ["Cooling", "71%"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-white/8 bg-white/4 p-3">
              <p className="text-[10px] uppercase tracking-[0.34em] text-dim">{label}</p>
              <p className="font-display mt-2 text-xl text-white">{value}</p>
            </div>
          ))}
        </div>
        <div className="grid gap-2">
          {[
            ["Arc reactor balance", 0.92],
            ["Optical routing", 0.74],
            ["Gesture confidence", 0.83],
          ].map(([label, value]) => (
            <div key={label as string}>
              <div className="mb-2 flex items-center justify-between text-[11px] uppercase tracking-[0.28em] text-soft">
                <span>{label as string}</span>
                <span>{Math.round((value as number) * 100)}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/8">
                <motion.div
                  className="h-full rounded-full bg-[linear-gradient(90deg,rgba(107,228,255,0.18),rgba(108,226,255,0.96),rgba(77,131,255,0.74))]"
                  initial={{ width: 0 }}
                  animate={{ width: `${(value as number) * 100}%` }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                />
              </div>
            </div>
          ))}
        </div>
        {expanded ? (
          <div className="grid grid-cols-2 gap-3">
            {["Thermal envelope", "Neural assist", "Optic routing", "Panel inertia"].map((item) => (
              <div key={item} className="rounded-2xl border border-cyan-300/10 bg-cyan-300/5 p-3">
                <p className="text-[10px] uppercase tracking-[0.3em] text-dim">{item}</p>
                <div className="mt-3 flex items-end gap-2">
                  {[32, 50, 44, 66, 59, 78].map((bar, index) => (
                    <motion.div
                      key={`${item}-${bar}`}
                      className="w-2 rounded-full bg-cyan-300/80"
                      animate={{ height: [bar - 8, bar, bar - 4] }}
                      transition={{
                        repeat: Infinity,
                        duration: 2 + index * 0.18,
                        ease: "easeInOut",
                      }}
                      style={{ height: `${bar}px` }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    );
  }

  if (panel.type === "media") {
    return (
      <div className="grid gap-4">
        <div className="flex items-end gap-2 rounded-[1.75rem] border border-blue-300/10 bg-black/20 p-4">
          {timelineBars.map((bar, index) => (
            <motion.div
              key={`${panel.id}-${bar}-${index}`}
              className="flex-1 rounded-full bg-[linear-gradient(180deg,rgba(130,236,255,0.9),rgba(69,131,255,0.2))]"
              animate={{
                height: [
                  `${bar - 12}px`,
                  `${bar + (index % 3) * 8}px`,
                  `${bar - 10}px`,
                ],
              }}
              transition={{
                repeat: Infinity,
                duration: 1.8 + index * 0.07,
                ease: "easeInOut",
              }}
              style={{ height: `${bar}px` }}
            />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            ["Bloom drive", "89"],
            ["Depth focus", "74"],
            ["Pulse sync", "93"],
            ["Wave mix", "67"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-white/8 bg-white/4 p-3">
              <p className="text-[10px] uppercase tracking-[0.34em] text-dim">{label}</p>
              <p className="font-display mt-2 text-2xl text-white">{value}</p>
            </div>
          ))}
        </div>
        {expanded ? (
          <div className="rounded-[1.75rem] border border-cyan-300/10 bg-cyan-300/5 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-[0.32em] text-soft">
                Spectrum trail
              </span>
              <span className="text-[10px] uppercase tracking-[0.32em] text-dim">
                live reactive
              </span>
            </div>
            <div className="grid grid-cols-12 gap-2">
              {timelineBars.concat(timelineBars).map((bar, index) => (
                <motion.div
                  key={`trail-${index}`}
                  className="rounded-full bg-cyan-200/80"
                  animate={{
                    height: [bar - 16, bar + 12, bar - 10],
                    opacity: [0.45, 1, 0.55],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 2.4 + (index % 6) * 0.14,
                    ease: "easeInOut",
                  }}
                  style={{ height: `${bar}px` }}
                />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  if (panel.type === "modules") {
    return (
      <div className="grid gap-4">
        <div className="grid grid-cols-2 gap-3">
          {moduleCells.map((cell, index) => (
            <motion.div
              key={cell}
              className="rounded-2xl border border-cyan-200/10 bg-cyan-200/5 px-3 py-4"
              animate={{
                borderColor: [
                  "rgba(144,244,255,0.10)",
                  "rgba(144,244,255,0.18)",
                  "rgba(144,244,255,0.10)",
                ],
              }}
              transition={{
                repeat: Infinity,
                duration: 2.8 + index * 0.12,
                ease: "easeInOut",
              }}
            >
              <p className="font-display text-sm text-white">{cell}</p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.32em] text-dim">
                live module
              </p>
            </motion.div>
          ))}
        </div>
        {expanded ? (
          <div className="grid grid-cols-3 gap-3">
            {["Pinned", "Recent", "Adaptive"].map((group) => (
              <div key={group} className="rounded-[1.75rem] border border-white/8 bg-white/4 p-4">
                <p className="mb-3 text-[10px] uppercase tracking-[0.32em] text-soft">{group}</p>
                <div className="grid gap-2">
                  {moduleCells.slice(0, 4).map((item) => (
                    <div
                      key={`${group}-${item}`}
                      className="rounded-xl border border-cyan-300/8 bg-black/16 px-3 py-2 text-sm text-white/90"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    );
  }

  if (panel.type === "signals") {
    return (
      <div className="grid gap-3">
        <div className="rounded-[1.75rem] border border-cyan-300/10 bg-cyan-300/6 p-4">
          <div className="grid grid-cols-3 gap-2">
            {[0.76, 0.48, 0.88, 0.57, 0.71, 0.91].map((value, index) => (
              <div key={`${panel.id}-${index}`} className="rounded-xl bg-black/20 p-3">
                <p className="text-[10px] uppercase tracking-[0.28em] text-dim">node {index + 1}</p>
                <p className="font-display mt-2 text-lg text-white">{Math.round(value * 100)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      <div className="rounded-[1.75rem] border border-cyan-300/10 bg-cyan-300/6 p-4">
        <div className="grid gap-3">
          {[
            ["Orbit", "Synced"],
            ["Vector", "Aligned"],
            ["Pulse", "Stable"],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between rounded-2xl bg-black/16 px-3 py-2">
              <span className="text-[10px] uppercase tracking-[0.32em] text-soft">{label}</span>
              <span className="font-display text-sm text-white">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
