import { Sprite, Container, Graphics, RenderTexture } from '@pixi/webworker';
import { POINT_DEFAULTS } from './viewportConstants';

function createBackground(viewport, texture) {
  // Create background image
  const image = new Sprite(texture);
  image.x = 0;
  image.y = 0;
  image.width = viewport.worldWidth;
  image.height = viewport.worldHeight;
  image.zIndex = -1;
  viewport.addChild(image);
  return image;
}

function initRBushItems(viewport, renderedData) {
  // Prepare items for RBush index
  const items = renderedData.data.map((point, i) => ({
    minX: point[0] - renderedData.size,
    minY: point[1] - renderedData.size,
    maxX: point[0] + renderedData.size,
    maxY: point[1] + renderedData.size,
    x: point[0],
    y: point[1],
    index: i,
    width: point[2],
    height: point[3]
  }));

  // Bulk load items into RBush
  viewport.dotIndex.load(items);

  return items;
}

function createDataPointTexture(app, viewport) {
  // Create point texture
  const graphics = new Graphics();
  graphics.lineStyle(
    POINT_DEFAULTS.lineWidth, 
    POINT_DEFAULTS.lineColor, 
    POINT_DEFAULTS.lineAlpha
  );
  graphics.drawCircle(
    viewport.basePointSize / 2, 
    viewport.basePointSize / 2, 
    (viewport.basePointSize / 2) - POINT_DEFAULTS.lineWidth / 2
  );

  const renderTexture = RenderTexture.create({
    width: viewport.basePointSize,
    height: viewport.basePointSize,
    resolution: POINT_DEFAULTS.resolution
  });

  // Render the graphics to the texture
  app.renderer.render(graphics, {
    renderTexture
  });

  return renderTexture;
}

function renderDataToViewport(app, viewport, renderedData) {
  const pointTexture = createDataPointTexture(app, viewport);

  // Create container for data points
  const sprites = new Container();
  viewport.addChild(sprites);

  // Set scale factor and create data points
  const scaleFactor = (renderedData.size * 2) / viewport.basePointSize;
  viewport.setPointScaleFactor(scaleFactor);

  for (let i = 0; i < renderedData.data.length; i++) {
    const dataPoint = new Sprite(pointTexture);
    dataPoint.x = renderedData.data[i][0];
    dataPoint.y = renderedData.data[i][1];
    dataPoint.anchor.set(0.5);
    dataPoint.scale.set(scaleFactor);
    sprites.addChild(dataPoint);
  }

  return sprites;
}

export async function createContent(app, viewport, texture, renderedData) {
  createBackground(viewport, texture);
  initRBushItems(viewport, renderedData);
  renderDataToViewport(app, viewport, renderedData);
} 