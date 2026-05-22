/**
 * Pure functions that turn a COCO-SSD bounding box into a mustache transform.
 *
 * COCO-SSD only gives a box around the whole cat, not face landmarks, so we
 * use a heuristic: the face is typically in the upper portion of the bounding
 * box, and the nose/mouth sits a bit above the vertical midline. The constants
 * `verticalAnchor` and `widthRatio` are tunable so the UI can expose sliders.
 *
 * This module is intentionally framework-free so it can be unit-tested in
 * isolation and reused if the detection backend changes in the future.
 */

export interface BoundingBox {
  /** Top-left x in image pixels. */
  x: number;
  /** Top-left y in image pixels. */
  y: number;
  /** Width in image pixels. */
  width: number;
  /** Height in image pixels. */
  height: number;
}

export interface PlacementOptions {
  /**
   * Fraction of the bounding-box height (from the top) at which to place the
   * mustache's center. ~0.45 puts it just above the vertical midline, which
   * is where a cat's nose typically sits in a frontal photo.
   */
  verticalAnchor: number;
  /** Mustache width as a fraction of the bounding-box width. */
  widthRatio: number;
  /** Horizontal offset in pixels (positive = right). */
  offsetX?: number;
  /** Vertical offset in pixels (positive = down). */
  offsetY?: number;
  /** Rotation in radians, applied around the mustache center. */
  rotation?: number;
}

export interface MustacheTransform {
  /** Center x in image pixels. */
  centerX: number;
  /** Center y in image pixels. */
  centerY: number;
  /** Final width in image pixels. */
  width: number;
  /** Final height in image pixels, derived from `width` and the asset's aspect ratio. */
  height: number;
  /** Rotation in radians around the center. */
  rotation: number;
}

export const DEFAULT_PLACEMENT: PlacementOptions = {
  verticalAnchor: 0.45,
  widthRatio: 0.55,
  offsetX: 0,
  offsetY: 0,
  rotation: 0,
};

/**
 * Computes where to draw a mustache for a single detection.
 *
 * @param box  bounding box of the detected cat
 * @param mustacheAspect  height / width of the mustache asset
 * @param options  tunable placement parameters
 */
export function computeMustacheTransform(
  box: BoundingBox,
  mustacheAspect: number,
  options: PlacementOptions = DEFAULT_PLACEMENT,
): MustacheTransform {
  const { verticalAnchor, widthRatio, offsetX = 0, offsetY = 0, rotation = 0 } = options;
  const width = box.width * widthRatio;
  const height = width * mustacheAspect;
  const centerX = box.x + box.width / 2 + offsetX;
  const centerY = box.y + box.height * verticalAnchor + offsetY;
  return { centerX, centerY, width, height, rotation };
}
