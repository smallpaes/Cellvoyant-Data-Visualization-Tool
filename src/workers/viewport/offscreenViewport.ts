import { Container, Sprite, Texture } from '@pixi/webworker';
import RBush from 'rbush';
import { DEFAULT_VIEWPORT_CONFIG, POINT_DEFAULTS, DEFAULT_PLUGIN_OPTIONS } from './viewportConstants';
import { MouseButtonData, WheelData, MouseMoveData, RBushItem, TooltipData, CustomPluginOptions, PluginOptions } from '../../types/viewPort';

interface Point {
  x: number;
  y: number;
}

interface ViewportOptions {
  screenWidth?: number;
  screenHeight?: number;
  worldWidth?: number;
  worldHeight?: number;
  pluginOptions?: CustomPluginOptions;
}

interface DragPlugin {
  active: boolean;
  last: Point | null;
}

interface PinchPlugin {
  active: boolean;
  center: Point | null;
  distance: number;
}

interface WheelPlugin {
  smoothing: number | null;
}

interface PluginsState {
  drag: DragPlugin;
  pinch: PinchPlugin;
  wheel: WheelPlugin;
}

export class OffscreenViewport extends Container {
  screenWidth: number;
  screenHeight: number;
  worldWidth: number;
  worldHeight: number;
  private _worldCenter: Point;
  dotIndex: RBush<RBushItem>;
  spriteMap: Map<string, Sprite>;
  private _lastHoveredPoint: RBushItem | null;
  pointTexture: Texture | null;
  hoveredPointTexture: Texture | null;
  basePointSize: number;
  basePointRadius: number;
  scaleFactor: number | null;
  pluginsState: PluginsState;
  pluginOptions: PluginOptions;
  minScale: number;
  maxScale: number;
  private _dirty: boolean;

