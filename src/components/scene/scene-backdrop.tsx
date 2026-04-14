"use client";

export default function SceneBackdrop() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_22%,rgba(88,196,255,0.14),transparent_22%),radial-gradient(circle_at_50%_46%,rgba(62,118,255,0.12),transparent_28%),linear-gradient(180deg,#071019_0%,#03060a_62%,#010204_100%)]" />
      <div className="absolute left-1/2 top-1/2 h-[16rem] w-[16rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-200/14 bg-[radial-gradient(circle,rgba(112,232,255,0.16),rgba(112,232,255,0.03)_48%,transparent_70%)] shadow-[0_0_90px_rgba(92,220,255,0.18)]" />
      <div className="absolute left-1/2 top-1/2 h-[24rem] w-[24rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-200/8" />
      <div className="absolute left-1/2 top-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-blue-300/8" />
      <div className="absolute inset-0 opacity-35 [background-image:radial-gradient(circle_at_center,rgba(128,242,255,0.2)_0,transparent_2px)] [background-size:72px_72px]" />
    </div>
  );
}
