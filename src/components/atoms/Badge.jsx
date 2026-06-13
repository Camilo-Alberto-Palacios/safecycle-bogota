import React from 'react';

export default function Badge({ 
    children, 
    level = 'bajo', // 'bajo', 'medio', 'alto'
    className = '' 
}) {
    const cleanLevel = level.toString().toLowerCase();
    
    // Support Spanish and English mappings
    let badgeClass = 'badge-low';
    if (cleanLevel === 'medio' || cleanLevel === 'mid') badgeClass = 'badge-mid';
    else if (cleanLevel === 'alto' || cleanLevel === 'high') badgeClass = 'badge-high';

    return (
        <span className={`badge ${badgeClass} ${className}`}>
            {children}
        </span>
    );
}
