import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import {
  computeMustacheTransform,
  type BoundingBox,
  type PlacementOptions,
} from '../ml/placement';

export interface EditorCanvasHandle {
  getCanvas: () => HTMLCanvasElement | null;
}

interface Props {
  image: HTMLImageElement | null;
  mustache: HTMLImageElement | null;
  boxes: BoundingBox[];
  placement: PlacementOptions;
  showDebug: boolean;
}

/**
 * Renders the source image plus a mustache overlay for each detection onto a
 * canvas. The canvas is sized to the image's natural resolution so that the
 * exported PNG keeps full quality. CSS scales it down for display.
 */
export const EditorCanvas = forwardRef<EditorCanvasHandle, Props>(function EditorCanvas(
  { image, mustache, boxes, placement, showDebug },
  ref,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useImperativeHandle(ref, () => ({ getCanvas: () => canvasRef.current }), []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0);

    if (!mustache) return;
    const mustacheAspect = mustache.naturalHeight / mustache.naturalWidth;

    const drawBoxes: BoundingBox[] =
      boxes.length > 0
        ? boxes
        : [
            // Fallback: place the mustache around the center of the photo
            // so the user can still apply one even when no cat was detected.
            {
              x: image.naturalWidth * 0.25,
              y: image.naturalHeight * 0.25,
              width: image.naturalWidth * 0.5,
              height: image.naturalHeight * 0.5,
            },
          ];

    for (const box of drawBoxes) {
      const t = computeMustacheTransform(box, mustacheAspect, placement);
      ctx.save();
      ctx.translate(t.centerX, t.centerY);
      if (t.rotation) ctx.rotate(t.rotation);
      ctx.drawImage(mustache, -t.width / 2, -t.height / 2, t.width, t.height);
      ctx.restore();

      if (showDebug) {
        ctx.save();
        ctx.strokeStyle = '#4f46e5';
        ctx.lineWidth = Math.max(2, image.naturalWidth / 400);
        ctx.strokeRect(box.x, box.y, box.width, box.height);
        ctx.restore();
      }
    }
  }, [image, mustache, boxes, placement, showDebug]);

  return (
    <div className="canvas-wrap">
      {image ? <canvas ref={canvasRef} /> : <p>Upload an image to get started.</p>}
    </div>
  );
});
