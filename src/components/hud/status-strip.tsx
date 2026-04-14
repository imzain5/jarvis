"use client";

import { useJarvisStore } from "@/store/app-store";

export function StatusStrip() {
  const {
    cameraStatus,
    trackingMode,
    systemArmed,
    hand,
    face,
    activeGroupIndex,
    focus,
  } = useJarvisStore((state) => ({
    cameraStatus: state.cameraStatus,
    trackingMode: state.trackingMode,
    systemArmed: state.systemArmed,
    hand: state.hand,
    face: state.face,
    activeGroupIndex: state.activeGroupIndex,
    focus: state.focus,
  }));

  return (
    <div className="absolute bottom-6 left-6 z-30 flex max-w-[calc(100vw-3rem)] flex-wrap gap-3">
      {[
        ["camera", cameraStatus],
        ["mode", trackingMode],
        ["armed", systemArmed ? "ready" : "idle"],
        ["hand", hand?.posture ?? "searching"],
        ["focus", focus.lockedPanelId ? "eye-lock" : focus.panelId ? "tracking" : "ambient"],
        ["group", `0${activeGroupIndex + 1}`],
        ["blink", face?.blinkDetected ? "confirm" : "monitor"],
      ].map(([label, value]) => (
        <div
          key={label}
          className="hud-glass rounded-full border border-cyan-200/12 px-4 py-2 text-[10px] uppercase tracking-[0.32em] text-soft"
        >
          <span className="text-dim">{label}</span>
          <span className="mx-2 text-dim">/</span>
          <span className="text-white">{value}</span>
        </div>
      ))}
    </div>
  );
}
