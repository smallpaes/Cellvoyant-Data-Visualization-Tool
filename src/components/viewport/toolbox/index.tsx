import React from 'react';
import './Toolbox.css';

import ZoomInIcon from '../../../assets/svg/icons/zoom-in.svg';
import ZoomOutIcon from '../../../assets/svg/icons/zoom-out.svg';
import ResetIcon from '../../../assets/svg/icons/reset.svg';
import CenterFocusIcon from '../../../assets/svg/icons/center-focus.svg';
import BarChartIcon from '../../../assets/svg/icons/bar-chart.svg';

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
  isDisabled = false,
}) => {
  return (
    <div className={`toolbox ${isDisabled ? 'toolbox--disabled' : ''}`}>
      <div className="toolbox__controls">
        <button
          onClick={onZoomIn}
          className="toolbox__button"
          disabled={isDisabled}
          aria-label="Zoom in"
          title="Zoom in"
          type="button"
        >
          <ZoomInIcon />
        </button>
        <button
          onClick={onZoomOut}
          className="toolbox__button"
          disabled={isDisabled}
          aria-label="Zoom out"
          title="Zoom out"
          type="button"
        >
          <ZoomOutIcon />
        </button>
        <button
          onClick={onCenter}
          className="toolbox__button"
          disabled={isDisabled}
          aria-label="Center view"
          title="Center view"
          type="button"
        >
          <CenterFocusIcon />
        </button>
        <button
          onClick={onReset}
          className="toolbox__button"
          disabled={isDisabled}
          aria-label="Reset view"
          title="Reset view"
          type="button"
        >
          <ResetIcon />
        </button>
      </div>
      <hr className="toolbox__divider" />
      <div className="toolbox__controls">
        <button
          onClick={onToggleHistogram}
          className={`toolbox__button`}
          disabled={isDisabled}
          aria-label={isHistogramVisible ? 'Hide histogram' : 'Show histogram'}
          title={isHistogramVisible ? 'Hide histogram' : 'Show histogram'}
          type="button"
        >
          <BarChartIcon />
        </button>
      </div>
    </div>
  );
};