  constructor(options: ViewportOptions = {}) {
    super();
    // Screen dimensions (canvas size)
    this.screenWidth = options.screenWidth || DEFAULT_VIEWPORT_CONFIG.screenWidth;
    this.screenHeight = options.screenHeight || DEFAULT_VIEWPORT_CONFIG.screenHeight;
    
    // World dimensions (content size)
    this.worldWidth = options.worldWidth || DEFAULT_VIEWPORT_CONFIG.worldWidth;
    this.worldHeight = options.worldHeight || DEFAULT_VIEWPORT_CONFIG.worldHeight;
    
    // Initial scales and positions
    this.scale.set(1);
    
    // Save center of the world for initial positioning
    this._worldCenter = {
      x: this.worldWidth / 2,
      y: this.worldHeight / 2
    };
    
    // Center the viewport initially
    this.moveCenter(this._worldCenter);

    // Create RBush index
    this.dotIndex = new RBush();

    // Sprite mapping management
    this.spriteMap = new Map();
    this._lastHoveredPoint = null;
    this.pointTexture = null;
    this.hoveredPointTexture = null;

    // Store base dot info (before any scaling)
    this.basePointSize = POINT_DEFAULTS.basePointSize;
    this.basePointRadius = this.basePointSize / 2;
    this.scaleFactor = null;
    
    // Enable plugins (features)
    this.pluginsState = {
      drag: { active: false, last: null },
      pinch: { active: false, center: null, distance: 0 },
      wheel: { smoothing: null }
    };
    
    // Initialize plugin options
    this.pluginOptions = DEFAULT_PLUGIN_OPTIONS;
    this.addCustomPluginOptions(options.pluginOptions);
    
    // Setup scale limits
    this.minScale = this.pluginOptions.clampZoom.minScale ?? DEFAULT_PLUGIN_OPTIONS.clampZoom.minScale;
    this.maxScale = this.pluginOptions.clampZoom.maxScale ?? DEFAULT_PLUGIN_OPTIONS.clampZoom.maxScale;
    
    // For sending updates to the main thread
    this._dirty = true;
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
          ...userPluginOptions[key]
        }
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
      y: (screenPoint.y - this.y) / this.scale.y
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
      y: worldPoint.y * this.scale.y + this.y
    };
  }
  
  /**
   * Move the center of the viewport to a specific world coordinate
   * @param {Point} point - The point to center on
   */
  moveCenter(point: Point): void {
    this.x = (this.screenWidth / 2) - (point.x * this.scale.x);
    this.y = (this.screenHeight / 2) - (point.y * this.scale.y);
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
    const wheelOptions = this.pluginOptions.wheel;
    
    // Get the direction of zoom
    const sign = wheelOptions.reverse ? -1 : 1;
    
    // Calculate the zoom factor based on delta
    // Using the lineHeight option to scale non-pixel units
    let wheelDelta = -data.deltaY;
    if (data.deltaMode === 1) {
      wheelDelta *= wheelOptions.lineHeight;
    }
    
    const percent = wheelOptions.percent;
    const step = sign * wheelDelta / 1000;
    const scale = Math.pow(2, (1 + percent) * step);
    
    // Create a point for the zoom center
    const point = wheelOptions.center 
      ? { x: this.screenWidth / 2, y: this.screenHeight / 2 } 
      : { x: data.canvasX, y: data.canvasY };
    
    // Apply the zoom
    this.zoomAt(scale, point);
  }
  
  /**
   * Handle mouse down event for dragging
   * @param {MouseButtonData} event - Mouse event data
   */
  handleMouseDown(data: MouseButtonData): void {
    const dragOptions = this.pluginOptions.drag;
    
    // Only handle primary button (left click) by default
    const allowedButtons = dragOptions.mouseButtons === 'all' ? [0, 1, 2] : [0];
    
    if (allowedButtons.includes(data.button) && dragOptions.pressDrag) {
      this.pluginsState.drag.active = true;
      this.pluginsState.drag.last = { x: data.clientX, y: data.clientY };
    }
  }

  findClosestPoint(points: RBushItem[], mousePosition: Point, searchRadius: number): RBushItem | null {
    let closestPoint = null;
    let closestDistance = null;

    for (const point of points) {
      const distance = Math.sqrt(
        Math.pow(point.x - mousePosition.x, 2) + 
        Math.pow(point.y - mousePosition.y, 2)
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
    const currentPointRadius = this.basePointRadius * this.scaleFactor

    // Define search box in world coordinates
    const searchBox = {
      minX: worldPos.x,
      minY: worldPos.y,
      maxX: worldPos.x,
      maxY: worldPos.y
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
      originalY: closestPoint.y
    };
  }

  handleMouseMove(data: MouseMoveData): void {
    const dragData = this.pluginsState.drag;
    const dragOptions = this.pluginOptions.drag;
    
    if (dragData.active && dragData.last) {
      const dx = data.clientX - dragData.last.x;
      const dy = data.clientY - dragData.last.y;
      
      // Apply drag factor
      const factor = dragOptions.factor;
      
      // Handle directional constraints
      if (dragOptions.direction === 'all' || dragOptions.direction === 'x') {
        this.x += dx * factor;
      }
      
      if (dragOptions.direction === 'all' || dragOptions.direction === 'y') {
        this.y += dy * factor;
      }
      
      // Update last position
      dragData.last = { x: data.clientX, y: data.clientY };
      
      // Apply clamping
      this.clamp();
      
      this._dirty = true;
    }
  }

  resetDragData(): void {
    const dragData = this.pluginsState.drag;
    if (dragData.active && dragData.last) {
      dragData.active = false;
      dragData.last = null;
    }
  }

  handleMouseUp(data: MouseButtonData): void {
    const allowedButtons = this.pluginOptions.drag.mouseButtons === 'all' ? [0, 1, 2] : [0];
    if (allowedButtons.includes(data.button)) {
      this.resetDragData();
    }
  }

  handleMouseLeave(): void {
    this.resetDragData();
    this.resetLastHoveredPoint();
  }

  /**
   * Clamps the viewport within the world boundaries
   */
  clamp(): void {
    const clampOptions = this.pluginOptions.clamp;
    
    // Skip if no clamping is enabled
    if (clampOptions.direction === 'none') return;
    
    // Calculate the visible area in world coordinates
    const worldScreenWidth = this.screenWidth / this.scale.x;
    const worldScreenHeight = this.screenHeight / this.scale.y;
    
    // Determine clamping bounds
    const xMin = clampOptions.left === null ? -Infinity : (clampOptions.left || 0);
    const xMax = clampOptions.right === null ? Infinity : (clampOptions.right || this.worldWidth);
    const yMin = clampOptions.top === null ? -Infinity : (clampOptions.top || 0);
    const yMax = clampOptions.bottom === null ? Infinity : (clampOptions.bottom || this.worldHeight);
    
    // Calculate boundaries
    const worldWidth = xMax - xMin;
    const worldHeight = yMax - yMin;
    
    // Handle X-axis clamping
    if (clampOptions.direction === 'all' || clampOptions.direction === 'x') {
      // Handle when content is smaller than screen
      if (worldWidth <= worldScreenWidth) {
        switch (clampOptions.underflow) {
          case 'center':
            this.x = (this.screenWidth - worldWidth * this.scale.x) / 2;
            break;
          case 'left':
            this.x = 0;
            break;
          case 'right':
            this.x = this.screenWidth - worldWidth * this.scale.x;
            break;
          default:
            this.x = 0;
        }
      } else {
        // Content is larger than screen, enforce boundaries
        const rightEdge = -xMin * this.scale.x;
        const leftEdge = this.screenWidth - xMax * this.scale.x;
        
        if (this.x > rightEdge) {
          this.x = rightEdge;
        } else if (this.x < leftEdge) {
          this.x = leftEdge;
        }
      }
    }
    
    // Handle Y-axis clamping
    if (clampOptions.direction === 'all' || clampOptions.direction === 'y') {
      // Handle when content is smaller than screen
      if (worldHeight <= worldScreenHeight) {
        switch (clampOptions.underflow) {
          case 'center':
            this.y = (this.screenHeight - worldHeight * this.scale.y) / 2;
            break;
          case 'top':
            this.y = 0;
            break;
          case 'bottom':
            this.y = this.screenHeight - worldHeight * this.scale.y;
            break;
          default:
            this.y = 0;
        }
      } else {
        // Content is larger than screen, enforce boundaries
        const bottomEdge = -yMin * this.scale.y;
        const topEdge = this.screenHeight - yMax * this.scale.y;
        
        if (this.y > bottomEdge) {
          this.y = bottomEdge;
        } else if (this.y < topEdge) {
          this.y = topEdge;
        }
      }
    }
  }

  resize(width: number, height: number): void {
    // Store the center point before resize
    const center = this.toWorld({
      x: this.screenWidth / 2,
      y: this.screenHeight / 2
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
      minX: (-this.x) / this.scale.x,
      // Top edge of viewport in world coordinates
      minY: (-this.y) / this.scale.y,
      // Right edge of viewport in world coordinates
      maxX: (-this.x + this.screenWidth) / this.scale.x,
      // Bottom edge of viewport in world coordinates
      maxY: (-this.y + this.screenHeight) / this.scale.y
    };
    // Search the R-tree index for points within the visible bounds
    return this.dotIndex.search(visibleBounds).map(point => ({
      x: point.x,
      y: point.y,
      width: point.width,
      height: point.height
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
} 