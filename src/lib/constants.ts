import type { PanelGroup, PanelRuntime } from "@/types/interaction";

export const CAMERA_SETTINGS = {
  width: 1280,
  height: 720,
  facingMode: "user",
};

export const MEDIAPIPE_ASSETS = {
  wasmRoot: "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm",
  gestureModel:
    "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
  faceModel:
    "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
};

export const PANEL_GROUPS: PanelGroup[] = [
  {
    id: "command",
    name: "Command Deck",
    description: "Reactive control surfaces anchored around the central reactor.",
    panels: [
      {
        id: "system-dashboard",
        type: "system",
        title: "System Dashboard",
        subtitle: "Live thermal, power, and latency telemetry",
        kicker: "Core matrix",
        accent: "#7ceeff",
        size: "lg",
        position: { x: -0.44, y: -0.2, z: 0.08 },
      },
      {
        id: "media-visualizer",
        type: "media",
        title: "Media Visualizer",
        subtitle: "Reactive spectrum and cinematic signal traces",
        kicker: "Pulse stream",
        accent: "#4c8bff",
        size: "md",
        position: { x: 0.42, y: -0.24, z: 0.02 },
      },
      {
        id: "modules-grid",
        type: "modules",
        title: "Modules Grid",
        subtitle: "Deploy, pin, and reorganize command modules",
        kicker: "Stack index",
        accent: "#9ff9ff",
        size: "lg",
        position: { x: 0.38, y: 0.22, z: 0.12 },
      },
      {
        id: "signal-lattice",
        type: "signals",
        title: "Signal Lattice",
        subtitle: "Orbital channels and phased uplink confidence",
        kicker: "Spectral route",
        accent: "#67d9ff",
        size: "sm",
        position: { x: -0.12, y: 0.34, z: -0.02 },
      },
      {
        id: "telemetry-ring",
        type: "telemetry",
        title: "Telemetry Ring",
        subtitle: "Spatial diagnostics riding the reactor pulse",
        kicker: "Arc feed",
        accent: "#7bc0ff",
        size: "sm",
        position: { x: -0.5, y: 0.18, z: -0.08 },
      },
    ],
  },
  {
    id: "operations",
    name: "Operations Halo",
    description: "An alternate card constellation with denser signal routing.",
    panels: [
      {
        id: "system-dashboard-ops",
        type: "system",
        title: "Operations Matrix",
        subtitle: "Mission states, uplinks, and thermal load balancing",
        kicker: "Ops lattice",
        accent: "#7ceeff",
        size: "lg",
        position: { x: -0.34, y: -0.28, z: 0.05 },
      },
      {
        id: "media-visualizer-ops",
        type: "media",
        title: "Signal Composer",
        subtitle: "Fused visualizer and atmospheric pulse deck",
        kicker: "Wave nexus",
        accent: "#3f9cff",
        size: "md",
        position: { x: 0.48, y: -0.18, z: 0.08 },
      },
      {
        id: "modules-grid-ops",
        type: "modules",
        title: "Module Cabinet",
        subtitle: "Pinned tools, cards, and quick-launch routines",
        kicker: "Command stack",
        accent: "#9eefff",
        size: "lg",
        position: { x: 0.16, y: 0.28, z: 0.18 },
      },
      {
        id: "signal-lattice-ops",
        type: "signals",
        title: "Route Prism",
        subtitle: "Adaptive channel focus with target bias",
        kicker: "Intent assist",
        accent: "#68e5ff",
        size: "sm",
        position: { x: -0.52, y: 0.16, z: -0.08 },
      },
      {
        id: "telemetry-ring-ops",
        type: "telemetry",
        title: "Vector Ring",
        subtitle: "Orbital guidance and inertial trace map",
        kicker: "Gyro feed",
        accent: "#7ec2ff",
        size: "sm",
        position: { x: 0.52, y: 0.18, z: -0.04 },
      },
    ],
  },
  {
    id: "atelier",
    name: "Atelier Frame",
    description: "A calmer spatial layout tuned for ambient focus and expansion.",
    panels: [
      {
        id: "system-dashboard-lab",
        type: "system",
        title: "Atelier Core",
        subtitle: "Performance, climate, and reactor harmonics",
        kicker: "Studio core",
        accent: "#76ecff",
        size: "lg",
        position: { x: -0.42, y: -0.1, z: 0.12 },
      },
      {
        id: "media-visualizer-lab",
        type: "media",
        title: "Lightfield Mixer",
        subtitle: "Bloom curves and resonance shaping",
        kicker: "Field audio",
        accent: "#4a8eff",
        size: "md",
        position: { x: 0.44, y: -0.3, z: 0.02 },
      },
      {
        id: "modules-grid-lab",
        type: "modules",
        title: "Artifact Stack",
        subtitle: "Floating modules framed as tactile cards",
        kicker: "Artifact grid",
        accent: "#b2fdff",
        size: "lg",
        position: { x: 0.28, y: 0.26, z: 0.1 },
      },
      {
        id: "signal-lattice-lab",
        type: "signals",
        title: "Focus Prism",
        subtitle: "Attention-reactive cues and scene weighting",
        kicker: "Gaze assist",
        accent: "#67daff",
        size: "sm",
        position: { x: -0.52, y: 0.22, z: -0.04 },
      },
      {
        id: "telemetry-ring-lab",
        type: "telemetry",
        title: "Pulse Cartography",
        subtitle: "Ambient reactor and orbit scan overlays",
        kicker: "Orbital scope",
        accent: "#8dccff",
        size: "sm",
        position: { x: -0.02, y: 0.36, z: -0.08 },
      },
    ],
  },
];

export const CALIBRATION_POINTS = [
  { x: 0.18, y: 0.22 },
  { x: 0.82, y: 0.28 },
  { x: 0.5, y: 0.72 },
];

export const ONBOARDING_STEPS = [
  "Hold your hand in frame",
  "Open palm to arm the interface",
  "Pinch to grab and drag a panel",
  "Swipe left or right to shift the panel constellation",
  "Look toward a panel to bias focus and lock-on",
];

export function buildRuntimePanels(groupIndex: number): PanelRuntime[] {
  return PANEL_GROUPS[groupIndex].panels.map((panel) => ({
    ...panel,
    basePosition: { ...panel.position },
    lastInteractionAt: 0,
  }));
}
