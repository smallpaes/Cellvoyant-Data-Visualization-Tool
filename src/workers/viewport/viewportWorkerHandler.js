import { Application, Assets } from '@pixi/webworker';
import { OffscreenViewport } from './offscreenViewport';
import { createContent } from './viewportContent';
import { throttle } from '../../utils/throttle';
import { THROTTLE_DELAY } from './viewportConstants';

let app, viewport;

// Set up render loop for application
function setupRenderLoop() {
  if (viewport.checkDirty()) {
    self.postMessage({
      type: 'viewport-update',
      data: viewport.getState()
    });
  }
}

const throttledTooltipUpdate = throttle((data) => {
  if (!viewport || !viewport.pluginOptions.tooltip.enabled) return;
  const tooltipData = viewport.checkMouseOverPoint(data);
  self.postMessage({
    type: 'tooltip-update',
    data: tooltipData
  });
}, THROTTLE_DELAY);

const handleMouseLeave = () => {
  if (!viewport) return;
  viewport.handleMouseLeave();
  self.postMessage({
    type: 'tooltip-update',
    data: null
  });
};

async function handleInit(data, renderedData) {
  // Initialize PixiJS application
  app = new Application({ 
    width: data.viewport.screenWidth, 
    height: data.viewport.screenHeight, 
    view: data.canvas,
    antialias: true,
    backgroundAlpha: 0
  });

  // Create viewport
  viewport = new OffscreenViewport({
    screenWidth: data.viewport.screenWidth,
    screenHeight: data.viewport.screenHeight,
    worldWidth: data.viewport.worldWidth,
    worldHeight: data.viewport.worldHeight,
    plugins: data.viewport.plugins || {}
  });
  
  // Add viewport to stage
  app.stage.addChild(viewport);
  
  // Create and add viewport content
  const texture = await Assets.load(data.imagePath);
  await createContent(app, viewport, texture, renderedData);
  
  // Set up render loop
  app.ticker.add(setupRenderLoop);

  // Send initialization complete message
  self.postMessage({
    type: 'init-complete',
    data: viewport.getState()
  });

  // Send rendered message after first render
  app.renderer.once('postrender', () => {
    self.postMessage({ type: 'RENDERED' });
  });
} 

export function handleViewportWorkerMessage(event) {
  const { type, renderedData, ...data } = event.data;
  
  switch (type) {
    case 'init':
      handleInit(data, renderedData);
      break;
      
    case 'wheel':
      if (viewport) {
        viewport.handleWheel(data);
      }
      break;
      
    case 'mousedown':
      if (viewport) {
        viewport.handleMouseDown(data);
      }
      break;
      
    case 'mousemove':
      if (viewport) {
        viewport.handleMouseMove(data);
        throttledTooltipUpdate(data);
      }
      break;
      
    case 'mouseup':
      if (viewport) {
        viewport.handleMouseUp(data);
      }
      break;

    case 'mouseleave':
      if (viewport) {
        handleMouseLeave()
      }
      break;

    case 'zoom':
      if (viewport) {
        viewport.zoomAt(data.scale, data.center || {
          x: viewport.screenWidth / 2,
          y: viewport.screenHeight / 2
        });
      }
      break;

    case 'center':
      if (viewport) {
        viewport.moveCenter(data.point);
      }
      break;

    case 'reset':
      if (viewport) {
        viewport.scale.set(1);
        viewport.moveToCenter();
      }
      break;
  }
}