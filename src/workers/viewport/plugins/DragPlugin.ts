import { Point } from '../../../types/viewPort';

export class DragPlugin {
  private active: boolean = false;
  private last: Point | null = null;

  constructor(
    private options: {
      mouseButtons: 'all' | 'left' | 'middle' | 'right';
      pressDrag: boolean;
      factor: number;
      direction: 'all' | 'x' | 'y';
    }
  ) {}

  handleMouseDown(data: { button: number; clientX: number; clientY: number }): void {
    const allowedButtons =
      this.options.mouseButtons === 'all'
        ? [0, 1, 2]
        : this.options.mouseButtons === 'left'
          ? [0]
          : this.options.mouseButtons === 'middle'
            ? [1]
            : [2];

    if (allowedButtons.includes(data.button) && this.options.pressDrag) {
      this.active = true;
      this.last = { x: data.clientX, y: data.clientY };
    }
  }

  handleMouseMove(data: { clientX: number; clientY: number }): { dx: number; dy: number } | null {
    if (!this.active || !this.last) return null;

    const dx = data.clientX - this.last.x;
    const dy = data.clientY - this.last.y;

    // Update last position
    this.last = { x: data.clientX, y: data.clientY };

    // Apply directional constraints
    const factor = this.options.factor;
    return {
      dx: this.options.direction === 'all' || this.options.direction === 'x' ? dx * factor : 0,
      dy: this.options.direction === 'all' || this.options.direction === 'y' ? dy * factor : 0,
    };
  }

  handleMouseUp(data: { button: number }): void {
    const allowedButtons =
      this.options.mouseButtons === 'all'
        ? [0, 1, 2]
        : this.options.mouseButtons === 'left'
          ? [0]
          : this.options.mouseButtons === 'middle'
            ? [1]
            : [2];
    if (allowedButtons.includes(data.button)) {
      this.reset();
    }
  }

  handleMouseLeave(): void {
    this.reset();
  }

  reset(): void {
    this.active = false;
    this.last = null;
  }

  isActive(): boolean {
    return this.active;
  }
}
