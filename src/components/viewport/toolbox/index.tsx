import React, { useMemo } from 'react';
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
  const mainControls = useMemo(
    () => [
      {
        onClick: onZoomIn,
        icon: ZoomInIcon,
        label: 'Zoom in',
        title: 'Zoom in',
      },
      {
        onClick: onZoomOut,
        icon: ZoomOutIcon,
        label: 'Zoom out',
        title: 'Zoom out',
      },
      {
        onClick: onCenter,
        icon: CenterFocusIcon,
        label: 'Center view',
        title: 'Center view',
      },
      {
        onClick: onReset,
        icon: ResetIcon,
        label: 'Reset view',
        title: 'Reset view',
      },
    ],
    [onZoomIn, onZoomOut, onCenter, onReset]
  );

  const histogramControl = useMemo(
    () => ({
      onClick: onToggleHistogram,
      icon: BarChartIcon,
      label: isHistogramVisible ? 'Hide histogram' : 'Show histogram',
      title: isHistogramVisible ? 'Hide histogram' : 'Show histogram',
    }),
    [onToggleHistogram, isHistogramVisible]
  );

  return (
    <div className={`toolbox ${isDisabled ? 'toolbox--disabled' : ''}`}>
      <div className="toolbox__controls">
        {mainControls.map((control, index) => (
          <button
            key={index}
            onClick={control.onClick}
            className="toolbox__button"
            disabled={isDisabled}
            aria-label={control.label}
            title={control.title}
            type="button"
          >
            <control.icon />
          </button>
        ))}
      </div>
      <hr className="toolbox__divider" />
      <div className="toolbox__controls">
        <button
          onClick={histogramControl.onClick}
          className="toolbox__button"
          disabled={isDisabled}
          aria-label={histogramControl.label}
          title={histogramControl.title}
          type="button"
        >
          <histogramControl.icon />
        </button>
      </div>
    </div>
  );
};
