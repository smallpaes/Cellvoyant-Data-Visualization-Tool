import { Container } from '@pixi/webworker';
import RBush from 'rbush';
import { DEFAULT_VIEWPORT_CONFIG, POINT_DEFAULTS, DEFAULT_PLUGIN_OPTIONS } from './viewportConstants';

export class OffscreenViewport extends Container {
  constructor(options = {}) {
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

    // Store base dot info (before any scaling)
    this.basePointSize = POINT_DEFAULTS.basePointSize;
    this.basePointRadius = this.basePointSize / 2;
    this.scaleFactor = null;
    
    // Enable plugins (features)
    this.plugins = {
      drag: { active: false, last: null },
      pinch: { active: false, center: null, distance: 0 },
      wheel: { smoothing: null }
    };
    
    // Initialize plugin options
    this.initializePluginOptions(options.plugins);
    
    // Setup scale limits
    this.minScale = this.pluginOptions.clampZoom.minScale;
    this.maxScale = this.pluginOptions.clampZoom.maxScale;
    
    // For sending updates to the main thread
    this._dirty = true;
  }

  initializePluginOptions(userPlugins) {
    // Default plugin options
    this.pluginOptions = DEFAULT_PLUGIN_OPTIONS;

    // Override with user options
    if (userPlugins) {
      Object.keys(userPlugins).forEach(plugin => {
        if (this.pluginOptions[plugin]) {
          this.pluginOptions[plugin] = {
            ...this.pluginOptions[plugin],
            ...userPlugins[plugin]
          };
        }
      });
    }
  }
  
  /**
   * Converts screen coordinates to world coordinates
   * @param {object} screenPoint - Point in screen coordinates
   * @returns {object} Point in world coordinates
   */
  toWorld(screenPoint) {
    return {
      x: (screenPoint.x - this.x) / this.scale.x,
      y: (screenPoint.y - this.y) / this.scale.y
    };
  }
  
  /**
   * Converts world coordinates to screen coordinates
   * @param {object} worldPoint - Point in world coordinates
   * @returns {object} Point in screen coordinates
   */
  toScreen(worldPoint) {
    return {
      x: worldPoint.x * this.scale.x + this.x,
      y: worldPoint.y * this.scale.y + this.y
    };
  }
  
  /**
   * Move the center of the viewport to a specific world coordinate
   * @param {object} point - The point to center on
   */
  moveCenter(point) {
    this.x = (this.screenWidth / 2) - (point.x * this.scale.x);
    this.y = (this.screenHeight / 2) - (point.y * this.scale.y);
    this._dirty = true;
  }

  /**
   * Move the viewport to the center of the world
   */
  moveToCenter() {
    this.moveCenter(this._worldCenter);
  }
  
  /**
   * Move the viewport by a certain number of pixels
   * @param {number} x - X direction to move
   * @param {number} y - Y direction to move
   */
  move(x, y) {
    this.x += x;
    this.y += y;
    this._dirty = true;
  }
  
