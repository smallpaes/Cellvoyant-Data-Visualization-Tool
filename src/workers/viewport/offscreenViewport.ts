import { Container, Sprite, Texture } from '@pixi/webworker';
import RBush from 'rbush';
import {
  DEFAULT_VIEWPORT_CONFIG,
  POINT_DEFAULTS,
  DEFAULT_PLUGIN_OPTIONS,
} from './viewportConstants';
import {
  MouseButtonData,
  WheelData,
  MouseMoveData,
  RBushItem,
  TooltipData,
  CustomPluginOptions,
  PluginOptions,
  Point,
  OffscreenViewportOptions,
} from '../../types/viewPort';
import { DragPlugin, WheelPlugin } from './plugins';

export class OffscreenViewport extends Container {
  // Core viewport properties
  private readonly _worldCenter: Point;
  private _dirty: boolean;
  private _lastHoveredPoint: RBushItem | null;
  private scaleFactor: number | null;

  // Dimensions
  screenWidth: number;
  screenHeight: number;
  worldWidth: number;
  worldHeight: number;

  // Scale limits
  readonly minScale: number;
  readonly maxScale: number;

  // Data structures
  readonly dotIndex: RBush<RBushItem>;
  readonly spriteMap: Map<string, Sprite>;

  // Textures for hover state
  private pointTexture: Texture | null;
  private hoveredPointTexture: Texture | null;

  // Point properties
  readonly basePointSize: number;
  readonly basePointRadius: number;

  // Plugin state and options
  private readonly dragPlugin: DragPlugin;
  private readonly wheelPlugin: WheelPlugin;
  pluginOptions: PluginOptions;

  constructor(options: OffscreenViewportOptions = {}) {
    super();

    // Initialize dimensions: canvas size
    this.screenWidth = options.screenWidth || DEFAULT_VIEWPORT_CONFIG.screenWidth;
    this.screenHeight = options.screenHeight || DEFAULT_VIEWPORT_CONFIG.screenHeight;
    // Initialize dimensions: content size
    this.worldWidth = options.worldWidth || DEFAULT_VIEWPORT_CONFIG.worldWidth;
    this.worldHeight = options.worldHeight || DEFAULT_VIEWPORT_CONFIG.worldHeight;

    // Initialize core properties
    this.scale.set(1);
    this._dirty = true;
    this._lastHoveredPoint = null;
    this.scaleFactor = null;

    // Initialize world center
    this._worldCenter = {
      x: this.worldWidth / 2,
      y: this.worldHeight / 2,
    };

    // Initialize data structures
    this.dotIndex = new RBush();
    this.spriteMap = new Map();

    // Initialize textures
    this.pointTexture = null;
    this.hoveredPointTexture = null;

    // Initialize point properties
    this.basePointSize = POINT_DEFAULTS.basePointSize;
    this.basePointRadius = this.basePointSize / 2;

    // Initialize plugin options
    this.pluginOptions = DEFAULT_PLUGIN_OPTIONS;
    this.addCustomPluginOptions(options.pluginOptions);

    // Initialize plugins
    this.dragPlugin = new DragPlugin(this.pluginOptions.drag);
    this.wheelPlugin = new WheelPlugin(this.pluginOptions.wheel);

    // Initialize scale limits
    this.minScale =
      this.pluginOptions.clampZoom.minScale ?? DEFAULT_PLUGIN_OPTIONS.clampZoom.minScale;
    this.maxScale =
      this.pluginOptions.clampZoom.maxScale ?? DEFAULT_PLUGIN_OPTIONS.clampZoom.maxScale;

    // Center the viewport initially
    this.moveCenter(this._worldCenter);
  }

  addCustomPluginOptions(userPluginOptions?: CustomPluginOptions): void {
    if (!userPluginOptions) return;
    const pluginKeys = Object.keys(userPluginOptions) as Array<keyof typeof userPluginOptions>;
    // Override with user options
    for (const key of pluginKeys) {
      // Merge with default options for the specific plugin
      const defaultOptions = DEFAULT_PLUGIN_OPTIONS[key];
      this.pluginOptions = {
        ...this.pluginOptions,
        [key]: {
          ...defaultOptions,
          ...userPluginOptions[key],
        },
      };
    }
  }

  /**
   * Converts screen coordinates to world coordinates
   * @param {Point} screenPoint - Point in screen coordinates
   * @returns {Point} Point in world coordinates
   */
  toWorld(screenPoint: Point): Point {
    return {
      x: (screenPoint.x - this.x) / this.scale.x,
      y: (screenPoint.y - this.y) / this.scale.y,
    };
  }

  /**
   * Converts world coordinates to screen coordinates
   * @param {Point} worldPoint - Point in world coordinates
   * @returns {Point} Point in screen coordinates
   */
  toScreen(worldPoint: Point): Point {
    return {
      x: worldPoint.x * this.scale.x + this.x,
      y: worldPoint.y * this.scale.y + this.y,
    };
  }

  /**
   * Move the center of the viewport to a specific world coordinate
   * @param {Point} point - The point to center on
   */
  moveCenter(point: Point): void {
    this.x = this.screenWidth / 2 - point.x * this.scale.x;
    this.y = this.screenHeight / 2 - point.y * this.scale.y;
    this._dirty = true;
  }

