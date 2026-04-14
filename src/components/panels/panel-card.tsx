"use client";

import clsx from "clsx";
import { motion } from "motion/react";

import { PanelContent } from "@/components/panels/panel-content";
import type { PanelRuntime } from "@/types/interaction";

type PanelCardProps = {
  panel: PanelRuntime;
  x: number;
  y: number;
  focusStrength: number;
  isFocused: boolean;
  isLocked: boolean;
  isSelected: boolean;
  isExpanded: boolean;
};

const panelSizes = {
  sm: { width: 288, minHeight: 212 },
  md: { width: 340, minHeight: 248 },
  lg: { width: 400, minHeight: 290 },
};

export function PanelCard({
  panel,
  x,
  y,
  focusStrength,
  isFocused,
  isLocked,
  isSelected,
  isExpanded,
}: PanelCardProps) {
  const size = panelSizes[panel.size];
  const lift = panel.position.z * 120 + focusStrength * 34 + (isSelected ? 24 : 0);

  return (
    <motion.div
      className="pointer-events-none absolute left-1/2 top-1/2 z-20"
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{
        x,
        y,
        scale: 1 + focusStrength * 0.06 + (isSelected ? 0.04 : 0),
        opacity: isExpanded ? 0.18 : 1,
        rotateX: panel.position.y * -6,
        rotateY: panel.position.x * 8,
        translateZ: lift,
        filter: `blur(${Math.max(0, 6 - focusStrength * 8 - panel.position.z * 10)}px)`,
      }}
      transition={{
        type: "spring",
        stiffness: 170,
        damping: 24,
        mass: 0.85,
      }}
      style={{
        width: size.width,
        minHeight: size.minHeight,
        marginLeft: -size.width / 2,
      }}
    >
      <div
        className={clsx(
          "hud-glass hud-outline panel-scan relative overflow-hidden rounded-[2rem] border p-5 text-white shadow-[0_24px_60px_rgba(0,0,0,0.42)]",
          isFocused && "border-cyan-200/40",
          isSelected && "border-cyan-200/55",
        )}
        style={{
          background:
            "linear-gradient(180deg, rgba(12,24,38,0.82), rgba(6,11,18,0.62)), linear-gradient(140deg, rgba(129,236,255,0.12), transparent 56%)",
          boxShadow: isFocused
            ? "0 0 40px rgba(104,225,255,0.16), 0 24px 72px rgba(0,0,0,0.48), inset 0 0 22px rgba(104,225,255,0.12)"
            : "0 18px 54px rgba(0,0,0,0.42)",
        }}
      >
        <div className="scan-lines" />
        <div
          className="absolute inset-x-8 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(149,243,255,0.86),transparent)]"
          style={{ opacity: 0.8 + focusStrength * 0.4 }}
        />
        {isFocused ? (
          <div className="focus-brackets absolute inset-0 rounded-[2rem] border border-cyan-200/16" />
        ) : null}

        <div className="relative z-10 flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.34em] text-soft">{panel.kicker}</p>
            <h2 className="font-display mt-2 text-[1.15rem] tracking-[0.08em] text-white">
              {panel.title}
            </h2>
            <p className="mt-2 max-w-[26ch] text-sm leading-6 text-soft">{panel.subtitle}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2 rounded-full border border-cyan-200/12 bg-black/18 px-3 py-1">
              <span
                className="h-2 w-2 rounded-full"
                style={{
                  background: panel.accent,
                  boxShadow: `0 0 18px ${panel.accent}`,
                }}
              />
              <span className="text-[10px] uppercase tracking-[0.28em] text-soft">
                {isLocked ? "eye-lock" : isSelected ? "grabbed" : isFocused ? "focused" : "ambient"}
              </span>
            </div>
            {isSelected ? (
              <div className="rounded-full border border-cyan-200/18 bg-cyan-200/10 px-3 py-1 text-[10px] uppercase tracking-[0.28em] text-cyan-100">
                hand-lock
              </div>
            ) : null}
          </div>
        </div>

        <div className="relative z-10 mt-5">
          <PanelContent panel={panel} />
        </div>
      </div>
    </motion.div>
  );
}
