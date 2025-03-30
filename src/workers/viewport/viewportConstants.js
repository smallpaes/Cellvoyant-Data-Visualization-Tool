// Timing constants
export const THROTTLE_DELAY = 16;

// Viewport defaults
export const DEFAULT_VIEWPORT_CONFIG = {
  screenWidth: 800,
  screenHeight: 800,
  worldWidth: 800,
  worldHeight: 800
};

// Application defaults
export const DEFAULT_APP_CONFIG = {
  antialias: true,
  backgroundAlpha: 0
};

// Point rendering constants
export const POINT_DEFAULTS = {
  basePointSize: 8,
  resolution: 2,
  lineWidth: 1,
  lineColor: 0xDC2626,
  lineAlpha: 0.5,
};

export const DEFAULT_PLUGIN_OPTIONS = {
  drag: {
    direction: 'all',
    pressDrag: true,
    wheel: false,
    wheelScroll: 1,
    reverse: false,
    clampWheel: false,
    underflow: 'center',
    factor: 1,
    mouseButtons: 'all',
    keyToPress: null
  },
  pinch: {
    percent: 1,
    noDrag: false,
    center: null
  },
  wheel: {
    percent: 0.1,
    smooth: false,
    interrupt: true,
    reverse: false,
    center: null,
    lineHeight: 20,
    axis: 'all',
    keyToPress: null
  },
  clamp: {
    left: null,
    right: null,
    top: null,
    bottom: null,
    direction: 'all',
    underflow: 'center'
  },
  clampZoom: {
    minWidth: null,
    minHeight: null,
    maxWidth: null,
    maxHeight: null,
    minScale: 0.1,
    maxScale: 5
  },
  bounce: {
    sides: 'all',
    friction: 0.5,
    time: 150,
    bounceBox: null,
    ease: 'easeInOutSine',
    underflow: 'center'
  },
  snap: {
    topLeft: false,
    friction: 0.8,
    time: 1000,
    ease: 'easeInOutSine',
    interrupt: true,
    center: false,
    stop: false
  },
  follow: {
    friction: 0.5,
    acceleration: null,
    radius: null
  },
  mouseEdges: {
    radius: null,
    distance: 20,
    top: null,
    bottom: null,
    left: null,
    right: null,
    speed: 8,
    reverse: false,
    noDecelerate: false,
    linear: false,
    allowButtons: false
  },
  tooltip: {
    enabled: false,
  }
};