import { MEDIAPIPE_ASSETS } from "@/lib/constants";

type VisionModule = typeof import("@mediapipe/tasks-vision");
type GestureRecognizerInstance = Awaited<
  ReturnType<VisionModule["GestureRecognizer"]["createFromOptions"]>
>;
type FaceLandmarkerInstance = Awaited<
  ReturnType<VisionModule["FaceLandmarker"]["createFromOptions"]>
>;

let visionModulePromise: Promise<VisionModule> | null = null;
let gestureRecognizerPromise: Promise<GestureRecognizerInstance> | null = null;
let faceLandmarkerPromise: Promise<FaceLandmarkerInstance> | null = null;

async function getVisionModule() {
  if (!visionModulePromise) {
    visionModulePromise = import("@mediapipe/tasks-vision");
  }

  return visionModulePromise;
}

async function getVisionResolver() {
  const { FilesetResolver } = await getVisionModule();
  return FilesetResolver.forVisionTasks(MEDIAPIPE_ASSETS.wasmRoot);
}

export async function getGestureRecognizer() {
  if (!gestureRecognizerPromise) {
    gestureRecognizerPromise = Promise.all([getVisionResolver(), getVisionModule()]).then(
      ([vision, module]) =>
        module.GestureRecognizer.createFromOptions(vision, {
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
    faceLandmarkerPromise = Promise.all([getVisionResolver(), getVisionModule()]).then(
      ([vision, module]) =>
        module.FaceLandmarker.createFromOptions(vision, {
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
