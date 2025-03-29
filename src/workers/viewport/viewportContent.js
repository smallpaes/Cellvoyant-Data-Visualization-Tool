import { Sprite, Container, Graphics, RenderTexture, Rectangle, Texture } from '@pixi/webworker';
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

function generateDataPointId(x, y) {
  return `${x}-${y}`;
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
    id: generateDataPointId(point[0], point[1]),
    width: point[2],
    height: point[3],
  }));

  // Bulk load items into RBush
  viewport.dotIndex.load(items);

  return items;
}

function createCircle(viewport, lineAlpha) {
  const graphics = new Graphics();
  graphics.lineStyle(
    POINT_DEFAULTS.lineWidth, 
    POINT_DEFAULTS.lineColor, 
    lineAlpha
  );
  graphics.drawCircle(
    viewport.basePointSize / 2, 
    viewport.basePointSize / 2, 
    (viewport.basePointSize / 2) - POINT_DEFAULTS.lineWidth / 2
  );
  return graphics;
}

/**
 * Create a RenderTexture containing two circles: normal frame and hovered frame
 * Pixi uses frame switching within that texture to avoid re-binding new textures
 * Allows for batched rendering and fewer draw calls, which is more efficient on GPU
 * @param {OffscreenViewport} viewport - The viewport instance
 * @returns {Texture} A RenderTexture containing the two circles
 */
function createDataPointSpriteSheet(app, viewport) {
  const renderTexture = RenderTexture.create({ 
    width: viewport.basePointSize * 2, 
    height: viewport.basePointSize,
    resolution: POINT_DEFAULTS.resolution
  });

  // Create a container to hold the two circles
  const circlesContainer = new Container();

  const normalStateCircle = createCircle(viewport, POINT_DEFAULTS.lineAlpha);
  normalStateCircle.x = 0;
  circlesContainer.addChild(normalStateCircle);

  const hoverStateCircle = createCircle(viewport, POINT_DEFAULTS.hoverLineAlpha);
  hoverStateCircle.x = viewport.basePointSize;
  circlesContainer.addChild(hoverStateCircle);

  app.renderer.render(circlesContainer, { renderTexture });
  circlesContainer.destroy({ children: true });

  return renderTexture;
}

/**
 * This RenderTexture is created once, and then different parts of it (the frames) 
 * are referenced by creating new Texture() objects that point to specific regions
 * of the RenderTexture
 * @param {OffscreenViewport} viewport - The viewport instance
 * @param {Texture} renderedTexture - The rendered texture containing the two circles
 * @returns {Object} An object containing the normal and hovered frames
 */
function createTextureFrames(viewport, renderedTexture) {
  const normalFrame = new Texture(renderedTexture, new Rectangle(0, 0, viewport.basePointSize, viewport.basePointSize));
  const hoverFrame = new Texture(renderedTexture, new Rectangle(viewport.basePointSize, 0, viewport.basePointSize, viewport.basePointSize));
  
  viewport.pointTexture = normalFrame;
  viewport.hoveredPointTexture = hoverFrame;
  
  return { normalFrame, hoverFrame };
}

/**
 * Create a data point sprite
 * @param {Texture} normalFrame - The normal frame of the data point sprite
 * @param {number} x - The x coordinate of the data point
 * @param {number} y - The y coordinate of the data point
 * @param {number} scaleFactor - The scale factor of the data point
 */
function createDataPoint(normalFrame, x, y, scaleFactor) {
  const dataPoint = new Sprite(normalFrame);
  dataPoint.x = x;
  dataPoint.y = y;
  dataPoint.anchor.set(0.5);
  dataPoint.scale.set(scaleFactor);
  return dataPoint;
}

/**
 * Renders data points to the viewport using sprite sheets for efficient GPU rendering
 * @param {Application} app - The Pixi application instance
 * @param {OffscreenViewport} viewport - The viewport instance
 * @param {Object} renderedData - The data to render
 * @returns {Container} The container holding all data point sprites
 */
function renderDataToViewport(app, viewport, renderedData) {
  const spriteSheet = createDataPointSpriteSheet(app, viewport, POINT_DEFAULTS.lineAlpha);
  const { normalFrame } = createTextureFrames(viewport, spriteSheet);

  // Create container for data points
  const sprites = new Container();
  viewport.addChild(sprites);

  // Set scale factor and create data points
  const scaleFactor = (renderedData.size * 2) / viewport.basePointSize;
  viewport.setPointScaleFactor(scaleFactor);

  for (let [x, y] of renderedData.data) {
    const dataPoint = createDataPoint(normalFrame, x, y, scaleFactor);
    sprites.addChild(dataPoint);
    viewport.spriteMap.set(generateDataPointId(x, y), dataPoint);
  }

  return sprites;
}

export async function createContent(app, viewport, texture, renderedData) {
  createBackground(viewport, texture);
  initRBushItems(viewport, renderedData);
  renderDataToViewport(app, viewport, renderedData);
} 