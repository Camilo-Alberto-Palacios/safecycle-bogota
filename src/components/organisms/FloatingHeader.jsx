import React from 'react';
import ToggleGroup from '../molecules/ToggleGroup';
import { localitiesMap } from '../../data/bikeSegments';

export default function FloatingHeader({
    localidad,
    onLocalidadChange,
    viewMode,
    onViewModeChange,
    hideLogo = false
}) {
    const viewModeOpts = [
        { value: 'citizen', label: 'Ciudadano' },
        { value: 'tech', label: 'Científico' }
    ];

    return (
        <header className="app-header floating-header-card">
            {!hideLogo && (
                <div className="header-logo animate-fade-in">
                    <div className="logo-icon" style={{ background: 'transparent', boxShadow: 'none', borderRadius: '0', animation: 'none' }}>
                        <img src={`${import.meta.env.BASE_URL}Logo.svg`} alt="Ruta Clara Logo" style={{ width: '32px', height: '32px' }} />
                    </div>
                    <div className="logo-text">
                        <h1>Ruta <span>Clara</span></h1>
                    </div>
                </div>
            )}
            
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
