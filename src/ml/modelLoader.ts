import * as cocoSsd from '@tensorflow-models/coco-ssd';
import '@tensorflow/tfjs';

let modelPromise: Promise<cocoSsd.ObjectDetection> | null = null;

export function loadModel(): Promise<cocoSsd.ObjectDetection> {
  if (!modelPromise) {
    modelPromise = cocoSsd.load({ base: 'lite_mobilenet_v2' });
  }
  return modelPromise;
}

export type Detection = cocoSsd.DetectedObject;

export async function detectCats(
  model: cocoSsd.ObjectDetection,
  input: HTMLCanvasElement | HTMLImageElement,
  minScore = 0.5,
): Promise<Detection[]> {
  const all = await model.detect(input);
  return all.filter((d) => d.class === 'cat' && d.score >= minScore);
}
