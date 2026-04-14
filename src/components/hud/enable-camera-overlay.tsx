"use client";

import { motion } from "motion/react";

import type { CameraStatus } from "@/types/interaction";

type EnableCameraOverlayProps = {
  cameraStatus: CameraStatus;
  runtimeError: string | null;
  onEnable: () => void;
};

export function EnableCameraOverlay({
  cameraStatus,
  runtimeError,
  onEnable,
}: EnableCameraOverlayProps) {
  const buttonLabel =
    cameraStatus === "pending"
      ? "Initializing Camera..."
      : cameraStatus === "denied"
        ? "Retry Camera Access"
        : "Enable Camera Control";

  return (
    <motion.div
      className="absolute inset-0 z-50 flex items-center justify-center px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="hud-glass relative max-w-2xl overflow-hidden rounded-[2.25rem] border border-cyan-200/20 px-8 py-10">
        <div className="scan-lines" />
        <div className="relative z-10">
          <p className="text-[11px] uppercase tracking-[0.42em] text-soft">ZAYN // JARVIS UI</p>
          <h1 className="font-display mt-4 text-4xl tracking-[0.12em] text-white sm:text-5xl">
            Cinematic control room,
            <br />
            built for hands first.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-soft">
            A browser-native holographic interface with real-time hand tracking, face-guided
            focus, and premium spatial panels. Camera access only powers local, on-device vision
            features in your browser.
          </p>

          <div className="mt-8 flex flex-wrap gap-3 text-[10px] uppercase tracking-[0.32em] text-dim">
            <span className="rounded-full border border-cyan-200/10 bg-black/24 px-3 py-2">
              Open palm to arm
            </span>
            <span className="rounded-full border border-cyan-200/10 bg-black/24 px-3 py-2">
              Pinch to drag
            </span>
            <span className="rounded-full border border-cyan-200/10 bg-black/24 px-3 py-2">
              Eye-guided focus assist
            </span>
          </div>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={onEnable}
              disabled={cameraStatus === "pending"}
              className="rounded-full border border-cyan-200/24 bg-[linear-gradient(135deg,rgba(127,239,255,0.18),rgba(56,126,255,0.22))] px-6 py-3 text-sm uppercase tracking-[0.34em] text-white transition hover:border-cyan-200/46 hover:shadow-[0_0_28px_rgba(111,232,255,0.16)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {buttonLabel}
            </button>
            <p className="text-sm leading-6 text-dim">
              {cameraStatus === "denied"
                ? "Camera access was blocked. Grant permission and try again."
                : "No backend. No auth. No upload pipeline. Just local vision and immersive UI."}
            </p>
          </div>

          {runtimeError ? (
            <p className="mt-5 text-sm leading-6 text-rose-200/80">{runtimeError}</p>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
}