  /**
   * Zoom at a specific point
   * @param {number} scale - Scale factor (>1 to zoom in, <1 to zoom out)
   * @param {object} center - Point in screen coordinates to zoom at
   */
  zoomAt(scale, center) {
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
   * @param {object} event - Wheel event data
   */
  handleWheel(event) {
    const wheelOptions = this.pluginOptions.wheel;
    
    // Get the direction of zoom
    const sign = wheelOptions.reverse ? -1 : 1;
    
    // Calculate the zoom factor based on delta
    // Using the lineHeight option to scale non-pixel units
    let wheelDelta = -event.deltaY;
    if (event.deltaMode === 1) {
      wheelDelta *= wheelOptions.lineHeight;
    }
    
    const percent = wheelOptions.percent;
    const step = sign * wheelDelta / 1000;
    const scale = Math.pow(2, (1 + percent) * step);
    
    // Create a point for the zoom center
    const point = wheelOptions.center 
      ? { x: this.screenWidth / 2, y: this.screenHeight / 2 } 
      : { x: event.canvasX, y: event.canvasY };
    
    // Apply the zoom
    this.zoomAt(scale, point);
  }/**
   * Handle a wheel event for zooming
   * @param {object} event - Wheel event data
   */
  handleWheel(event) {
    const wheelOptions = this.pluginOptions.wheel;
    
    // Get the direction of zoom
    const sign = wheelOptions.reverse ? -1 : 1;
    
    // Calculate the zoom factor based on delta
    // Using the lineHeight option to scale non-pixel units
    let wheelDelta = -event.deltaY;
    if (event.deltaMode === 1) {
      wheelDelta *= wheelOptions.lineHeight;
    }
    
    const percent = wheelOptions.percent;
    const step = sign * wheelDelta / 1000;
    const scale = Math.pow(2, (1 + percent) * step);
    
    // Create a point for the zoom center
    const point = wheelOptions.center 
      ? { x: this.screenWidth / 2, y: this.screenHeight / 2 } 
      : { x: event.canvasX, y: event.canvasY };
    
    // Apply the zoom
    this.zoomAt(scale, point);
  }
  
  /**
   * Handle mouse down event for dragging
   * @param {object} event - Mouse event data
   */
  handleMouseDown(event) {
    const dragOptions = this.pluginOptions.drag;
    
    // Only handle primary button (left click) by default
    const allowedButtons = dragOptions.mouseButtons === 'all' ? [0, 1, 2] : [0];
    
    if (allowedButtons.includes(event.button) && dragOptions.pressDrag) {
      this.plugins.drag.active = true;
      this.plugins.drag.last = { x: event.clientX, y: event.clientY };
    }
  }

  /**
   * Check if the mouse is over a point
   * @param {object} event - Mouse event data
   * @returns {boolean} True if the mouse is over a point
   */
  checkMouseOverPoint(event) {
    const worldPos = this.toWorld({ x: event.canvasX, y: event.canvasY });
    
    // Calculate search radius in world coordinates
    // We divide by scale because we're converting from screen to world coordinates
    const currentDotRadius = (this.basePointRadius * this.scaleFactor);

    // Define search box in world coordinates
    const searchBox = {
      minX: worldPos.x,
      minY: worldPos.y,
      maxX: worldPos.x ,
      maxY: worldPos.y
    };

    // Perform spatial query to find dots within the search box
    const results = this.dotIndex.search(searchBox);

    // Validate results
    let closestDot = null;
    let closestDistance = null;

    for (const dot of results) {
      const distance = Math.sqrt(
        Math.pow(dot.x - worldPos.x, 2) + 
        Math.pow(dot.y - worldPos.y, 2)
      );

      if (distance < currentDotRadius && (closestDistance === null || distance < closestDistance)) {
        closestDot = dot;
        closestDistance = distance;
      }
    }

    if (closestDot === null) return null;

     return {
      ...this.toScreen({ x: closestDot.x, y: closestDot.y }),
      width: closestDot.width,
      height: closestDot.height,
      originalX: closestDot.x,
      originalY: closestDot.y
    };
  }
  
  /**
   * Handle mouse move event for dragging
   * @param {object} event - Mouse event data
   */
  handleMouseMove(event) {
    const dragData = this.plugins.drag;
    const dragOptions = this.pluginOptions.drag;
    
    if (dragData.active && dragData.last) {
      const dx = event.clientX - dragData.last.x;
      const dy = event.clientY - dragData.last.y;
      
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
      dragData.last = { x: event.clientX, y: event.clientY };
      
      // Apply clamping
      this.clamp();
      
      this._dirty = true;
    }
  }
  
  /**
   * Handle mouse up event to end dragging
   * @param {object} event - Mouse event data
   */
  handleMouseUp(event) {
    const dragData = this.plugins.drag;
    const allowedButtons = this.pluginOptions.drag.mouseButtons === 'all' ? [0, 1, 2] : [0];
    
    if (allowedButtons.includes(event.button)) {
      dragData.active = false;
      dragData.last = null;
    }
  }
  
  /**
   * Clamp the viewport to world boundaries
   */
  clamp() {
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
  
  /**
   * Handle viewport resize
   * @param {number} width - New width
   * @param {number} height - New height
   */
  resize(width, height) {
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
  
  /**
   * Get the current viewport state for sending to main thread
   * @returns {object} Current state
   */
  getState() {
    return {
      x: this.x,
      y: this.y,
      scale: this.scale.x,
      width: this.screenWidth,
      height: this.screenHeight
    };
  }
  
  /**
   * Check if the viewport state has changed
   * @returns {boolean} True if state changed
   */
  checkDirty() {
    if (this._dirty) {
      this._dirty = false;
      return true;
    }
    return false;
  }

  setPointScaleFactor(size) {
    if (typeof size !== 'number' || size <= 0) {
      throw new Error('Scale factor must be a positive number');
    }
    this.scaleFactor = size;
  }
} 