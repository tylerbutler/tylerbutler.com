/**
 * Adapter interface that bridges the play-once state machine to a specific
 * animation player (HTML video, Lottie, etc.).
 */
export interface PlayOncePlayer {
  /** Resume playback from the current position (called on viewport enter). */
  resume(): void;
  /**
   * Continue to the next pass. Called between passes after each loop completes.
   * Video: must reset to start and play. Lottie: no-op (loops automatically).
   */
  play(): void;
  /** Pause without resetting position. */
  pause(): void;
  /** Stop and reset to the first frame. */
  stop(): void;
  /** True when not currently playing. */
  readonly isPaused: boolean;
  /** Register a callback that fires after each complete pass. */
  onPassComplete(cb: () => void): void;
}

/**
 * Attaches a play-once state machine with IntersectionObserver to an element.
 *
 * Plays `playCount` times on first viewport entry, then switches to on-demand
 * mode: replays once on hover, click, or each subsequent viewport entry.
 *
 * @param observeTarget - Element to watch for intersection.
 * @param player - Animation player adapter.
 * @param playCount - Number of passes before switching to on-demand mode.
 * @param interactiveTarget - Element that receives cursor + event listeners
 *   in on-demand mode. Defaults to `observeTarget`.
 */
export function attachPlayOnceObserver(
  observeTarget: HTMLElement,
  player: PlayOncePlayer,
  playCount: number,
  interactiveTarget: HTMLElement = observeTarget,
): void {
  let plays = 0;
  let onDemand = false;

  const replayOnce = () => {
    if (!player.isPaused) return;
    player.stop();
    player.resume();
  };

  player.onPassComplete(() => {
    if (onDemand) {
      player.stop();
      return;
    }
    plays += 1;
    if (plays < playCount) {
      player.play();
      return;
    }
    player.stop();
    onDemand = true;
    interactiveTarget.style.cursor = "pointer";
    interactiveTarget.addEventListener("mouseenter", replayOnce);
    interactiveTarget.addEventListener("click", replayOnce);
  });

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          if (onDemand) replayOnce();
          else player.resume();
        } else if (!onDemand) {
          // Scrolled away mid-sequence: pause so it resumes on re-entry.
          player.pause();
        }
      }
    },
    { threshold: 0.5 },
  );

  observer.observe(observeTarget);
}
