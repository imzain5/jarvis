"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import type { Category, NormalizedLandmark } from "@mediapipe/tasks-vision";

import { CALIBRATION_POINTS, CAMERA_SETTINGS } from "@/lib/constants";
import { FocusEngine } from "@/lib/focus-engine";
import { extractHandObservations, GestureEngine } from "@/lib/gesture-engine";
import { clamp, lerp, mapRange } from "@/lib/math";
import { getFaceLandmarker, getGestureRecognizer } from "@/lib/mediapipe";
import { useJarvisStore } from "@/store/app-store";
import type { FaceInteractionState } from "@/types/vision";

const LEFT_IRIS = [468, 469, 470, 471, 472];
const RIGHT_IRIS = [473, 474, 475, 476, 477];

type CalibrationAccumulator = {
  target: { x: number; y: number };
  readings: Array<{ x: number; y: number }>;
};

function meanLandmark(landmarks: NormalizedLandmark[], indices: number[]) {
  const total = indices.reduce(
    (accumulator, index) => ({
      x: accumulator.x + landmarks[index].x,
      y: accumulator.y + landmarks[index].y,
      z: accumulator.z + landmarks[index].z,
    }),
    { x: 0, y: 0, z: 0 },
  );

  return {
    x: total.x / indices.length,
    y: total.y / indices.length,
    z: total.z / indices.length,
  };
}

function getBlendshape(blendshapes: Category[] | undefined, name: string) {
  return blendshapes?.find((shape) => shape.categoryName === name)?.score ?? 0;
}

function normalizeBetween(value: number, a: number, b: number) {
  const min = Math.min(a, b);
  const max = Math.max(a, b);
  return clamp((value - min) / Math.max(0.0001, max - min));
}

function extractFaceObservation(
  landmarks: NormalizedLandmark[] | undefined,
  blendshapes: Category[] | undefined,
): FaceInteractionState | null {
  if (!landmarks) {
    return null;
  }

  const nose = landmarks[1];
  const leftOuter = landmarks[33];
  const leftInner = landmarks[133];
  const rightInner = landmarks[362];
  const rightOuter = landmarks[263];
  const leftUpper = landmarks[159];
  const leftLower = landmarks[145];
  const rightUpper = landmarks[386];
  const rightLower = landmarks[374];
  const leftIris = meanLandmark(landmarks, LEFT_IRIS);
  const rightIris = meanLandmark(landmarks, RIGHT_IRIS);
  const eyeCenterX = (leftInner.x + rightInner.x) / 2;
  const eyeCenterY = (leftUpper.y + rightUpper.y) / 2;
  const eyeDistance = Math.abs(rightInner.x - leftInner.x);
  const yaw = clamp(((nose.x - eyeCenterX) / Math.max(eyeDistance, 0.001)) * 2.1, -1, 1);
  const pitch = clamp(((eyeCenterY - nose.y) / Math.max(eyeDistance, 0.001)) * 3.6, -1, 1);
  const roll = clamp(
    ((leftOuter.y - rightOuter.y) / Math.max(Math.abs(rightOuter.x - leftOuter.x), 0.001)) * 3.2,
    -1,
    1,
  );
  const lean = clamp(mapRange(eyeDistance, 0.09, 0.22, 0, 1));
  const leftRatioX = normalizeBetween(leftIris.x, leftOuter.x, leftInner.x);
  const rightRatioX = normalizeBetween(rightIris.x, rightOuter.x, rightInner.x);
  const leftRatioY = normalizeBetween(leftIris.y, leftUpper.y, leftLower.y);
  const rightRatioY = normalizeBetween(rightIris.y, rightUpper.y, rightLower.y);
  const blinkLeft = getBlendshape(blendshapes, "eyeBlinkLeft");
  const blinkRight = getBlendshape(blendshapes, "eyeBlinkRight");
  const blinkStrength = (blinkLeft + blinkRight) / 2;
  const horizontalGaze = ((leftRatioX - 0.5) + (rightRatioX - 0.5)) / 2;
  const verticalGaze = ((leftRatioY - 0.5) + (rightRatioY - 0.5)) / 2;
  const attention = {
    x: clamp(0.5 - yaw * 0.26 - horizontalGaze * 0.34),
    y: clamp(0.5 - pitch * 0.16 + verticalGaze * 0.24),
  };
  const eyeConfidence = clamp(0.28 + eyeDistance * 2.2 - blinkStrength * 0.18);

  return {
    score: 0.86,
    yaw,
    pitch,
    roll,
    lean,
    blinkStrength,
    blinkDetected: blinkStrength > 0.62,
    gaze: {
      x: clamp(0.5 - horizontalGaze * 0.72),
      y: clamp(0.5 + verticalGaze * 0.72),
    },
    attention,
    eyeConfidence,
    headConfidence: clamp(0.38 + eyeDistance * 1.8),
    mode: eyeConfidence > 0.42 ? "hybrid" : "reduced",
  };
}

