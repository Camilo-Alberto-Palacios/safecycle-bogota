import React from 'react';
import Slider from '../atoms/Slider';

export default function RangeControl({
    label,
    iconClass,
    min,
    max,
    step = 1,
    value,
    onChange,
    valueDisplay,
    id
}) {
    return (
        <div className="range-container">
            <div className="range-header">
                <span>
                    {iconClass && <i className={`${iconClass} margin-right-xs`}></i>}
                    {label}
                </span>
                <span className="range-val">{valueDisplay}</span>
            </div>
            <Slider
                id={id}
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={onChange}
            />
        </div>
    );
}
