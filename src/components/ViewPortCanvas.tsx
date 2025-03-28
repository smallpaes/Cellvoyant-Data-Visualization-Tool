import { useEffect, useState, useRef } from 'react';
import { useApplication } from '@pixi/react';
import { Assets, Texture } from 'pixi.js';
import { Viewport } from 'pixi-viewport';

import { Dots } from './Dots'


interface ViewPortCanvasProps {
  width?: number;
  height?: number;
}

export const ViewPortCanvas: React.FC<ViewPortCanvasProps> = ({
  width = 800,
  height = 400,
}) => {
  const [texture, setTexture] = useState<Texture>();
  const { app } = useApplication()
  const viewPortRef = useRef<Viewport>(null);

  useEffect(() => {{
    async function getTexture() {
      const data = await Assets.load('/images/cell.jpg'); 
      setTexture(data)
    }
    getTexture();
  }}, []);

  useEffect(() => {
    if (!app?.renderer || !viewPortRef.current) return;
    console.log('set')
    viewPortRef.current
        .pinch()
        .wheel({ smooth: 3 })
        // .clampZoom({ minScale: 1, maxScale: 15 })
        // .clamp({ direction: 'all' });

    viewPortRef.current.on('zoomed', () => {
      const scale = viewPortRef.current?.scaled;
      if (!scale || !viewPortRef.current) return; 
        if (scale > 1) {
          viewPortRef.current.drag();
        } else {
          viewPortRef.current.plugins.remove('drag');
        }
    })
  }, [app?.renderer]);

  if (!app?.renderer) return null;
  console.log(app.renderer.events)
  return (
    <viewport 
      worldWidth={width}
      worldHeight={height}
      screenWidth={width}
      screenHeight={height}
      events={app.renderer.events}
      ticker={app.ticker}
      ref={viewPortRef}
    >
      <pixiContainer x={0} y={0}>
        <pixiSprite
          texture={texture}
          x={0}
          y={0}
          width={width}
          height={height}
        />
        <Dots />
      </pixiContainer>
    </viewport>
  )
}; 