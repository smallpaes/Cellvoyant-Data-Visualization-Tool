import { Point } from '../../../types/viewPort';

export class WheelPlugin {
  constructor(
    private options: {
      reverse: boolean;
      center: Point | null;
      lineHeight: number;
      percent: number;
    }
  ) {}

  handleWheel(data: { deltaY: number; deltaMode: number; canvasX: number; canvasY: number }): {
    scale: number;
    center: Point;
  } {
    // Get the direction of zoom
    const sign = this.options.reverse ? -1 : 1;

    // Calculate the zoom factor based on delta
    let wheelDelta = -data.deltaY;
    if (data.deltaMode === 1) {
      wheelDelta *= this.options.lineHeight;
    }

    const percent = this.options.percent;
    const step = (sign * wheelDelta) / 1000;
    const scale = Math.pow(2, (1 + percent) * step);

    // Create a point for the zoom center
    const center = this.options.center || { x: data.canvasX, y: data.canvasY };

    return { scale, center };
  }
}
