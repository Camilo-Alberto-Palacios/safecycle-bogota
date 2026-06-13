import React from 'react';
import ToggleGroup from '../molecules/ToggleGroup';
import { localitiesMap } from '../../data/bikeSegments';

export default function FloatingHeader({
    localidad,
    onLocalidadChange,
    viewMode,
    onViewModeChange
}) {
    const viewModeOpts = [
        { value: 'citizen', label: 'Ciudadano' },
        { value: 'tech', label: 'Científico' }
    ];

    return (
        <header className="app-header floating-header-card">
            <div className="header-logo">
                <div className="logo-icon">
                    <i className="fa-solid fa-bicycle"></i>
                </div>
                <div className="logo-text">
                    <h1>SafeCycle <span>Bogotá</span></h1>
                </div>
            </div>
            
            <div className="header-controls">
                <div className="locality-select-wrapper">
                    <i className="fa-solid fa-map-location-dot select-icon"></i>
                    <select 
                        value={localidad} 
                        onChange={(e) => onLocalidadChange(e.target.value)}
                        className="minimal-select"
                        aria-label="Selección de Localidad"
                    >
                        {Object.keys(localitiesMap).map(key => (
                            <option key={key} value={key}>
                                {localitiesMap[key].name}
                            </option>
                        ))}
                    </select>
                </div>
                
                <ToggleGroup
                    options={viewModeOpts}
                    activeValue={viewMode}
                    onChange={onViewModeChange}
                    ariaLabel="Modo de Vista"
                />
            </div>
        </header>
    );
}
