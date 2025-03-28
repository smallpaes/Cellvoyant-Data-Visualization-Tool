/**
 * Options for clamping the viewport to world boundaries.
 * @property {number | null} left - Clamp to the left boundary.
 * @property {number | null} right - Clamp to the right boundary.
 * @property {number | null} top - Clamp to the top boundary.
 * @property {number | null} bottom - Clamp to the bottom boundary.
 * @property {'all' | 'x' | 'y'} direction - Direction of clamping.
 * @property {'center' | 'top' | 'bottom' | 'left' | 'right'} underflow - Behavior when content is smaller than the viewport.
 */
type ClampPluginOptions = {
  left: number | null;
  right: number | null;
  top: number | null;
  bottom: number | null;
  direction: 'all' | 'x' | 'y';
  underflow: 'center' | 'top' | 'bottom' | 'left' | 'right';
};

// Zoom constraints
/**
 * Options for zooming constraints in the viewport.
 * @property {number | null} minWidth - Minimum width for zooming.
 * @property {number | null} minHeight - Minimum height for zooming.
 * @property {number | null} maxWidth - Maximum width for zooming.
 * @property {number | null} maxHeight - Maximum height for zooming.
 * @property {number} minScale - Minimum scale factor.
 * @property {number} maxScale - Maximum scale factor.
 */
type ClampZoomPluginOptions = {
  minWidth: number | null;
  minHeight: number | null;
  maxWidth: number | null;
  maxHeight: number | null;
  minScale: number;
  maxScale: number;
};

/**
 * Options for dragging the viewport.
 * @property {'all' | 'x' | 'y'} direction - Direction of dragging.
 * @property {boolean} pressDrag - Whether to enable dragging on press.
 * @property {boolean} wheel - Whether to use the wheel to drag.
 * @property {number} wheelScroll - Number of pixels to scroll with the wheel.
 * @property {boolean} reverse - Whether to reverse the dragging direction.
 * @property {boolean} clampWheel - Whether to clamp the wheel to avoid bounce effects.
 * @property {'center' | 'top' | 'bottom' | 'left' | 'right'} underflow - Behavior when dragging exceeds boundaries.
 * @property {number} factor - Factor to multiply drag to increase speed.
 * @property {'all' | 'left' | 'middle' | 'right'} mouseButtons - Which mouse buttons trigger drag.
 * @property {string | null} keyToPress - Key to press for drag to be active.
 */
type DragPluginOptions = {
  direction: 'all' | 'x' | 'y';
  pressDrag: boolean;
  wheel: boolean;
  wheelScroll: number;
  reverse: boolean;
  clampWheel: boolean;
  underflow: 'center' | 'top' | 'bottom' | 'left' | 'right';
  factor: number;
  mouseButtons: 'all' | 'left' | 'middle' | 'right';
  keyToPress: string | null;
};

/**
 * Options for pinch gestures.
 * @property {number} percent - Percent to modify pinch speed.
 * @property {boolean} noDrag - Disable two-finger dragging.
 * @property {{ x: number; y: number } | null} center - Center point during zoom.
 */
type PinchPluginOptions = {
  percent: number;
  noDrag: boolean;
  center: { x: number; y: number } | null;
};

/**
 * Options for wheel interactions.
 * @property {number} percent - Percent to scroll with each spin.
 * @property {boolean} smooth - Smooth the zooming.
 * @property {boolean} interrupt - Stop smoothing with user input.
 * @property {boolean} reverse - Reverse the scroll direction.
 * @property {{ x: number; y: number } | null} center - Center point during zoom.
 * @property {number} lineHeight - Scaling factor for non-DOM_DELTA_PIXEL scrolling events.
 * @property {'all' | 'x' | 'y'} axis - Axis to zoom.
 * @property {string | null} keyToPress - Keys that need to be pressed for wheel to work.
 */
type WheelPluginOptions = {
  percent: number;
  smooth: boolean;
  interrupt: boolean;
  reverse: boolean;
  center: { x: number; y: number } | null;
  lineHeight: number;
  axis: 'all' | 'x' | 'y';
  keyToPress: string | null;
};

/**
 * Options for bounce effects.
 * @property {'all' | 'horizontal' | 'vertical'} sides - Sides to apply bounce.
 * @property {number} friction - Friction to apply to decelerate.
 * @property {number} time - Time in ms to finish bounce.
 * @property {{ x: number; y: number; width: number; height: number } | null} bounceBox - Bounce box to use.
 * @property {string} ease - Ease function to use.
 * @property {'center' | 'top' | 'bottom' | 'left' | 'right'} underflow - Where to place world if too small for screen.
 */
type BouncePluginOptions = {
  sides: 'all' | 'horizontal' | 'vertical';
  friction: number;
  time: number;
  bounceBox: { x: number; y: number; width: number; height: number } | null;
  ease: string;
  underflow: 'center' | 'top' | 'bottom' | 'left' | 'right';
};

/**
 * Options for snapping behavior.
 * @property {boolean} topLeft - Snap to the top-left of viewport.
 * @property {number} friction - Friction/frame to apply if decelerate is active.
 * @property {number} time - Time in ms to snap.
 * @property {string} ease - Ease function to use.
 * @property {boolean} interrupt - Pause snapping with user input.
 * @property {boolean} center - Snap to the center of the camera.
 * @property {boolean} stop - Stops movement on interrupt.
 */
