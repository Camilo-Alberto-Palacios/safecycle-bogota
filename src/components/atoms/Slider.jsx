import React from 'react';

export default function Slider({ 
    min, 
    max, 
    step = 1, 
    value, 
    onChange, 
    id, 
    className = '' 
}) {
    return (
        <input
            type="range"
            id={id}
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className={`custom-slider ${className}`}
        />
    );
}
