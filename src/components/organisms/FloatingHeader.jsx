import React from 'react';
import ToggleGroup from '../molecules/ToggleGroup';

export default function FloatingHeader({
    localidad,
    onLocalidadChange,
    viewMode,
    onViewModeChange
}) {
    const localidadOpts = [
        { value: 'usme', label: 'Usme' },
        { value: 'ruu', label: 'Rafael Uribe' }
    ];

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
                <ToggleGroup
                    options={localidadOpts}
                    activeValue={localidad}
                    onChange={onLocalidadChange}
                    ariaLabel="Selección de Localidad"
                />
                
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