type SnapPluginOptions = {
  topLeft: boolean;
  friction: number;
  time: number;
  ease: string;
  interrupt: boolean;
  center: boolean;
  stop: boolean;
};

/**
 * Options for follow behavior.
 * @property {number} friction - Friction to apply to follow movement.
 * @property {number | null} acceleration - Set acceleration of movement.
 * @property {number | null} radius - Radius of deadzone before movement.
 */
type FollowPluginOptions = {
  friction: number;
  acceleration: number | null;
  radius: number | null;
};

/**
 * Options for mouse edges behavior.
 * @property {number | null} radius - Distance from center of screen in pixels.
 * @property {number} distance - Distance from all sides in pixels.
 * @property {number | null} top - Set top distance (leave unset for no movement).
 * @property {number | null} bottom - Set bottom distance (leave unset for no movement).
 * @property {number | null} left - Set left distance (leave unset for no movement).
 * @property {number | null} right - Set right distance (leave unset for no movement).
 * @property {number} speed - Speed in pixels/frame to move viewport.
 * @property {boolean} reverse - Reverse direction of movement.
 * @property {boolean} noDecelerate - Don't use decelerate plugin.
 * @property {boolean} linear - Use linear movement instead of angled movement.
 * @property {boolean} allowButtons - Allows mouse buttons other than left to trigger mouse edges.
 */
type MouseEdgesPluginOptions = {
  radius: number | null;
  distance: number;
  top: number | null;
  bottom: number | null;
  left: number | null;
  right: number | null;
  speed: number;
  reverse: boolean;
  noDecelerate: boolean;
  linear: boolean;
  allowButtons: boolean;
};

// Combine all plugin options into a single type
/**
 * Options for configuring the viewport plugins.
 * @property {Partial<DragPluginOptions>} drag - Options for drag plugin.
 * @property {Partial<PinchPluginOptions>} pinch - Options for pinch plugin.
 * @property {Partial<WheelPluginOptions>} wheel - Options for wheel plugin.
 * @property {Partial<ClampPluginOptions>} clamp - Options for clamping plugin.
 * @property {Partial<ClampZoomPluginOptions>} clampZoom - Options for zoom constraints.
 * @property {Partial<BouncePluginOptions>} bounce - Options for bounce plugin.
 * @property {Partial<SnapPluginOptions>} snap - Options for snap plugin.
 * @property {Partial<FollowPluginOptions>} follow - Options for follow plugin.
 * @property {Partial<MouseEdgesPluginOptions>} mouseEdges - Options for mouse edges plugin.
 */
export type PluginOptions = {
  drag?: Partial<DragPluginOptions>;
  pinch?: Partial<PinchPluginOptions>;
  wheel?: Partial<WheelPluginOptions>;
  clamp?: Partial<ClampPluginOptions>;
  clampZoom?: Partial<ClampZoomPluginOptions>;
  bounce?: Partial<BouncePluginOptions>;
  snap?: Partial<SnapPluginOptions>;
  follow?: Partial<FollowPluginOptions>;
  mouseEdges?: Partial<MouseEdgesPluginOptions>;
};

export type ViewportInfo ={
  scale: number;
  x: number;
  y: number;
}

export enum WorkerMessageType {
  INIT = 'init',
  INIT_COMPLETE = 'init-complete',
  VIEWPORT_UPDATE = 'viewport-update',
  ZOOM = 'zoom',
  CENTER = 'center',
  RESET = 'reset',
  WHEEL = 'wheel',
  MOUSE_DOWN = 'mousedown',
  MOUSE_MOVE = 'mousemove',
  MOUSE_UP = 'mouseup',
}

export type WorkerMessage = {
  type: WorkerMessageType;
  data?: ViewportInfo;
} & (
  | {
      type: WorkerMessageType.INIT;
      canvas: OffscreenCanvas;
      resolution: number;
      imagePath: string;
      renderedData: {
        data: unknown;
        size: number;
      };
      viewport: {
        screenWidth: number;
        screenHeight: number;
        worldWidth: number;
        worldHeight: number;
        plugins: PluginOptions;
      };
    }
  | {
      type: WorkerMessageType.INIT_COMPLETE;
      data: ViewportInfo;
    }
  | {
      type: WorkerMessageType.VIEWPORT_UPDATE;
      data: ViewportInfo;
    }
  | {
      type: WorkerMessageType.WHEEL;
      deltaY: number;
      deltaMode: number;
      clientX: number;
      clientY: number;
    }
  | {
      type: WorkerMessageType.MOUSE_DOWN | WorkerMessageType.MOUSE_UP;
      button: number;
      clientX: number;
      clientY: number;
    }
  | {
      type: WorkerMessageType.MOUSE_MOVE;
      clientX: number;
      clientY: number;
    }
  | {
      type: WorkerMessageType.ZOOM;
      scale: number;
      center?: { x: number; y: number };
    }
  | {
      type: WorkerMessageType.CENTER;
      point: { x: number; y: number };
    }
  | {
      type: WorkerMessageType.RESET;
    }
);