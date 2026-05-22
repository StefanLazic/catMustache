import { describe, expect, it } from 'vitest';
import {
  DEFAULT_PLACEMENT,
  computeMustacheTransform,
  type BoundingBox,
} from '../src/ml/placement';

const box: BoundingBox = { x: 100, y: 50, width: 200, height: 300 };

describe('computeMustacheTransform', () => {
  it('centers the mustache horizontally on the bounding box', () => {
    const t = computeMustacheTransform(box, 0.4);
    expect(t.centerX).toBe(200);
  });

  it('places the mustache at the configured vertical anchor', () => {
    const t = computeMustacheTransform(box, 0.4, { ...DEFAULT_PLACEMENT, verticalAnchor: 0.5 });
    expect(t.centerY).toBe(50 + 300 * 0.5);
  });

  it('scales width by the configured ratio and preserves aspect', () => {
    const aspect = 0.25; // height / width
    const t = computeMustacheTransform(box, aspect, { ...DEFAULT_PLACEMENT, widthRatio: 0.6 });
    expect(t.width).toBe(120);
    expect(t.height).toBeCloseTo(30);
  });

  it('applies pixel offsets', () => {
    const t = computeMustacheTransform(box, 0.3, {
      ...DEFAULT_PLACEMENT,
      offsetX: 10,
      offsetY: -5,
    });
    expect(t.centerX).toBe(210);
    expect(t.centerY).toBe(50 + 300 * DEFAULT_PLACEMENT.verticalAnchor - 5);
  });

  it('passes rotation through unchanged', () => {
    const t = computeMustacheTransform(box, 0.3, { ...DEFAULT_PLACEMENT, rotation: 0.5 });
    expect(t.rotation).toBe(0.5);
  });

  it('uses default rotation of 0 when omitted', () => {
    const t = computeMustacheTransform(box, 0.3);
    expect(t.rotation).toBe(0);
  });
});
