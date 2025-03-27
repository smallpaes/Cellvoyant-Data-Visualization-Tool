import { Application, extend  } from '@pixi/react';
import { Container, Graphics, Sprite, Particle, ParticleContainer } from 'pixi.js';
import { Viewport } from 'pixi-viewport'
import { ViewPortCanvas} from './ViewPortCanvas'


extend({ Container, Graphics, Sprite, Particle, ParticleContainer, Viewport });

interface CellsViewPortCanvasProps {
  width?: number;
  height?: number;
}

export const CellsViewPortCanvas: React.FC<CellsViewPortCanvasProps> = ({
  width = 800,
  height = 400,
}) => {

  return (
    <Application 
      width={width} 
      height={height} 
      backgroundAlpha={0}
    >
      <ViewPortCanvas width={width} height={height} />
    </Application>
  )
}; 