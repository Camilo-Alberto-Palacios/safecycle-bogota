import React from 'react';

export default function MetricCard({
    value,
    label,
    target,
    title,
    isGreen = false
}) {
    return (
        <div className="metric-card" title={title}>
            <div className={`metric-val ${isGreen ? 'text-green' : ''}`}>{value}</div>
            <div className="metric-label">{label}</div>
            <div className="metric-target">{target}</div>
        </div>
    );
}
