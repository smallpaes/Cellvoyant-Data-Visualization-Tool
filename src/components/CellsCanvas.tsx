import { useEffect, useState } from 'react';
import { Application, extend  } from '@pixi/react';
import { Container, Graphics, Assets, Sprite, Texture, Particle, ParticleContainer } from 'pixi.js';

import { Dots } from './Dots'

extend({ Container, Graphics, Sprite, Particle, ParticleContainer });

interface CellsCanvasProps {
  width?: number;
  height?: number;
}

export const CellsCanvas: React.FC<CellsCanvasProps> = ({
  width = 800,
  height = 400,
}) => {
  const [texture, setTexture] = useState<Texture>();


  useEffect(() => {{
    async function getTexture() {
      const data = await Assets.load('/images/cell.jpg'); 
      setTexture(data)
    }
    getTexture();
  }}, []);

  return (
    <Application 
      width={width} 
      height={height} 
      backgroundAlpha={0}
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
    </Application>
  )
}; 