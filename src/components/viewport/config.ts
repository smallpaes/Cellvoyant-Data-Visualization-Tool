import { CustomPluginOptions } from '../../types/viewPort';

export const DEFAULT_PLUGIN_OPTIONS: CustomPluginOptions = {
  clampZoom: {
    minScale: 1,
    maxScale: 15,
  },
  clamp: {
    direction: 'all',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
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
