import { Application, Assets, Sprite, Container, Graphics, RenderTexture } from '@pixi/webworker';

self.onmessage = async e => {
  // Recieve OffscreenCanvas from index.js
  const { width, height, resolution, view, imagePath, data } = e.data;
    
  // The application will create a renderer using WebGL, if possible,
  // with a fallback to a canvas render. It will also setup the ticker
  // and the root stage PIXI.Container
  const app = new Application({ width, height, resolution, view });

  // load the texture we need
  const texture = await Assets.load(imagePath); 

  // This creates a texture from a 'bunny.png' image
  const bunny = new Sprite(texture);

  // Setup the position of the bunny
  bunny.x = 0;
  bunny.y = 0;

  // Setup dimensions of the bunny
  bunny.width = width;
  bunny.height = height;

  bunny.zIndex = -1;

  app.stage.addChild(bunny);


  const graphics = new Graphics();
  graphics.beginFill(0xFF0000, 0.5);
  graphics.drawCircle(0, 0, 5);
  graphics.endFill();

  const renderTexture = RenderTexture.create({
    width: graphics.width,
    height: graphics.height,
  });
  
  app.renderer.render(graphics, {
    renderTexture,
  });

  const sprites = new Container();

  app.stage.addChild(sprites);

  for (let i = 0; i < data.length; i++) {
    const dot = new Sprite(renderTexture);
    dot.x = data[i][0];
    dot.y = data[i][1];
    dot.anchor.set(0.5);
    sprites.addChild(dot);
  }

  app.renderer.once('postrender', () => {
    self.postMessage({ type: 'RENDERED' });
  });  
}