import React from 'react';

export default function Input({ 
    value, 
    onChange, 
    placeholder = '', 
    id, 
    className = '',
    type = 'text' 
}) {
    return (
        <input
            type={type}
            id={id}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={`custom-input ${className}`}
        />
    );
}
