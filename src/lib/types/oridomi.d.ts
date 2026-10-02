declare module "oridomi" {
  interface OriDomiOptions {
    hPanels?: number;
    vPanels?: number | number[];
    shading?: boolean | "hard" | "soft";
    backface?: boolean;
    speed?: number;
    ripple?: boolean | number;
    perspective?: number;
    maxAngle?: number;
    touchEnabled?: boolean;
    touchSensitivity?: number;
    easingMethod?: string;
    gapNudge?: number;
  }

  class OriDomi {
    constructor(element: HTMLElement | string, options?: OriDomiOptions);
    accordion(angle: number, anchor?: string, callback?: () => void): this;
    reveal(angle: number, anchor?: string, callback?: () => void): this;
    stairs(angle: number, anchor?: string, callback?: () => void): this;
    curl(angle: number, anchor?: string, callback?: () => void): this;
    fracture(angle: number, anchor?: string, callback?: () => void): this;
    twist(angle: number, anchor?: string, callback?: () => void): this;
    ramp(angle: number, anchor?: string, callback?: () => void): this;
    collapse(anchor?: string, callback?: () => void): this;
    foldUp(anchor?: string, callback?: () => void): this;
    unfold(callback?: () => void): this;
    reset(callback?: () => void): this;
    freeze(callback?: () => void): this;
    unfreeze(): this;
    destroy(callback?: () => void): this;
    map(fn: (angle: number, index: number, length: number) => number): (angle: number) => this;
    setSpeed(ms: number): this;
    setRipple(dir?: number): this;
    enableTouch(): this;
    disableTouch(): this;
    wait(ms: number): this;
    emptyQueue(): this;
    modifyContent(fn: (el: HTMLElement, anchor: string, index: number) => void): this;
    static isSupported: boolean;
    isFoldedUp: boolean;
    isFrozen: boolean;
  }

  export = OriDomi;
}
