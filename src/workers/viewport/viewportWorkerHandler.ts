import { Application, Assets } from '@pixi/webworker';
import { OffscreenViewport } from './offscreenViewport.ts';
import { createContent } from './viewportContent.ts';
import { throttle } from '../../utils/throttle.ts';
import { THROTTLE_DELAY } from './viewportConstants.ts';
import { debounce } from '../../utils/debounce.ts';
import { WorkerMessageType, WorkerMessage, InitData, MouseMoveData } from '../../types/viewPort.ts';

let app: Application | undefined;
let viewport: OffscreenViewport | undefined;

function updateVisiblePoints(): void {
  if (!viewport) return;
  const visiblePoints = viewport.getVisiblePoints();
  self.postMessage({
    type: WorkerMessageType.VISIBLE_POINTS_UPDATE,
    data: visiblePoints,
  });
}

const debouncedUpdateVisiblePoints = debounce(updateVisiblePoints, 100);

// Set up render loop for application
function setupRenderLoop(): void {
  if (!viewport) return;
  if (viewport.checkDirty()) {
    self.postMessage({
      type: WorkerMessageType.VIEWPORT_UPDATE,
      data: viewport.getState(),
    });
    debouncedUpdateVisiblePoints();
  }
}

const throttledTooltipUpdate = throttle((data: unknown) => {
  if (!viewport || !viewport.pluginOptions.tooltip.enabled) return;
  const mouseMoveData = data as MouseMoveData;
  const tooltipData = viewport.checkMouseOverPoint(mouseMoveData);
  self.postMessage({
    type: WorkerMessageType.TOOLTIP_UPDATE,
    data: tooltipData,
  });
}, THROTTLE_DELAY);

const handleMouseLeave = (): void => {
  if (!viewport) return;
  viewport.handleMouseLeave();
  self.postMessage({
    type: WorkerMessageType.TOOLTIP_UPDATE,
    data: null,
  });
};

async function handleInit(data: InitData): Promise<void> {
  if (!data.viewport || !data.canvas || !data.imagePath) return;

  // Initialize PixiJS application
  app = new Application({
    width: data.viewport.screenWidth,
    height: data.viewport.screenHeight,
    view: data.canvas,
    antialias: true,
    backgroundAlpha: 0,
  });

  // Create viewport
  viewport = new OffscreenViewport({
    screenWidth: data.viewport.screenWidth,
    screenHeight: data.viewport.screenHeight,
    worldWidth: data.viewport.worldWidth,
    worldHeight: data.viewport.worldHeight,
    pluginOptions: data.viewport.plugins,
  });

  // Add viewport to stage
  app.stage.addChild(viewport);

  // Create and add viewport content
  const texture = await Assets.load(data.imagePath);
  await createContent(app, viewport, texture, data.renderedData);

  // Set up render loop
  app.ticker.add(setupRenderLoop);

  // Send initialization complete message
  self.postMessage({
    type: WorkerMessageType.INIT_COMPLETE,
    data: viewport.getState(),
  });

  // Send rendered message after first render
  app.renderer.once('postrender', () => {
    self.postMessage({ type: WorkerMessageType.INITIAL_RENDER_COMPLETE });
  });
}

export function handleViewportWorkerMessage(event: MessageEvent<WorkerMessage>): void {
  const message = event.data;

  switch (message.type) {
    case WorkerMessageType.INIT:
      handleInit(message.data);
      break;

    case WorkerMessageType.WHEEL:
      if (viewport) {
        viewport.handleWheel(message.data);
      }
      break;

    case WorkerMessageType.MOUSE_DOWN:
      if (viewport) {
        viewport.handleMouseDown(message.data);
      }
      break;

    case WorkerMessageType.MOUSE_MOVE:
      if (viewport) {
        viewport.handleMouseMove(message.data);
        throttledTooltipUpdate(message.data);
      }
      break;

    case WorkerMessageType.MOUSE_UP:
      if (viewport) {
        viewport.handleMouseUp(message.data);
      }
      break;

    case WorkerMessageType.MOUSE_LEAVE:
      if (viewport) {
        handleMouseLeave();
      }
      break;

    case WorkerMessageType.ZOOM:
      if (viewport && message.data.scale) {
        viewport.zoomAt(
          message.data.scale,
          message.data.center || {
            x: viewport.screenWidth / 2,
            y: viewport.screenHeight / 2,
          }
        );
      }
      break;

    case WorkerMessageType.CENTER:
      if (viewport && message.data) {
        viewport.moveCenter(message.data.point);
      }
      break;

    case WorkerMessageType.RESET:
      if (viewport) {
        viewport.scale.set(1);
        viewport.moveToCenter();
      }
      break;
  }
}