export function useVisionSystem() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const requestIdRef = useRef<number | null>(null);
  const lastProcessAtRef = useRef(0);
  const mountedRef = useRef(true);
  const gestureEngineRef = useRef(new GestureEngine());
  const focusEngineRef = useRef(new FocusEngine());
  const calibrationRef = useRef<CalibrationAccumulator | null>(null);
  const calibrationStartedAtRef = useRef(0);
  const calibrationBiasesRef = useRef<Array<{ x: number; y: number }>>([]);
  const armedUntilRef = useRef(0);
  const lastSwipeRef = useRef(0);
  const lastExpandRef = useRef(0);
  const [runtimeError, setRuntimeError] = useState<string | null>(null);

  const {
    cameraEnabled,
    cameraStatus,
    calibrationBias,
    calibrationStatus,
    calibrationIndex,
    panels,
    selectedPanelId,
    expandedPanelId,
    enableCameraRequest,
    setCameraStatus,
    setVisionReady,
    setTrackingMode,
    setHandState,
    setFaceState,
    setSystemArmed,
    setFocusState,
    cyclePanelGroup,
    setPanelPosition,
    springPanelsHome,
    touchPanel,
    setSelectedPanel,
    setExpandedPanel,
    advanceCalibration,
    finishCalibration,
  } = useJarvisStore((state) => state);

  const updateFrame = useEffectEvent(async () => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) {
      requestIdRef.current = window.requestAnimationFrame(() => {
        void updateFrame();
      });
      return;
    }

    const now = performance.now();
    if (now - lastProcessAtRef.current < 55) {
      requestIdRef.current = window.requestAnimationFrame(() => {
        void updateFrame();
      });
      return;
    }
    lastProcessAtRef.current = now;

    try {
      const [gestureRecognizer, faceLandmarker] = await Promise.all([
        getGestureRecognizer(),
        getFaceLandmarker(),
      ]);

      const gestureResult = gestureRecognizer.recognizeForVideo(video, now);
      const faceResult = faceLandmarker.detectForVideo(video, now);
      const rawHands = extractHandObservations(
        gestureResult.landmarks ?? [],
        gestureResult.handednesses ?? [],
      );
      const face = extractFaceObservation(
        faceResult.faceLandmarks?.[0],
        faceResult.faceBlendshapes?.[0]?.categories,
      );
      const hand = gestureEngineRef.current.interpret(rawHands, panels, now);
      const focus = focusEngineRef.current.update({
        hand,
        face,
        panels,
        calibrationBias,
        now,
      });
      const trackingMode = !face ? (hand ? "hand-first" : "reduced") : face.mode;

      if (hand?.posture === "open-palm" && hand.confidence > 0.36) {
        armedUntilRef.current = now + 1200;
      }

      const systemArmed =
        now < armedUntilRef.current ||
        (hand?.posture === "pinch" && selectedPanelId !== null) ||
        hand?.posture === "grab";

      if (hand?.swipeDirection && now - lastSwipeRef.current > 900) {
        lastSwipeRef.current = now;
        cyclePanelGroup(hand.swipeDirection);
      }

      const targetPanelId = focus.lockedPanelId ?? focus.panelId;

      if (systemArmed && hand?.posture === "pinch" && targetPanelId && !selectedPanelId) {
        setSelectedPanel(targetPanelId);
        touchPanel(targetPanelId);
      }

      if (selectedPanelId && hand?.posture === "pinch" && hand.pinchStrength > 0.6) {
        const desiredX = clamp((hand.screen.x - 0.5) / 0.42, -0.72, 0.72);
        const desiredY = clamp((hand.screen.y - 0.5) / 0.36, -0.62, 0.62);
        const selectedPanel = panels.find((panel) => panel.id === selectedPanelId);

        if (selectedPanel) {
          setPanelPosition(selectedPanelId, {
            x: lerp(selectedPanel.position.x, desiredX, 0.24),
            y: lerp(selectedPanel.position.y, desiredY, 0.24),
            z: lerp(selectedPanel.position.z, 0.28 + hand.pinchStrength * 0.1, 0.22),
          });
          touchPanel(selectedPanelId);
        }
      } else {
        springPanelsHome();
      }

      if (selectedPanelId && hand && hand.pinchStrength < 0.34) {
        setSelectedPanel(null);
      }

      const expandTarget = selectedPanelId ?? focus.lockedPanelId ?? focus.panelId;
      const canExpand = Boolean(expandTarget) && now - lastExpandRef.current > 1100;

      if (
        canExpand &&
        hand &&
        ((hand.posture === "grab" && hand.holdMs > 420) ||
          (hand.posture === "pinch" && hand.holdMs > 880 && focus.lockedPanelId === expandTarget) ||
          hand.spreadIntent > 0.42)
      ) {
        lastExpandRef.current = now;
        setExpandedPanel(expandedPanelId === expandTarget ? null : expandTarget);
      }

      if (canExpand && face?.blinkDetected && focus.lockedPanelId) {
        lastExpandRef.current = now;
        setExpandedPanel(expandedPanelId === focus.lockedPanelId ? null : focus.lockedPanelId);
      }

      if (calibrationStatus === "running" && face) {
        const target = CALIBRATION_POINTS[calibrationIndex];

        if (target) {
          if (
            !calibrationRef.current ||
            calibrationRef.current.target.x !== target.x ||
            calibrationRef.current.target.y !== target.y
          ) {
            calibrationRef.current = {
              target,
              readings: [],
            };
            calibrationStartedAtRef.current = now;
          }

          calibrationRef.current.readings.push(face.attention);

          if (now - calibrationStartedAtRef.current > 900) {
            const readings = calibrationRef.current.readings;
            const averageReading = readings.reduce(
              (accumulator, reading) => ({
                x: accumulator.x + reading.x / readings.length,
                y: accumulator.y + reading.y / readings.length,
              }),
              { x: 0, y: 0 },
            );
            const bias = {
              x: target.x - averageReading.x,
              y: target.y - averageReading.y,
            };
            calibrationBiasesRef.current.push(bias);

            if (calibrationIndex < CALIBRATION_POINTS.length - 1) {
              advanceCalibration();
              calibrationRef.current = {
                target: CALIBRATION_POINTS[calibrationIndex + 1],
                readings: [],
              };
              calibrationStartedAtRef.current = now;
            } else {
              const aggregateBias = calibrationBiasesRef.current.reduce(
                (accumulator, entry) => ({
                  x: accumulator.x + entry.x / calibrationBiasesRef.current.length,
                  y: accumulator.y + entry.y / calibrationBiasesRef.current.length,
                }),
                { x: 0, y: 0 },
              );
              finishCalibration(aggregateBias);
              calibrationRef.current = null;
              calibrationBiasesRef.current = [];
            }
          }
        }
      }

      setHandState(hand);
      setFaceState(face ? { ...face, mode: trackingMode } : null);
      setTrackingMode(trackingMode);
      setSystemArmed(Boolean(systemArmed));
      setFocusState(focus);
      setVisionReady(true);
      setRuntimeError(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Vision system failed to process a frame.";
      setRuntimeError(message);
      setCameraStatus("error");
    }

    requestIdRef.current = window.requestAnimationFrame(() => {
      void updateFrame();
    });
  });

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (requestIdRef.current) {
        window.cancelAnimationFrame(requestIdRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (!cameraEnabled || cameraStatus === "granted" || cameraStatus === "denied") {
      return;
    }

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: CAMERA_SETTINGS,
          audio: false,
        });

        if (!mountedRef.current) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setCameraStatus("granted");
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Camera permission was denied or the device is unavailable.";
        setRuntimeError(message);
        setCameraStatus("denied");
      }
    }

    void startCamera();
  }, [cameraEnabled, cameraStatus, setCameraStatus]);

  useEffect(() => {
    if (cameraStatus !== "granted") {
      calibrationRef.current = null;
      calibrationBiasesRef.current = [];
      return;
    }

    requestIdRef.current = window.requestAnimationFrame(() => {
      void updateFrame();
    });

    return () => {
      if (requestIdRef.current) {
        window.cancelAnimationFrame(requestIdRef.current);
      }
    };
  }, [cameraStatus, updateFrame]);

  useEffect(() => {
    if (calibrationStatus !== "running") {
      calibrationRef.current = null;
      calibrationBiasesRef.current = [];
    }
  }, [calibrationStatus]);

  return {
    videoRef,
    runtimeError,
    enableCameraRequest,
  };
}
