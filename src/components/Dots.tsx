import { useState, useMemo } from 'react';
import { useApplication, useTick } from '@pixi/react';
import { Graphics, Texture, RenderTexture, ParticleContainer, Particle } from 'pixi.js';
import data from '../data/data.json'


type CellType = [number, number, number, number]

interface DotsProps {
  width?: number;
  height?: number;
}

export const Dots: React.FC<DotsProps> = () => {
  const [circleTexture, setCircleTexture] = useState<Texture>();
  const { app } = useApplication()


  useTick(() => {
    if (circleTexture || !app?.renderer) return
    const graphics = new Graphics();
    graphics.setFillStyle({ color: 'red', alpha: .5 });
    graphics.circle(0, 0, 5);
    graphics.fill();

    const renderTexture = RenderTexture.create({
      width: graphics.width,
      height: graphics.height,
    });

    app.renderer.render(graphics, {
      renderTexture,
    });
    setCircleTexture(renderTexture);
  });

  const updatedData = useMemo(() => {{
    return (data as CellType[]).map(([x, y, w, h]) => [x / 8, y  / 8, w, h])
  }}, [])

  return (
    <pixiContainer cacheAsTexture={() => ({
      resolution: 0.5,
      antialias: false
    })}>
      {updatedData.map((point, index) => (
        <pixiSprite
          key={index}
          texture={circleTexture}
          x={point[0]}
          y={point[1]}
          anchor={0.5}
        />
      ))}
    </pixiContainer>
  )
}; 

// import { useState, useMemo } from 'react';
// import { useApplication, useTick } from '@pixi/react';
// import { Graphics, Texture, RenderTexture } from 'pixi.js';
// import data from '../data/data.json'


// type CellType = [number, number, number, number]

// interface DotsProps {
//   width?: number;
//   height?: number;
// }

// export const Dots: React.FC<DotsProps> = () => {
//   const [circleTexture, setCircleTexture] = useState<Texture>();
//   const { app } = useApplication()


//   useTick(() => {
//     if (circleTexture || !app?.renderer) return
//     console.log('in')
//     const graphics = new Graphics();
//     graphics.setFillStyle({ color: 'red', alpha: .5 });
//     graphics.circle(0, 0, 5);
//     graphics.fill();

//     const renderTexture = RenderTexture.create({
//       width: graphics.width,
//       height: graphics.height,
//     });

//     app.renderer.render(graphics, {
//       renderTexture,
//     });
//     setCircleTexture(renderTexture);
//   });

//   const updatedData = useMemo(() => {{
//     return (data as CellType[]).slice(0, 100).map(([x, y, w, h]) => [x / 8, y  / 8, w, h])
//   }}, [])
//   if (!circleTexture) return null
//   console.log(circleTexture)
//   return (
//     <>
//       <pixiParticleContainer>
//         {updatedData.map((point, index) => (
//           <pixiParticle
//             key={index}
//             texture={circleTexture}
//             x={0}
//             y={0}
//             tint={0xff0000}
//           />
//         ))}
//       </pixiParticleContainer>
//     </>
//   )
// }; 