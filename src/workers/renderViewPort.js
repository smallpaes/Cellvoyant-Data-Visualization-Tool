import { Application, Assets, Sprite, Container, Graphics, RenderTexture } from '@pixi/webworker';



/**
 * ViewportWorker - A class that brings pixi-viewport functionality to web workers
 * Implements core viewport features while being compatible with @pixi/webworker
 */
class ViewportWorker extends Container {
  constructor(options = {}) {
    super();
    
    // Screen dimensions (canvas size)
    this.screenWidth = options.screenWidth || 800;
    this.screenHeight = options.screenHeight || 600;
    
    // World dimensions (content size)
    this.worldWidth = options.worldWidth || 2000;
    this.worldHeight = options.worldHeight || 2000;
    
    // Initial scales and positions
    this.scale.set(1);
    
    // Save center of the world for initial positioning
    this._worldCenter = {
      x: this.worldWidth / 2,
      y: this.worldHeight / 2
    };
    
    // Center the viewport initially
    this.moveCenter(this._worldCenter);
    
    // Enable plugins (features)
    this.plugins = {
      drag: { active: false, last: null },
      pinch: { active: false, center: null, distance: 0 },
      wheel: { smoothing: null }
    };
    
    // Plugins options
    this.pluginOptions = {
      drag: {
        direction: 'all',     // 'all', 'x', or 'y'
        pressDrag: true,      // whether click to drag is active
        wheel: false,         // use wheel to drag instead of scroll
        wheelScroll: 1,       // number of pixels to scroll with wheel
        reverse: false,       // reverse the direction of the wheel scroll
        clampWheel: false,    // clamp wheel(to avoid weird bounce effect)
        underflow: 'center',  // what to do when drag exceeds boundaries
        factor: 1,            // factor to multiply drag to increase the speed
        mouseButtons: 'all',  // changes which mouse buttons trigger drag
        keyToPress: null      // key to press for drag to be active
      },
      pinch: {
        percent: 1,           // percent to modify pinch speed
        noDrag: false,        // disable two-finger dragging
        center: null          // place this point at center during zoom instead of center of two fingers
      },
      wheel: {
        percent: 0.1,         // percent to scroll with each spin
        smooth: false,        // smooth the zooming by providing the number of frames to zoom
        interrupt: true,      // stop smoothing with any user input on the viewport
        reverse: false,       // reverse the direction of the scroll
        center: null,         // place this point at center during zoom
        lineHeight: 20,       // scaling factor for non-DOM_DELTA_PIXEL scrolling events
        axis: 'all',          // axis to zoom
        keyToPress: null      // keys that need to be pressed for wheel to work
      },
      clamp: {
        left: null,          // whether to clamp to the left and at what value
        right: null,         // whether to clamp to the right and at what value
        top: null,           // whether to clamp to the top and at what value
        bottom: null,        // whether to clamp to the bottom and at what value
        direction: 'all',     // (all, x, or y) using clamps of [0, viewport.worldWidth/viewport.worldHeight]
        underflow: 'center'   // where to place world if too small for screen
      },
      clampZoom: {
        minWidth: null,       // minimum width
        minHeight: null,      // minimum height
        maxWidth: null,       // maximum width
        maxHeight: null,      // maximum height
        minScale: 0.1,        // minimum scale
        maxScale: 5           // maximum scale
      },
      bounce: {
        sides: 'all',         // all, horizontal, vertical, or combination of top, bottom, right, left
        friction: 0.5,        // friction to apply to decelerate if active
        time: 150,            // time in ms to finish bounce
        bounceBox: null,      // bounce box to use (default: { x: 0, y: 0, width: this.worldWidth, height: this.worldHeight })
        ease: 'easeInOutSine', // ease function to use
        underflow: 'center'   // where to place world if too small for screen
      },
      snap: {
        topLeft: false,       // snap to the top-left of viewport
        friction: 0.8,        // friction/frame to apply if decelerate is active
        time: 1000,           // time in ms to snap
        ease: 'easeInOutSine', // ease function to use
        interrupt: true,      // pause snapping with any user input on the viewport
        center: false,        // snap to the center of the camera
        stop: false           // stops movement on interrupt
      },
      follow: {
        friction: 0.5,        // friction to apply to follow movement
        acceleration: null,   // set acceleration of movement (only works with friction)
        radius: null          // radius of deadzone before movement (only works with friction)
      },
      mouseEdges: {
        radius: null,         // distance from center of screen in screen pixels
        distance: 20,         // distance from all sides in screen pixels
        top: null,            // alternatively, set top distance (leave unset for no movement)
        bottom: null,         // alternatively, set bottom distance (leave unset for no movement)
        left: null,           // alternatively, set left distance (leave unset for no movement)
        right: null,          // alternatively, set right distance (leave unset for no movement)
        speed: 8,             // speed in pixels/frame to move viewport
        reverse: false,       // reverse direction of movement
        noDecelerate: false,  // don't use decelerate plugin even if it's installed
        linear: false,        // if using radius, use linear movement (+/-1, +/-1) instead of angled movement (Math.cos(angle from center), Math.sin(angle from center))
        allowButtons: false   // allows mouse buttons other than left to trigger mouseEdges
      }
    };

    // Override with user options
    if (options.plugins) {
      Object.keys(options.plugins).forEach(plugin => {
        if (this.pluginOptions[plugin]) {
          this.pluginOptions[plugin] = {
            ...this.pluginOptions[plugin],
            ...options.plugins[plugin]
          };
        }
      });
    }
    
    // Setup scale limits
    this.minScale = this.pluginOptions.clampZoom.minScale;
    this.maxScale = this.pluginOptions.clampZoom.maxScale;
    
    // For sending updates to the main thread
    this._dirty = true;
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
      : { x: event.clientX, y: event.clientY };
    
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
}

/**
 * Set up the application and viewport in the worker
 */
let app, viewport;

// Set up render loop for the application
function setupRenderLoop() {
  // Update viewport state and send to main thread if changed
  if (viewport.checkDirty()) {
    self.postMessage({
      type: 'viewport-update',
      data: viewport.getState()
    });
  }
}

// Create example content to render
async function createContent(viewport, texture, renderedData) {
  // This creates a texture from a 'bunny.png' image
  const image = new Sprite(texture);

  // Setup the position of the image
  image.x = 0;
  image.y = 0;

  // Setup dimensions of the image
  image.width = viewport.worldWidth;
  image.height = viewport.worldHeight;

  image.zIndex = -1;

  viewport.addChild(image);

  // Add cells
  const baseSize = 8;
  const resolution = 2;
  const graphics = new Graphics();
  graphics.beginFill(0xFF0000, 1);
  graphics.drawCircle(baseSize / 2, baseSize / 2, baseSize / 2);
  graphics.endFill();

  const renderTexture = RenderTexture.create({
    width: baseSize,
    height: baseSize,
    resolution: resolution
  });

  
  app.renderer.render(graphics, {
    renderTexture,
  });

  const sprites = new Container();

  viewport.addChild(sprites);

  const scaleFactor = (renderedData.size * 2) / baseSize;
  for (let i = 0; i < renderedData.data.length; i++) {
    const dot = new Sprite(renderTexture);
    dot.x = renderedData.data[i][0];
    dot.y = renderedData.data[i][1];
    dot.anchor.set(0.5);
    dot.scale.set(scaleFactor); 
    sprites.addChild(dot);
  }
}


self.onmessage = async event => {
  const { type, renderedData, ...data } = event.data;
  
  switch (type) {
    case 'init':
      // Initialize PixiJS application with the offscreen canvas
      app = new Application({ 
        width: data.viewport.screenWidth, 
        height: data.viewport.screenHeight, 
        resolution: data.resolution, 
        view: data.canvas,
        antialias: true,
        backgroundAlpha: 0
      });
      
      // Create our custom viewport implementation
      viewport = new ViewportWorker({
        screenWidth: data.viewport.screenWidth,
        screenHeight: data.viewport.screenHeight,
        worldWidth: data.viewport.worldWidth,
        worldHeight: data.viewport.worldHeight,
        plugins: data.viewport.plugins || {}
      })
      
      // Add viewport to the stage
      app.stage.addChild(viewport);
      
      // Create and add content
      const texture = await Assets.load(data.imagePath); 
      await createContent(viewport, texture, renderedData);
      
      // Set up render loop with ticker
      app.ticker.add(setupRenderLoop);

      self.postMessage({
        type: 'init-complete',
        data: viewport.getState()
      });

      app.renderer.once('postrender', () => {
        self.postMessage({ type: 'RENDERED' });
      });  
      
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
      }
      break;
      
    case 'mouseup':
      if (viewport) {
        viewport.handleMouseUp(data);
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
        viewport.moveCenter(viewport._worldCenter);
      }
      break;
  }

}