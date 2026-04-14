export type CameraStatus = "idle" | "pending" | "granted" | "denied" | "error";

export type CalibrationStatus = "idle" | "running" | "complete" | "skipped";

export type TrackingMode = "disabled" | "hand-first" | "hybrid" | "reduced";

export type PanelType =
  | "system"
  | "media"
  | "modules"
  | "telemetry"
  | "signals";

export type PanelSize = "sm" | "md" | "lg";

export type PanelVector = {
  x: number;
  y: number;
  z: number;
};

export type PanelDefinition = {
  id: string;
  type: PanelType;
  title: string;
  subtitle: string;
  kicker: string;
  accent: string;
  size: PanelSize;
  position: PanelVector;
};

export type PanelRuntime = PanelDefinition & {
  basePosition: PanelVector;
  lastInteractionAt: number;
};

export type PanelGroup = {
  id: string;
  name: string;
  description: string;
  panels: PanelDefinition[];
};

export type FocusState = {
  panelId: string | null;
  lockedPanelId: string | null;
  confidence: number;
  attentionPoint: { x: number; y: number };
};