  /**
   * Move the viewport to the center of the world
   */
  moveToCenter(): void {
    this.moveCenter(this._worldCenter);
  }

  /**
   * Move the viewport by a certain number of pixels
   * @param {number} x - X direction to move
   * @param {number} y - Y direction to move
   */
  move(x: number, y: number): void {
    this.x += x;
    this.y += y;
    this._dirty = true;
  }

  /**
   * Zoom at a specific point
   * @param {number} scale - Scale factor (>1 to zoom in, <1 to zoom out)
   * @param {Point} center - Point in screen coordinates to zoom at
   */
  zoomAt(scale: number, center: Point): void {
    // Get the world position before zooming
    const worldPos = this.toWorld(center);

    // Apply new scale
    const oldScale = this.scale.x;
    let newScale = oldScale * scale;

    // Limit to min/max scale
    newScale = Math.max(this.minScale, Math.min(this.maxScale, newScale));

    // No change if we hit the limit
    if (newScale === oldScale) return;

    // Set the new scale
    this.scale.set(newScale);

    // Move the viewport to keep the zoomed point stationary
    const newScreenPos = this.toScreen(worldPos);
    this.x += center.x - newScreenPos.x;
    this.y += center.y - newScreenPos.y;

    // Apply clamping if enabled
    this.clamp();

    this._dirty = true;
  }

  /**
   * Handle a wheel event for zooming
   * @param {WheelEvent} event - Wheel event data
   */
  handleWheel(data: WheelData): void {
    const wheelResult = this.wheelPlugin.handleWheel(data);
    this.zoomAt(wheelResult.scale, wheelResult.center);
  }

  /**
   * Handle mouse down event for dragging
   * @param {MouseButtonData} event - Mouse event data
   */
  handleMouseDown(data: MouseButtonData): void {
    this.dragPlugin.handleMouseDown(data);
  }

  findClosestPoint(
    points: RBushItem[],
    mousePosition: Point,
    searchRadius: number
  ): RBushItem | null {
    let closestPoint = null;
    let closestDistance = null;

    for (const point of points) {
      const distance = Math.sqrt(
        Math.pow(point.x - mousePosition.x, 2) + Math.pow(point.y - mousePosition.y, 2)
      );

      if (distance < searchRadius && (closestDistance === null || distance < closestDistance)) {
        closestPoint = point;
        closestDistance = distance;
      }
    }

    return closestPoint;
  }

  resetLastHoveredPoint(): void {
    if (!this._lastHoveredPoint) return;
    const lastSprite = this.spriteMap.get(this._lastHoveredPoint.id);
    if (lastSprite && this.pointTexture) {
      lastSprite.texture = this.pointTexture;
    }
    this._lastHoveredPoint = null;
  }

  updateHoverState(closestPoint: RBushItem | null): void {
    if (!closestPoint) {
      this.resetLastHoveredPoint();
      return;
    }

    const isSamePoint = this._lastHoveredPoint && this._lastHoveredPoint.id === closestPoint.id;
    if (isSamePoint) return;

    this.resetLastHoveredPoint();

    // Update new hovered point
    const sprite = this.spriteMap.get(closestPoint.id);
    if (!sprite || !this.hoveredPointTexture) return;
    sprite.texture = this.hoveredPointTexture;
    this._lastHoveredPoint = closestPoint;
  }

  /**
   * Checks if the mouse is over a point and returns the tooltip data if it is
   * @param {MouseMoveData} data - Mouse move event data
   * @returns {TooltipData | null} Tooltip data if the mouse is over a point, otherwise null
   */
  checkMouseOverPoint(data: MouseMoveData): TooltipData | null {
    // Convert mouse screen coordinates to world coordinates
    const worldPos = this.toWorld({ x: data.canvasX, y: data.canvasY });

    // Calculate search radius in world coordinates
    if (!this.scaleFactor) return null;
    const currentPointRadius = this.basePointRadius * this.scaleFactor;

    // Define search box in world coordinates
    const searchBox = {
      minX: worldPos.x,
      minY: worldPos.y,
      maxX: worldPos.x,
      maxY: worldPos.y,
    };

    // Perform spatial query to find dots within the search box
    const results = this.dotIndex.search(searchBox);

    const closestPoint = this.findClosestPoint(results, worldPos, currentPointRadius);

    // Handle hover state changes
    this.updateHoverState(closestPoint);

    if (closestPoint === null) return null;

    return {
      ...this.toScreen({ x: closestPoint.x, y: closestPoint.y }),
      width: closestPoint.width,
      height: closestPoint.height,
      originalX: closestPoint.x,
      originalY: closestPoint.y,
    };
  }

  handleMouseMove(data: MouseMoveData): void {
    const dragResult = this.dragPlugin.handleMouseMove(data);
    if (dragResult) {
      this.move(dragResult.dx, dragResult.dy);
      this.clamp();
      this._dirty = true;
    }
  }

