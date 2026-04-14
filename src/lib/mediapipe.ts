import {
  FaceLandmarker,
  FilesetResolver,
  GestureRecognizer,
} from "@mediapipe/tasks-vision";

import { MEDIAPIPE_ASSETS } from "@/lib/constants";

let gestureRecognizerPromise: Promise<GestureRecognizer> | null = null;
let faceLandmarkerPromise: Promise<FaceLandmarker> | null = null;

async function getVisionResolver() {
  return FilesetResolver.forVisionTasks(MEDIAPIPE_ASSETS.wasmRoot);
}

export async function getGestureRecognizer() {
  if (!gestureRecognizerPromise) {
    gestureRecognizerPromise = getVisionResolver().then((vision) =>
      GestureRecognizer.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: MEDIAPIPE_ASSETS.gestureModel,
        },
        runningMode: "VIDEO",
        numHands: 2,
      }),
    );
  }

  return gestureRecognizerPromise;
}

export async function getFaceLandmarker() {
  if (!faceLandmarkerPromise) {
    faceLandmarkerPromise = getVisionResolver().then((vision) =>
      FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: MEDIAPIPE_ASSETS.faceModel,
        },
        runningMode: "VIDEO",
        numFaces: 1,
        outputFaceBlendshapes: true,
        outputFacialTransformationMatrixes: true,
      }),
    );
  }

  return faceLandmarkerPromise;
}
