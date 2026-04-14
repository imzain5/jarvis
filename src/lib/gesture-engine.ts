import type { NormalizedLandmark } from "@mediapipe/tasks-vision";

import { average, clamp, distance2D, distance3D, lerp, mapRange } from "@/lib/math";
import type { PanelRuntime } from "@/types/interaction";
import type {
  HandObservation,
  HandPosture,
  InterpretedHandState,
  SwipeDirection,
  Vector2,
} from "@/types/vision";

const FINGER_TIPS = [4, 8, 12, 16, 20];
const FINGER_PIPS = [3, 6, 10, 14, 18];

type HandHistory = {
  smoothed: Vector2;
  previous: Vector2;
  previousTime: number;
  posture: HandPosture;
  postureSince: number;
  lastSwipeAt: number;
};

export function extractHandObservations(
  landmarksList: NormalizedLandmark[][],
  handednesses: Array<Array<{ categoryName?: string; score?: number }>> = [],
): HandObservation[] {
  return landmarksList.map((landmarks, index) => {
    const palmCenter = meanLandmark(landmarks, [0, 5, 9, 17]);
    const wrist = landmarks[0];
    const handedness = handednesses[index]?.[0]?.categoryName;
    const palmWidth = distance3D(landmarks[5], landmarks[17]) || 0.12;
    const pinchDistance = distance3D(landmarks[4], landmarks[8]);
    const pinchStrength = clamp(1 - pinchDistance / (palmWidth * 0.8));
    const openness = average(
      FINGER_TIPS.map((tipIndex, fingerIndex) => {
        const tipDistance = distance3D(landmarks[tipIndex], wrist);
        const pipDistance = distance3D(landmarks[FINGER_PIPS[fingerIndex]], wrist);
        return clamp(mapRange(tipDistance - pipDistance, 0.01, 0.08, 0, 1));
      }),
    );

    return {
      id: `${handedness ?? "Unknown"}-${index}`,
      handedness:
        handedness === "Left" || handedness === "Right" ? handedness : "Unknown",
      score: handednesses[index]?.[0]?.score ?? 0.75,
      screen: {
        x: clamp(1 - lerp(palmCenter.x, landmarks[8].x, 0.25)),
        y: clamp(lerp(palmCenter.y, landmarks[8].y, 0.18)),
      },
      wrist: {
        x: 1 - wrist.x,
        y: wrist.y,
        z: wrist.z,
      },
      pinchStrength,
      openness,
      grabStrength: clamp(1 - openness * 0.9 + pinchStrength * 0.12),
    };
  });
}

function meanLandmark(landmarks: NormalizedLandmark[], indices: number[]) {
  const total = indices.reduce(
    (accumulator, landmarkIndex) => {
      const landmark = landmarks[landmarkIndex];
      return {
        x: accumulator.x + landmark.x,
        y: accumulator.y + landmark.y,
        z: accumulator.z + landmark.z,
      };
    },
    { x: 0, y: 0, z: 0 },
  );

  return {
    x: total.x / indices.length,
    y: total.y / indices.length,
    z: total.z / indices.length,
  };
}

function detectPosture(hand: HandObservation): HandPosture {
  if (hand.pinchStrength > 0.7) {
    return "pinch";
  }

  if (hand.openness > 0.72) {
    return "open-palm";
  }

  if (hand.grabStrength > 0.65) {
    return "grab";
  }

  return "neutral";
}

function rankHand(hand: HandObservation) {
  const centerBias = 1 - distance2D(hand.screen, { x: 0.5, y: 0.5 });
  return hand.score * 0.7 + hand.pinchStrength * 0.22 + centerBias * 0.08;
}

function buildPanelPull(panel: PanelRuntime, hand: InterpretedHandState | null) {
  if (!hand) {
    return 0;
  }

  const panelPoint = {
    x: 0.5 + panel.position.x * 0.42,
    y: 0.5 + panel.position.y * 0.36,
  };

  return clamp(1 - distance2D(panelPoint, hand.screen) / 0.36);
}

