import { CustomPluginOptions } from '../../types/viewPort';

// Viewport config
export const DEFAULT_VIEWPORT_WIDTH = 700;
export const DEFAULT_VIEWPORT_HEIGHT = 700;
export const DEFAULT_IMAGE_WIDTH = 8000;
export const DEFAULT_IMAGE_HEIGHT = 8000;
export const DEFAULT_BRUSH_SIZE = 1;
export const DEFAULT_ZOOM_IN_SCALE = 1.2;
export const DEFAULT_ZOOM_OUT_SCALE = 0.8;

export const DEFAULT_PLUGIN_OPTIONS: CustomPluginOptions = {
  clampZoom: {
    minScale: 1,
    maxScale: 15,
  },
  clamp: {
    direction: 'all',
    left: 0,
    right: DEFAULT_VIEWPORT_WIDTH,
    top: 0,
    bottom: DEFAULT_VIEWPORT_HEIGHT,
    underflow: 'center',
  },
  wheel: {
    percent: 0.1,
  },
  drag: {
    direction: 'all',
  },
  tooltip: {
    enabled: true,
  },
};
