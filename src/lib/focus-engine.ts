import { clamp, distance2D, lerp } from "@/lib/math";
import type { FocusState, PanelRuntime } from "@/types/interaction";
import type { FaceInteractionState, InterpretedHandState } from "@/types/vision";

type FocusInput = {
  hand: InterpretedHandState | null;
  face: FaceInteractionState | null;
  panels: PanelRuntime[];
  calibrationBias: { x: number; y: number };
  now: number;
};

export class FocusEngine {
  private candidateId: string | null = null;

  private candidateSince = 0;

  private focusedId: string | null = null;

  private focusedSince = 0;

  private lockedId: string | null = null;

  update({ hand, face, panels, calibrationBias, now }: FocusInput): FocusState {
    const faceAttention = face
      ? {
          x: clamp(face.attention.x + calibrationBias.x * 0.65),
          y: clamp(face.attention.y + calibrationBias.y * 0.65),
        }
      : { x: 0.5, y: 0.5 };

    const attentionPoint = hand
      ? {
          x: lerp(faceAttention.x, hand.screen.x, face ? 0.18 : 0.55),
          y: lerp(faceAttention.y, hand.screen.y, face ? 0.18 : 0.55),
        }
      : faceAttention;

    const mode = !face
      ? "hand-first"
      : face.eyeConfidence > 0.42
        ? "hybrid"
        : "reduced";

    const weightedPanels = panels
      .map((panel) => {
        const anchor = {
          x: 0.5 + panel.position.x * 0.42,
          y: 0.5 + panel.position.y * 0.36,
        };

        const gazeScore = face ? clamp(1 - distance2D(anchor, faceAttention) / 0.5) : 0;
        const handScore = hand ? clamp(1 - distance2D(anchor, hand.screen) / 0.38) : 0;
        const depthScore = clamp(0.45 + panel.position.z * 0.8);
        const baseScore =
          gazeScore * (mode === "hybrid" ? 0.65 : 0.35) +
          handScore * (hand ? (hand.posture === "pinch" ? 0.44 : 0.26) : 0) +
          depthScore * 0.12;

        return {
          panelId: panel.id,
          score: clamp(baseScore),
        };
      })
      .sort((a, b) => b.score - a.score);

    const best = weightedPanels[0];
    if (!best || best.score < 0.28) {
      this.lockedId = null;

      return {
        panelId: this.focusedId,
        lockedPanelId: null,
        confidence: best?.score ?? 0,
        attentionPoint,
      };
    }

    if (best.panelId !== this.candidateId) {
      this.candidateId = best.panelId;
      this.candidateSince = now;
    }

    if (now - this.candidateSince > 120) {
      if (this.focusedId !== best.panelId) {
        this.focusedId = best.panelId;
        this.focusedSince = now;
      }
    }

    if (
      face &&
      face.eyeConfidence > 0.44 &&
      this.focusedId === best.panelId &&
      now - this.focusedSince > 700 &&
      best.score > 0.44
    ) {
      this.lockedId = best.panelId;
    } else if (!face || best.score < 0.34) {
      this.lockedId = null;
    }

    return {
      panelId: this.focusedId ?? best.panelId,
      lockedPanelId: this.lockedId,
      confidence: best.score,
      attentionPoint,
    };
  }
}
