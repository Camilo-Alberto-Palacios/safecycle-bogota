import React from 'react';

export default function Button({ 
    children, 
    onClick, 
    className = '', 
    active = false, 
    variant = 'primary', // 'primary', 'secondary', 'toggle', 'icon-select', 'switch-btn'
    title = '',
    id,
    disabled = false
}) {
    let baseClass = 'btn';
    
    if (variant === 'primary') baseClass = 'btn-primary-action';
    else if (variant === 'secondary') baseClass = 'btn-secondary-action';
    else if (variant === 'toggle') baseClass = `btn-toggle ${active ? 'active' : ''}`;
    else if (variant === 'switch-btn') baseClass = `btn-switch ${active ? 'active' : ''}`;
    else if (variant === 'icon-select') baseClass = `btn-location-select ${active ? 'active' : ''}`;

    return (
        <button
            id={id}
            onClick={onClick}
            className={`${baseClass} ${className}`}
            title={title}
            disabled={disabled}
        >
            {children}
        </button>
    );
}