export class GestureEngine {
  private history = new Map<string, HandHistory>();

  private previousSpreadDistance = 0;

  interpret(hands: HandObservation[], panels: PanelRuntime[], now: number): InterpretedHandState | null {
    if (!hands.length) {
      this.previousSpreadDistance = 0;
      return null;
    }

    const sortedHands = [...hands].sort((a, b) => rankHand(b) - rankHand(a));
    const primary = sortedHands[0];
    const history = this.history.get(primary.id) ?? {
      smoothed: primary.screen,
      previous: primary.screen,
      previousTime: now,
      posture: "neutral" as const,
      postureSince: now,
      lastSwipeAt: 0,
    };

    const smoothed = {
      x: lerp(history.smoothed.x, primary.screen.x, 0.34),
      y: lerp(history.smoothed.y, primary.screen.y, 0.34),
    };

    const dt = Math.max(16, now - history.previousTime);
    const velocity = {
      x: (smoothed.x - history.previous.x) / (dt / 1000),
      y: (smoothed.y - history.previous.y) / (dt / 1000),
    };

    const posture = detectPosture(primary);
    const postureSince = posture === history.posture ? history.postureSince : now;
    const holdMs = now - postureSince;
    let swipeDirection: SwipeDirection = null;
    let lastSwipeAt = history.lastSwipeAt;

    if (
      Math.abs(velocity.x) > 1.2 &&
      Math.abs(velocity.x) > Math.abs(velocity.y) * 1.4 &&
      posture !== "pinch" &&
      now - history.lastSwipeAt > 900
    ) {
      swipeDirection = velocity.x > 0 ? "right" : "left";
      lastSwipeAt = now;
    }

    let spreadIntent = 0;
    if (sortedHands[1]) {
      const secondary = sortedHands[1];
      const bothPinching = primary.pinchStrength > 0.68 && secondary.pinchStrength > 0.68;
      const currentSpread = distance2D(primary.screen, secondary.screen);

      if (bothPinching && this.previousSpreadDistance > 0) {
        spreadIntent = clamp(mapRange(currentSpread - this.previousSpreadDistance, 0.005, 0.08, 0, 1));
      }

      this.previousSpreadDistance = bothPinching ? currentSpread : 0;
    } else {
      this.previousSpreadDistance = 0;
    }

    const interactionState =
      swipeDirection !== null
        ? "swiping"
        : posture === "open-palm"
          ? "ready"
          : posture === "pinch"
            ? holdMs > 480
              ? "holding"
              : "pinching"
            : posture === "grab"
              ? "holding"
              : "idle";

    const confidence = clamp(
      primary.score * 0.5 +
        primary.pinchStrength * 0.14 +
        primary.openness * 0.2 +
        Math.max(...panels.map((panel) => buildPanelPull(panel, { ...emptyHand, screen: smoothed })), 0) * 0.16,
    );

    this.history.set(primary.id, {
      smoothed,
      previous: smoothed,
      previousTime: now,
      posture,
      postureSince,
      lastSwipeAt,
    });

    return {
      id: primary.id,
      posture,
      interactionState,
      screen: smoothed,
      velocity,
      confidence,
      pinchStrength: primary.pinchStrength,
      openness: primary.openness,
      grabStrength: primary.grabStrength,
      holdMs,
      swipeDirection,
      spreadIntent,
      secondary: sortedHands[1]
        ? {
            screen: sortedHands[1].screen,
            pinchStrength: sortedHands[1].pinchStrength,
          }
        : undefined,
    };
  }
}

const emptyHand: InterpretedHandState = {
  id: "virtual",
  posture: "neutral",
  interactionState: "idle",
  screen: { x: 0.5, y: 0.5 },
  velocity: { x: 0, y: 0 },
  confidence: 0,
  pinchStrength: 0,
  openness: 0,
  grabStrength: 0,
  holdMs: 0,
  swipeDirection: null,
  spreadIntent: 0,
};
