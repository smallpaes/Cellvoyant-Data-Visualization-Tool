import { CustomPluginOptions } from '../../types/viewPort';

export const DEFAULT_VIEWPORT_WIDTH = 800;
export const DEFAULT_VIEWPORT_HEIGHT = 800;
export const DEFAULT_IMAGE_WIDTH = 8000;
export const DEFAULT_IMAGE_HEIGHT = 8000;
export const DEFAULT_SCALE_FACTOR = DEFAULT_IMAGE_WIDTH / DEFAULT_VIEWPORT_WIDTH;

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
