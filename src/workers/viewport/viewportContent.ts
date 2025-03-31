import {
  Sprite,
  Container,
  Graphics,
  RenderTexture,
  Rectangle,
  Texture,
  Application,
} from '@pixi/webworker';
import { POINT_DEFAULTS } from './viewportConstants.ts';
import { OffscreenViewport } from './offscreenViewport.ts';
import { RBushItem, RenderedData } from '../../types/viewPort';

function createBackground(viewport: OffscreenViewport, texture: Texture): Sprite {
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

function generateDataPointId(x: number, y: number): string {
  return `${x}-${y}`;
}

function initRBushItems(viewport: OffscreenViewport, renderedData: RenderedData): RBushItem[] {
  // Prepare items for RBush index
  const items = renderedData.data.map((point) => ({
    minX: point[0] - renderedData.brushSize,
    minY: point[1] - renderedData.brushSize,
    maxX: point[0] + renderedData.brushSize,
    maxY: point[1] + renderedData.brushSize,
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

function createCircle(viewport: OffscreenViewport, lineAlpha: number): Graphics {
  const graphics = new Graphics();
  graphics.lineStyle(POINT_DEFAULTS.lineWidth, POINT_DEFAULTS.lineColor, lineAlpha);
  graphics.drawCircle(
    viewport.basePointSize / 2,
    viewport.basePointSize / 2,
    viewport.basePointSize / 2 - POINT_DEFAULTS.lineWidth / 2
  );
  return graphics;
}

/**
 * Create a RenderTexture containing two circles: normal frame and hovered frame
 * Pixi uses frame switching within that texture to avoid re-binding new textures
 * Allows for batched rendering and fewer draw calls, which is more efficient on GPU
 * @param {Application} app - The Pixi application instance
 * @param {OffscreenViewport} viewport - The viewport instance
 * @returns {RenderTexture} A RenderTexture containing the two circles
 */
function createDataPointSpriteSheet(app: Application, viewport: OffscreenViewport): RenderTexture {
  const renderTexture = RenderTexture.create({
    width: viewport.basePointSize * 2,
    height: viewport.basePointSize,
    resolution: POINT_DEFAULTS.resolution,
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
 * @param {RenderTexture} renderedTexture - The rendered texture containing the two circles
 * @returns {Object} An object containing the normal and hovered frames
 */
function createTextureFrames(
  viewport: OffscreenViewport,
  renderedTexture: RenderTexture
): { normalFrame: Texture; hoverFrame: Texture } {
  const normalFrame = new Texture(
    renderedTexture.baseTexture,
    new Rectangle(0, 0, viewport.basePointSize, viewport.basePointSize)
  );
  const hoverFrame = new Texture(
    renderedTexture.baseTexture,
    new Rectangle(viewport.basePointSize, 0, viewport.basePointSize, viewport.basePointSize)
  );

  viewport.setPointTexture(normalFrame);
  viewport.setHoveredPointTexture(hoverFrame);

  return { normalFrame, hoverFrame };
}

/**
 * Create a data point sprite
 * @param {Texture} normalFrame - The normal frame of the data point sprite
 * @param {number} x - The x coordinate of the data point
 * @param {number} y - The y coordinate of the data point
 * @param {number} scaleFactor - The scale factor of the data point
 * @returns {Sprite} The created data point sprite
 */
function createDataPoint(normalFrame: Texture, x: number, y: number, scaleFactor: number): Sprite {
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
 * @param {RenderedData} renderedData - The data to render
 * @returns {Container} The container holding all data point sprites
 */
function renderDataToViewport(
  app: Application,
  viewport: OffscreenViewport,
  renderedData: RenderedData
): Container {
  const spriteSheet = createDataPointSpriteSheet(app, viewport);
  const { normalFrame } = createTextureFrames(viewport, spriteSheet);

  // Create container for data points
  const sprites = new Container();
  viewport.addChild(sprites);

  // Set scale factor and create data points
  const scaleFactor = (renderedData.brushSize * 2) / viewport.basePointSize;
  viewport.setPointScaleFactor(scaleFactor);

  for (const [x, y] of renderedData.data) {
    const dataPoint = createDataPoint(normalFrame, x, y, scaleFactor);
    sprites.addChild(dataPoint);
    viewport.spriteMap.set(generateDataPointId(x, y), dataPoint);
  }

  return sprites;
}

/**
 * Scale the coordinate values in the rendered data to the viewport coordinates
 * @param {RenderedData} renderedData - The rendered data
 * @returns {RenderedData} The scaled rendered data
 */
function scaleDataCoordinates(renderedData: RenderedData): RenderedData {
  const scaleFactor = renderedData.scaleFactor;
  return {
    ...renderedData,
    data: renderedData.data.map(([x, y, w, h]) => [x * scaleFactor, y * scaleFactor, w, h]),
  };
}

export async function createContent(
  app: Application,
  viewport: OffscreenViewport,
  texture: Texture,
  renderedData: RenderedData
): Promise<void> {
  createBackground(viewport, texture);
  const scaledRenderedData = scaleDataCoordinates(renderedData);
  initRBushItems(viewport, scaledRenderedData);
  renderDataToViewport(app, viewport, scaledRenderedData);
}
