import { Point } from '../../../types/viewPort';

export class PinchPlugin {
  private active: boolean = false;
  private center: Point | null = null;
  private distance: number = 0;

  constructor(private options: { percent: number }) {}

  handlePinchStart(center: Point, distance: number): void {
    this.active = true;
    this.center = center;
    this.distance = distance;
  }

  handlePinchMove(distance: number): { scale: number; center: Point } | null {
    if (!this.active || !this.center) return null;

    const delta = distance - this.distance;
    const percent = this.options.percent;
    const scale = Math.pow(2, ((1 + percent) * delta) / 1000);

    return { scale, center: this.center };
  }

  handlePinchEnd(): void {
    this.reset();
  }

  reset(): void {
    this.active = false;
    this.center = null;
    this.distance = 0;
  }

  isActive(): boolean {
    return this.active;
  }
}
