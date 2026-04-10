declare module "oridomi" {
  interface OriDomiOptions {
    hPanels?: number;
    vPanels?: number;
    shading?: boolean;
    backface?: boolean;
    speed?: number;
  }

  class OriDomi {
    constructor(element: HTMLElement, options?: OriDomiOptions);
    accordion(angle: number, callback?: () => void): this;
    map(values: number[], callback?: () => void): this;
    fold(angle: number, callback?: () => void): this;
    reset(callback?: () => void): this;
  }

  export = OriDomi;
}