  handleMouseUp(data: MouseButtonData): void {
    this.dragPlugin.handleMouseUp(data);
  }

  handleMouseLeave(): void {
    this.dragPlugin.handleMouseLeave();
    this.resetLastHoveredPoint();
  }

  private clampAxis(
    viewportWorldSize: number,
    min: number,
    max: number,
    screenSize: number,
    scale: number,
    position: 'x' | 'y',
    underflow: 'center' | 'top' | 'bottom' | 'left' | 'right'
  ): void {
    const contentWorldSize = max - min;

    if (contentWorldSize <= viewportWorldSize) {
      this.positionSmallContent(contentWorldSize, screenSize, scale, position, underflow);
    } else {
      this.clampLargeContent(min, max, screenSize, scale, position);
    }
  }

  private positionSmallContent(
    contentWorldSize: number,
    screenSize: number,
    scale: number,
    position: 'x' | 'y',
    underflow: 'center' | 'top' | 'bottom' | 'left' | 'right'
  ): void {
    switch (underflow) {
      case 'center':
        this[position] = this.calculateCenterAlignedPosition(contentWorldSize, screenSize, scale);
        break;
      case position === 'x' ? 'left' : 'top':
        this[position] = 0;
        break;
      case position === 'x' ? 'right' : 'bottom':
        this[position] = this.calculateRightOrBottomEdgePosition(
          contentWorldSize,
          screenSize,
          scale
        );
        break;
      default:
        this[position] = 0;
    }
  }

  private clampLargeContent(
    min: number,
    max: number,
    screenSize: number,
    scale: number,
    position: 'x' | 'y'
  ): void {
    const endEdge = -min * scale;
    const startEdge = screenSize - max * scale;

    if (this[position] > endEdge) {
      this[position] = endEdge;
    } else if (this[position] < startEdge) {
      this[position] = startEdge;
    }
  }

  private calculateCenterAlignedPosition(
    contentWorldSize: number,
    screenSize: number,
    scale: number
  ): number {
    return (screenSize - contentWorldSize * scale) / 2;
  }

  private calculateRightOrBottomEdgePosition(
    contentWorldSize: number,
    screenSize: number,
    scale: number
  ): number {
    return screenSize - contentWorldSize * scale;
  }

  clamp(): void {
    const clampOptions = this.pluginOptions.clamp;
    if (clampOptions.direction === 'none') return;

    const viewportWorldWidth = this.screenWidth / this.scale.x;
    const viewportWorldHeight = this.screenHeight / this.scale.y;

    const xMin = clampOptions.left === null ? -Infinity : clampOptions.left || 0;
    const xMax = clampOptions.right === null ? Infinity : clampOptions.right || this.worldWidth;
    const yMin = clampOptions.top === null ? -Infinity : clampOptions.top || 0;
    const yMax = clampOptions.bottom === null ? Infinity : clampOptions.bottom || this.worldHeight;

    if (clampOptions.direction === 'all' || clampOptions.direction === 'x') {
      this.clampAxis(
        viewportWorldWidth,
        xMin,
        xMax,
        this.screenWidth,
        this.scale.x,
        'x',
        clampOptions.underflow
      );
    }

    if (clampOptions.direction === 'all' || clampOptions.direction === 'y') {
      this.clampAxis(
        viewportWorldHeight,
        yMin,
        yMax,
        this.screenHeight,
        this.scale.y,
        'y',
        clampOptions.underflow
      );
    }
  }

  resize(width: number, height: number): void {
    // Store the center point before resize
    const center = this.toWorld({
      x: this.screenWidth / 2,
      y: this.screenHeight / 2,
    });

    // Update dimensions
    this.screenWidth = width;
    this.screenHeight = height;

    // Re-center the viewport
    this.moveCenter(center);

    // Apply clamping
    this.clamp();

    this._dirty = true;
  }

  getVisiblePoints(): Point[] {
    // Convert viewport bounds to world coordinates
    const visibleBounds = {
      // Left edge of viewport in world coordinates
      minX: -this.x / this.scale.x,
      // Top edge of viewport in world coordinates
      minY: -this.y / this.scale.y,
      // Right edge of viewport in world coordinates
      maxX: (-this.x + this.screenWidth) / this.scale.x,
      // Bottom edge of viewport in world coordinates
      maxY: (-this.y + this.screenHeight) / this.scale.y,
    };
    // Search the R-tree index for points within the visible bounds
    return this.dotIndex.search(visibleBounds).map((point) => ({
      x: point.x,
      y: point.y,
      width: point.width,
      height: point.height,
    }));
  }

  getState(): { x: number; y: number; scale: { x: number; y: number } } {
    return {
      x: this.x,
      y: this.y,
      scale: { x: this.scale.x, y: this.scale.y },
    };
  }

  checkDirty(): boolean {
    const wasDirty = this._dirty;
    this._dirty = false;
    return wasDirty;
  }

  setPointScaleFactor(size: number): void {
    this.scaleFactor = size;
  }

  setPointTexture(texture: Texture): void {
    this.pointTexture = texture;
  }

  setHoveredPointTexture(texture: Texture): void {
    this.hoveredPointTexture = texture;
  }
}
