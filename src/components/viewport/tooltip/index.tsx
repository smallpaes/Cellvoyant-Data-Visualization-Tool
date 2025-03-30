import React from 'react';
import './Tooltip.css';

interface TooltipData {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface TooltipProps {
  isVisible: boolean;
  data: TooltipData | null;
  offset?: number;
}

export const Tooltip: React.FC<TooltipProps> = ({ isVisible, data, offset = 35 }) => {
  if (!isVisible || !data) return null;
  return (
    <div
      className="tooltip" 
      style={{
        top: `${data.y + offset}px`,
        left: `${data.x + offset}px`
      }}
    >
      <div className="tooltip__item">x: {data.x.toFixed(1)}</div>
      <div className="tooltip__item">y: {data.y.toFixed(1)}</div>
      <div className="tooltip__item">width: {data.width}</div>
      <div className="tooltip__item">height: {data.height}</div>
    </div>
  );
}; 