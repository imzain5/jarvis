import { create } from "zustand";

import { buildRuntimePanels, PANEL_GROUPS } from "@/lib/constants";
import type {
  CalibrationStatus,
  CameraStatus,
  FocusState,
  PanelRuntime,
  TrackingMode,
} from "@/types/interaction";
import type { FaceInteractionState, InterpretedHandState } from "@/types/vision";

type JarvisStore = {
  cameraStatus: CameraStatus;
  cameraEnabled: boolean;
  onboardingDismissed: boolean;
  calibrationStatus: CalibrationStatus;
  calibrationIndex: number;
  calibrationBias: { x: number; y: number };
  activeGroupIndex: number;
  panels: PanelRuntime[];
  hand: InterpretedHandState | null;
  face: FaceInteractionState | null;
  trackingMode: TrackingMode;
  focus: FocusState;
  systemArmed: boolean;
  visionReady: boolean;
  selectedPanelId: string | null;
  expandedPanelId: string | null;
  lastSwipeDirection: "left" | "right" | null;
  enableCameraRequest: () => void;
  setCameraStatus: (status: CameraStatus) => void;
  dismissOnboarding: () => void;
  startCalibration: () => void;
  advanceCalibration: () => void;
  finishCalibration: (bias?: { x: number; y: number }) => void;
  skipCalibration: () => void;
  setVisionReady: (ready: boolean) => void;
  setTrackingMode: (mode: TrackingMode) => void;
  setHandState: (hand: InterpretedHandState | null) => void;
  setFaceState: (face: FaceInteractionState | null) => void;
  setSystemArmed: (armed: boolean) => void;
  setFocusState: (focus: FocusState) => void;
  cyclePanelGroup: (direction: "left" | "right") => void;
  setPanelPosition: (id: string, position: Partial<PanelRuntime["position"]>) => void;
  springPanelsHome: () => void;
  touchPanel: (id: string) => void;
  setSelectedPanel: (id: string | null) => void;
  setExpandedPanel: (id: string | null) => void;
};

export const useJarvisStore = create<JarvisStore>((set) => ({
  cameraStatus: "idle",
  cameraEnabled: false,
  onboardingDismissed: false,
  calibrationStatus: "idle",
  calibrationIndex: 0,
  calibrationBias: { x: 0, y: 0 },
  activeGroupIndex: 0,
  panels: buildRuntimePanels(0),
  hand: null,
  face: null,
  trackingMode: "disabled",
  focus: {
    panelId: null,
    lockedPanelId: null,
    confidence: 0,
    attentionPoint: { x: 0.5, y: 0.5 },
  },
  systemArmed: false,
  visionReady: false,
  selectedPanelId: null,
  expandedPanelId: null,
  lastSwipeDirection: null,
  enableCameraRequest: () =>
    set({
      cameraEnabled: true,
      cameraStatus: "pending",
    }),
  setCameraStatus: (status) =>
    set((state) => ({
      cameraStatus: status,
      cameraEnabled: status === "granted" ? true : state.cameraEnabled,
    })),
  dismissOnboarding: () => set({ onboardingDismissed: true }),
  startCalibration: () =>
    set({
      calibrationStatus: "running",
      calibrationIndex: 0,
    }),
  advanceCalibration: () =>
    set((state) => ({
      calibrationIndex: state.calibrationIndex + 1,
    })),
  finishCalibration: (bias) =>
    set({
      calibrationStatus: "complete",
      calibrationIndex: 0,
      calibrationBias: bias ?? { x: 0, y: 0 },
      onboardingDismissed: true,
    }),
  skipCalibration: () =>
    set({
      calibrationStatus: "skipped",
      calibrationIndex: 0,
      onboardingDismissed: true,
    }),
  setVisionReady: (ready) => set({ visionReady: ready }),
  setTrackingMode: (mode) => set({ trackingMode: mode }),
  setHandState: (hand) => set({ hand }),
  setFaceState: (face) => set({ face }),
  setSystemArmed: (armed) => set({ systemArmed: armed }),
  setFocusState: (focus) => set({ focus }),
  cyclePanelGroup: (direction) =>
    set((state) => {
      const nextIndex =
        direction === "right"
          ? (state.activeGroupIndex + 1) % PANEL_GROUPS.length
          : (state.activeGroupIndex - 1 + PANEL_GROUPS.length) % PANEL_GROUPS.length;

      return {
        activeGroupIndex: nextIndex,
        panels: buildRuntimePanels(nextIndex),
        selectedPanelId: null,
        expandedPanelId: null,
        lastSwipeDirection: direction,
      };
    }),
  setPanelPosition: (id, position) =>
    set((state) => ({
      panels: state.panels.map((panel) =>
        panel.id === id ? { ...panel, position: { ...panel.position, ...position } } : panel,
      ),
    })),
  springPanelsHome: () =>
    set((state) => ({
      panels: state.panels.map((panel) => ({
        ...panel,
        position: {
          x: panel.position.x + (panel.basePosition.x - panel.position.x) * 0.12,
          y: panel.position.y + (panel.basePosition.y - panel.position.y) * 0.12,
          z: panel.position.z + (panel.basePosition.z - panel.position.z) * 0.16,
        },
      })),
    })),
  touchPanel: (id) =>
    set((state) => ({
      panels: state.panels.map((panel) =>
        panel.id === id ? { ...panel, lastInteractionAt: Date.now() } : panel,
      ),
    })),
  setSelectedPanel: (id) => set({ selectedPanelId: id }),
  setExpandedPanel: (id) => set({ expandedPanelId: id }),
}));

export function useCurrentPanel(panelId: string) {
  return useJarvisStore((state) => state.panels.find((panel) => panel.id === panelId) ?? null);
}
