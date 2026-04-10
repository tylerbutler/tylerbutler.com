import { describe, expect, it } from "vitest";
import { calcScrollProgress } from "../scroll-utils.ts";

describe("calcScrollProgress", () => {
  // viewport 600px: start = 600*0.65 = 390, end = 600*0.50 = 300

  it("returns 0 when element bottom is below the trigger point", () => {
    // elementBottom 500 > start 390 → negative progress → clamped 0
    expect(calcScrollProgress(500, 600)).toBe(0);
  });

  it("returns 1 when element bottom is above the end point", () => {
    // elementBottom 100 < end 300 → progress > 1 → clamped 1
    expect(calcScrollProgress(100, 600)).toBe(1);
  });

  it("returns 0.5 at the midpoint", () => {
    // (390 - 345) / (390 - 300) = 45/90 = 0.5
    expect(calcScrollProgress(345, 600)).toBe(0.5);
  });

  it("clamps to 0 for very large elementBottom values", () => {
    expect(calcScrollProgress(9999, 600)).toBe(0);
  });

  it("clamps to 1 for negative elementBottom values", () => {
    expect(calcScrollProgress(-999, 600)).toBe(1);
  });
});
