"use client";

import { RefObject } from "react";

import { useJarvisStore } from "@/store/app-store";

type VisionFeedProps = {
  videoRef: RefObject<HTMLVideoElement | null>;
};

export function VisionFeed({ videoRef }: VisionFeedProps) {
  const { hand, focus, face } = useJarvisStore((state) => ({
    hand: state.hand,
    focus: state.focus,
    face: state.face,
  }));

  return (
    <div className="absolute right-6 top-6 z-30 w-[240px] overflow-hidden rounded-[1.75rem] border border-cyan-200/16 bg-[rgba(7,15,24,0.64)] p-3 backdrop-blur-xl">
      <div className="mb-3 flex items-center justify-between text-[10px] uppercase tracking-[0.32em] text-soft">
        <span>Vision Relay</span>
        <span className="text-dim">{face ? "live" : "standby"}</span>
      </div>
      <div className="relative overflow-hidden rounded-[1.25rem] border border-cyan-200/10 bg-black/30">
        <video
          ref={videoRef}
          muted
          playsInline
          className="h-[150px] w-full scale-x-[-1] object-cover opacity-70"
        />
        <div className="scan-lines" />
        <div className="absolute inset-x-0 top-4 flex justify-center">
          <div className="rounded-full border border-cyan-200/16 bg-black/28 px-3 py-1 text-[10px] uppercase tracking-[0.32em] text-soft">
            {hand ? hand.posture : "no hand"}
          </div>
        </div>
        <div
          className="absolute h-6 w-6 rounded-full border border-cyan-200/60"
          style={{
            left: `${focus.attentionPoint.x * 100}%`,
            top: `${focus.attentionPoint.y * 100}%`,
            transform: "translate(-50%, -50%)",
            boxShadow: "0 0 18px rgba(126,239,255,0.32)",
          }}
        />
      </div>
    </div>
  );
}
