"use client";

import { motion } from "motion/react";

import { CALIBRATION_POINTS } from "@/lib/constants";

type CalibrationOverlayProps = {
  index: number;
  onSkip: () => void;
};

export function CalibrationOverlay({ index, onSkip }: CalibrationOverlayProps) {
  const activePoint = CALIBRATION_POINTS[index];

  if (!activePoint) {
    return null;
  }

  return (
    <div className="absolute inset-0 z-50">
      <div className="pointer-events-none absolute inset-0 bg-black/30" />
      {CALIBRATION_POINTS.map((point, pointIndex) => (
        <motion.div
          key={`${point.x}-${point.y}`}
          className="absolute h-7 w-7 rounded-full border border-cyan-200/60"
          animate={{
            scale: pointIndex === index ? [1, 1.24, 1] : 0.72,
            opacity: pointIndex === index ? [0.5, 1, 0.5] : 0.28,
            boxShadow:
              pointIndex === index
                ? [
                    "0 0 16px rgba(126,239,255,0.15)",
                    "0 0 32px rgba(126,239,255,0.42)",
                    "0 0 16px rgba(126,239,255,0.15)",
                  ]
                : "0 0 10px rgba(126,239,255,0.1)",
          }}
          transition={{
            repeat: Infinity,
            duration: 1.6,
            ease: "easeInOut",
          }}
          style={{
            left: `${point.x * 100}%`,
            top: `${point.y * 100}%`,
            marginLeft: "-14px",
            marginTop: "-14px",
          }}
        />
      ))}
      <div className="absolute bottom-8 left-1/2 w-[min(560px,calc(100vw-2rem))] -translate-x-1/2 rounded-[1.75rem] border border-cyan-200/16 bg-[rgba(7,16,25,0.72)] px-6 py-4 backdrop-blur-xl">
        <p className="text-[10px] uppercase tracking-[0.38em] text-soft">Calibration</p>
        <div className="mt-3 flex items-center justify-between gap-4">
          <p className="text-sm leading-6 text-soft">
            Look at the glowing marker for a moment so the focus assist can bias toward your
            actual attention zone.
          </p>
          <button
            type="button"
            onClick={onSkip}
            className="pointer-events-auto shrink-0 rounded-full border border-white/12 bg-black/20 px-4 py-2 text-xs uppercase tracking-[0.32em] text-soft transition hover:text-white"
          >
            Skip
          </button>
        </div>
        <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/8">
          <motion.div
            className="h-full rounded-full bg-[linear-gradient(90deg,rgba(123,235,255,0.78),rgba(76,132,255,0.8))]"
            initial={{ width: "0%" }}
            animate={{ width: `${((index + 1) / CALIBRATION_POINTS.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
