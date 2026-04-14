"use client";

import { motion } from "motion/react";
import { useEffect } from "react";

import { CalibrationOverlay } from "@/components/hud/calibration-overlay";
import { EnableCameraOverlay } from "@/components/hud/enable-camera-overlay";
import { OnboardingOverlay } from "@/components/hud/onboarding-overlay";
import { StatusStrip } from "@/components/hud/status-strip";
import { VisionFeed } from "@/components/hud/vision-feed";
import { ExpandedPanel } from "@/components/panels/expanded-panel";
import { PanelCluster } from "@/components/panels/panel-cluster";
import SceneBackdrop from "@/components/scene/scene-backdrop";
import { useVisionSystem } from "@/hooks/use-vision-system";
import { useJarvisStore } from "@/store/app-store";

const STORAGE_KEY = "zayn-jarvis-ui:onboarding-complete";

export default function CommandRoom() {
  const { videoRef, runtimeError, enableCameraRequest } = useVisionSystem();
  const {
    cameraStatus,
    onboardingDismissed,
    calibrationStatus,
    calibrationIndex,
    focus,
    expandedPanelId,
    panels,
    hand,
    face,
    setExpandedPanel,
    startCalibration,
    dismissOnboarding,
    skipCalibration,
  } = useJarvisStore((state) => ({
    cameraStatus: state.cameraStatus,
    onboardingDismissed: state.onboardingDismissed,
    calibrationStatus: state.calibrationStatus,
    calibrationIndex: state.calibrationIndex,
    focus: state.focus,
    expandedPanelId: state.expandedPanelId,
    panels: state.panels,
    hand: state.hand,
    face: state.face,
    setExpandedPanel: state.setExpandedPanel,
    startCalibration: state.startCalibration,
    dismissOnboarding: state.dismissOnboarding,
    skipCalibration: state.skipCalibration,
  }));

  const expandedPanel = panels.find((panel) => panel.id === expandedPanelId) ?? null;

  useEffect(() => {
    const completed = window.localStorage.getItem(STORAGE_KEY);
    if (completed === "true") {
      dismissOnboarding();
    }
  }, [dismissOnboarding]);

  useEffect(() => {
    if (onboardingDismissed) {
      window.localStorage.setItem(STORAGE_KEY, "true");
    }
  }, [onboardingDismissed]);

  return (
    <main className="jarvis-shell">
      <SceneBackdrop />

      <div className="absolute inset-0 z-10 bg-[radial-gradient(circle_at_center,rgba(124,235,255,0.08),transparent_32%),radial-gradient(circle_at_50%_72%,rgba(53,125,255,0.14),transparent_30%),linear-gradient(180deg,transparent,rgba(1,5,10,0.55))]" />

      <div className="absolute inset-0 z-10 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 h-[32rem] w-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-200/8 opacity-70 blur-[2px]" />
        <div className="absolute left-1/2 top-1/2 h-[40rem] w-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-blue-300/8 opacity-60" />
        <div className="absolute left-1/2 top-1/2 h-[56rem] w-[56rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-200/6 opacity-40" />
      </div>

      <motion.div
        className="pointer-events-none absolute z-30 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-200/28"
        animate={{
          left: `${focus.attentionPoint.x * 100}%`,
          top: `${focus.attentionPoint.y * 100}%`,
          opacity: face ? 0.62 : 0.18,
          scale: focus.lockedPanelId ? 1.08 : 0.94,
        }}
        transition={{ type: "spring", stiffness: 160, damping: 20 }}
        style={{
          boxShadow: focus.lockedPanelId
            ? "0 0 42px rgba(127,239,255,0.18), inset 0 0 22px rgba(127,239,255,0.12)"
            : "0 0 18px rgba(127,239,255,0.08)",
        }}
      >
        <div className="absolute inset-[12px] rounded-full border border-cyan-200/40" />
      </motion.div>

      <div className="absolute left-6 top-6 z-30 max-w-lg">
        <p className="text-[11px] uppercase tracking-[0.42em] text-soft">ZAYN // JARVIS UI</p>
        <h1 className="font-display mt-3 text-3xl tracking-[0.12em] text-white sm:text-4xl">
          Holographic command room
        </h1>
        <p className="mt-3 max-w-md text-sm leading-7 text-soft">
          Hand-first interaction with face-guided focus assist, cinematic motion, and floating
          panels that feel like live projected matter.
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-[10px] uppercase tracking-[0.32em] text-dim">
          <span>open palm / arm</span>
          <span>pinch / drag</span>
          <span>grab / pull</span>
          <span>swipe / switch</span>
          <span>eye-lock / bias</span>
        </div>
      </div>

      <PanelCluster />
      <ExpandedPanel panel={expandedPanel} onClose={() => setExpandedPanel(null)} />
      <StatusStrip />

      {cameraStatus === "granted" ? <VisionFeed videoRef={videoRef} /> : null}

      {hand ? (
        <motion.div
          className="pointer-events-none absolute z-30 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-200/60"
          animate={{
            left: `${hand.screen.x * 100}%`,
            top: `${hand.screen.y * 100}%`,
            scale: 0.72 + hand.pinchStrength * 0.6,
            opacity: 0.58 + hand.confidence * 0.26,
          }}
          transition={{ type: "spring", stiffness: 220, damping: 18 }}
          style={{
            boxShadow: "0 0 28px rgba(111,232,255,0.18)",
          }}
        >
          <div className="absolute inset-[10px] rounded-full border border-cyan-200/28" />
        </motion.div>
      ) : null}

      {(cameraStatus === "idle" || cameraStatus === "pending" || cameraStatus === "denied" || cameraStatus === "error") ? (
        <EnableCameraOverlay
          cameraStatus={cameraStatus}
          runtimeError={runtimeError}
          onEnable={enableCameraRequest}
        />
      ) : null}

      <OnboardingOverlay
        open={cameraStatus === "granted" && !onboardingDismissed && calibrationStatus !== "running"}
        onCalibrate={startCalibration}
        onSkip={skipCalibration}
      />

      {calibrationStatus === "running" ? (
        <CalibrationOverlay index={calibrationIndex} onSkip={skipCalibration} />
      ) : null}
    </main>
  );
}
