import React from 'react';
import './Toolbox.css';

interface ToolboxProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onCenter: () => void;
  onReset: () => void;
  onToggleHistogram: () => void;
  isHistogramVisible: boolean;
  isDisabled?: boolean;
}

export const Toolbox: React.FC<ToolboxProps> = ({
  onZoomIn,
  onZoomOut,
  onCenter,
  onReset,
  onToggleHistogram,
  isHistogramVisible,
  isDisabled = false
}) => {
  return (
    <div className="toolbox">
      <div className="toolbox__section">
        <h4 className="toolbox__section-title">View Controls</h4>
        <div className="toolbox__controls">
          <button
            onClick={onZoomIn}
            className="toolbox__button"
            disabled={isDisabled}
            aria-label="Zoom in"
          >
            <span className="toolbox__icon">+</span>
          </button>
          <button
            onClick={onZoomOut}
            className="toolbox__button"
            disabled={isDisabled}
            aria-label="Zoom out"
          >
            <span className="toolbox__icon">−</span>
          </button>
          <button
            onClick={onCenter}
            className="toolbox__button"
            disabled={isDisabled}
            aria-label="Center view"
          >
            <span className="toolbox__icon">⊙</span>
          </button>
          <button
            onClick={onReset}
            className="toolbox__button"
            disabled={isDisabled}
            aria-label="Reset view"
          >
            <span className="toolbox__icon">↺</span>
          </button>
        </div>
      </div>

      <div className="toolbox__section">
        <h4 className="toolbox__section-title">Analysis</h4>
        <button
          onClick={onToggleHistogram}
          className={`toolbox__button toolbox__button--primary ${
            isHistogramVisible ? 'toolbox__button--active' : ''
          }`}
          disabled={isDisabled}
          aria-label={isHistogramVisible ? 'Hide histogram' : 'Show histogram'}
        >
          <span className="toolbox__icon">📊</span>
          <span className="toolbox__label">Size Distribution</span>
        </button>
      </div>
    </div>
  );
};