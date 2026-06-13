import React from 'react';
import Button from '../atoms/Button';

export default function ToggleGroup({
    label,
    iconClass,
    options = [], // Array of { value, label }
    activeValue,
    onChange,
    ariaLabel = ''
}) {
    return (
        <div className="control-toggle-group">
            {label && (
                <span className="toggle-group-label">
                    {iconClass && <i className={`${iconClass} margin-right-xs`}></i>}
                    {label}
                </span>
            )}
            <div className="localidad-toggle" role="group" aria-label={ariaLabel}>
                {options.map((opt) => (
                    <Button
                        key={opt.value}
                        variant="toggle"
                        active={opt.value === activeValue}
                        onClick={() => onChange(opt.value)}
                    >
                        {opt.label}
                    </Button>
                ))}
            </div>
        </div>
    );
}
