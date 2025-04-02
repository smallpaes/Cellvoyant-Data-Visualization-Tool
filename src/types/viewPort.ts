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
  direction: 'all' | 'x' | 'y' | 'none';
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

type TooltipPluginOptions = {
  enabled: boolean;
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
export type CustomPluginOptions = {
  drag?: Partial<DragPluginOptions>;
  pinch?: Partial<PinchPluginOptions>;
  wheel?: Partial<WheelPluginOptions>;
  clamp?: Partial<ClampPluginOptions>;
  clampZoom?: Partial<ClampZoomPluginOptions>;
  bounce?: Partial<BouncePluginOptions>;
  snap?: Partial<SnapPluginOptions>;
  follow?: Partial<FollowPluginOptions>;
  mouseEdges?: Partial<MouseEdgesPluginOptions>;
  tooltip?: Partial<TooltipPluginOptions>;
};

export type PluginOptions = {
  drag: DragPluginOptions;
  pinch: PinchPluginOptions;
  wheel: WheelPluginOptions;
  clamp: ClampPluginOptions;
  clampZoom: ClampZoomPluginOptions;
  bounce: BouncePluginOptions;
  snap: SnapPluginOptions;
  follow: FollowPluginOptions;
  mouseEdges: MouseEdgesPluginOptions;
  tooltip: TooltipPluginOptions;
};

/**
 * Information about the current viewport state
 */
export type ViewportInfo = {
  scale: {
    x: number;
    y: number;
  };
  x: number;
  y: number;
};

export type DataPoint = [number, number, number, number];

export type RenderedData = {
  data: DataPoint[];
  brushSize: number;
  scaleFactor: number;
};

export enum WorkerMessageType {
  INIT = 'init',
  INIT_COMPLETE = 'init-complete',
  VIEWPORT_UPDATE = 'viewport-update',
  VISIBLE_POINTS_UPDATE = 'visible-points-update',
  ZOOM = 'zoom',
  CENTER = 'center',
  RESET = 'reset',
  WHEEL = 'wheel',
  MOUSE_DOWN = 'mousedown',
  MOUSE_MOVE = 'mousemove',
  MOUSE_UP = 'mouseup',
  MOUSE_LEAVE = 'mouseleave',
  TOOLTIP_UPDATE = 'tooltip-update',
  INITIAL_RENDER_COMPLETE = 'initial-render-complete',
}

export type TooltipData = {
  x: number;
  y: number;
  width: number;
  height: number;
  originalX: number;
  originalY: number;
};

type BaseWorkerMessage = {
  type: WorkerMessageType;
};

export type InitData = {
  canvas: OffscreenCanvas;
  imagePath: string;
  renderedData: RenderedData;
  viewport: {
    screenWidth: number;
    screenHeight: number;
    worldWidth: number;
    worldHeight: number;
    plugins: Partial<CustomPluginOptions>;
  };
};

export type InitMessage = BaseWorkerMessage & {
  type: WorkerMessageType.INIT;
  data: InitData;
};

export type InitCompleteMessage = BaseWorkerMessage & {
  type: WorkerMessageType.INIT_COMPLETE;
  data: ViewportInfo;
};

export type ViewportUpdateMessage = BaseWorkerMessage & {
  type: WorkerMessageType.VIEWPORT_UPDATE;
  data: ViewportInfo;
};

export type WheelData = Pick<WheelEvent, 'deltaY' | 'deltaMode'> & {
  canvasX: number;
  canvasY: number;
};

export type WheelMessage = BaseWorkerMessage & {
  type: WorkerMessageType.WHEEL;
  data: WheelData;
};

export type MouseButtonData = Pick<MouseEvent, 'button' | 'clientX' | 'clientY'>;

export type MouseButtonMessage = BaseWorkerMessage & {
  type: WorkerMessageType.MOUSE_DOWN | WorkerMessageType.MOUSE_UP;
  data: MouseButtonData;
};

export type MouseMoveData = Pick<MouseEvent, 'clientX' | 'clientY'> & {
  canvasX: number;
  canvasY: number;
};

export type MouseMoveMessage = BaseWorkerMessage & {
  type: WorkerMessageType.MOUSE_MOVE;
  data: MouseMoveData;
};

export type ZoomData = {
  scale: number;
  center?: { x: number; y: number };
};

export type ZoomMessage = BaseWorkerMessage & {
  type: WorkerMessageType.ZOOM;
  data: ZoomData;
};

export type CenterMessage = BaseWorkerMessage & {
  type: WorkerMessageType.CENTER;
  data: { point: { x: number; y: number } };
};

export type ResetMessage = BaseWorkerMessage & {
  type: WorkerMessageType.RESET;
};

export type TooltipUpdateMessage = BaseWorkerMessage & {
  type: WorkerMessageType.TOOLTIP_UPDATE;
  data: null | TooltipData;
};

export type MouseLeaveMessage = BaseWorkerMessage & {
  type: WorkerMessageType.MOUSE_LEAVE;
};

export type InitialRenderCompleteMessage = BaseWorkerMessage & {
  type: WorkerMessageType.INITIAL_RENDER_COMPLETE;
};

export type VisiblePointsUpdateMessage = BaseWorkerMessage & {
  type: WorkerMessageType.VISIBLE_POINTS_UPDATE;
  data: VisiblePoint[];
};

export type VisiblePoint = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type WorkerMessage =
  | InitMessage
  | InitCompleteMessage
  | ViewportUpdateMessage
  | WheelMessage
  | MouseButtonMessage
  | MouseMoveMessage
  | ZoomMessage
  | CenterMessage
  | ResetMessage
  | TooltipUpdateMessage
  | MouseLeaveMessage
  | VisiblePointsUpdateMessage
  | InitialRenderCompleteMessage;

export type Point = {
  x: number;
  y: number;
};

export type OffscreenViewportOptions = {
  screenWidth?: number;
  screenHeight?: number;
  worldWidth?: number;
  worldHeight?: number;
  pluginOptions?: CustomPluginOptions;
};

export type DragPlugin = {
  active: boolean;
  last: Point | null;
};

export type PinchPlugin = {
  active: boolean;
  center: Point | null;
  distance: number;
};

export type WheelPlugin = {
  smoothing: number | null;
};

export type PluginsState = {
  drag: DragPlugin;
  pinch: PinchPlugin;
  wheel: WheelPlugin;
};

export type RBushItem = {
  id: string;
  x: number;
  y: number;
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
};
