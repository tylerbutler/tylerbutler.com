/**
 * Maps element bottom position to animation progress [0, 1].
 * Mirrors CSS animation-range: cover 35% cover 50%:
 *   - 0% progress: element bottom at 65% from viewport top (35% covered from below)
 *   - 100% progress: element bottom at 50% from viewport top (50% covered)
 */
export function calcScrollProgress(
  elementBottom: number,
  viewportHeight: number,
): number {
  const start = viewportHeight * 0.65;
  const end = viewportHeight * 0.5;
  return Math.max(0, Math.min(1, (start - elementBottom) / (start - end)));
}
