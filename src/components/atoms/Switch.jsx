import React from 'react';

export default function Switch({ 
    checked, 
    onChange, 
    id, 
    className = '' 
}) {
    return (
        <label className={`switch ${className}`}>
            <input
                type="checkbox"
                id={id}
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
            />
            <span className="slider-round"></span>
        </label>
    );
}
