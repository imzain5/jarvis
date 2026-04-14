export type Vector2 = {
  x: number;
  y: number;
};

export type Vector3 = Vector2 & {
  z: number;
};

export type HandPosture = "open-palm" | "pinch" | "grab" | "neutral";

export type SwipeDirection = "left" | "right" | null;

export type HandObservation = {
  id: string;
  handedness: "Left" | "Right" | "Unknown";
  score: number;
  screen: Vector2;
  wrist: Vector3;
  pinchStrength: number;
  openness: number;
  grabStrength: number;
};

export type FaceObservation = {
  score: number;
  yaw: number;
  pitch: number;
  roll: number;
  lean: number;
  blinkStrength: number;
  blinkDetected: boolean;
  gaze: Vector2;
  attention: Vector2;
  eyeConfidence: number;
  headConfidence: number;
};

export type VisionSnapshot = {
  timestamp: number;
  hands: HandObservation[];
  face: FaceObservation | null;
};

export type InterpretedHandState = {
  id: string;
  posture: HandPosture;
  interactionState: "idle" | "ready" | "pinching" | "dragging" | "holding" | "swiping";
  screen: Vector2;
  velocity: Vector2;
  confidence: number;
  pinchStrength: number;
  openness: number;
  grabStrength: number;
  holdMs: number;
  swipeDirection: SwipeDirection;
  spreadIntent: number;
  secondary?: {
    screen: Vector2;
    pinchStrength: number;
  };
};

export type FaceInteractionState = FaceObservation & {
  mode: "hybrid" | "hand-first" | "reduced";
};
