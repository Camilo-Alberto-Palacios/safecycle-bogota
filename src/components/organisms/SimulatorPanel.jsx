import React from 'react';
import Badge from '../atoms/Badge';
import Button from '../atoms/Button';
import Switch from '../atoms/Switch';
import RangeControl from '../molecules/RangeControl';

export default function SimulatorPanel({
    selectedSegment,
    simulationState,
    onSimulationStateChange,
    viewMode
}) {
    const isTech = viewMode === 'tech';

    // If no segment is selected, render a prompt
    if (!selectedSegment) {
        return (
            <div className="simulator-panel-empty">
                <div className="tramo-card">
                    <h3>Selecciona un tramo del mapa...</h3>
                    <p className="tramo-meta">
                        <i className="fa-solid fa-route"></i> Haz clic en una ciclorruta o audita un punto en el mapa para iniciar el simulador de entorno.
                    </p>
                </div>
            </div>
        );
    }

    const getVisibilityLabel = (val) => {
        if (val === 1) return 'Baja (Obstruido)';
        if (val === 3) return 'Buena (Despejado)';
        return 'Regular';
    };

    return (
        <div className="simulation-panel-wrapper">
            {/* Selected Segment Info */}
            <div id="tramo-info-card" className="tramo-card">
                <h3 id="lbl-tramo-nombre">{selectedSegment.name}</h3>
                <p className="tramo-meta">
                    <i className="fa-solid fa-route"></i> {selectedSegment.localidad}
                    {isTech && <span> • UPZ: {selectedSegment.upz}</span>}
                </p>
                <div className="crime-baseline">
                    <span>Historial Delictivo Base:</span>
                    <Badge level={selectedSegment.baselineCrime}>
                        {selectedSegment.baselineCrime}
                    </Badge>
                </div>
            </div>

            {/* Simulation Controls */}
            <div className="simulation-controls">
                {/* Public Lighting */}
                <div className="control-group">
                    <label className="control-label">
                        <span>
                            <i className="fa-solid fa-lightbulb text-yellow"></i> Alumbrado Público
                            {isTech && <span className="tech-only"> (UAESP)</span>}
                        </span>
                    </label>
                    <div className="toggle-switch-container">
                        <span className="toggle-label">Tecnología:</span>
                        <div className="button-switch">
                            <Button
                                variant="switch-btn"
                                active={simulationState.lightingType === 'Sodio'}
                                onClick={() => onSimulationStateChange('lightingType', 'Sodio')}
                            >
                                Sodio (Amarilla)
                            </Button>
                            <Button
                                variant="switch-btn"
                                active={simulationState.lightingType === 'LED'}
                                onClick={() => onSimulationStateChange('lightingType', 'LED')}
                            >
                                LED (Blanca)
                            </Button>
                        </div>
                    </div>
                    
                    <RangeControl
                        label="Potencia Lumínica:"
                        min={50}
                        max={250}
                        step={25}
                        value={simulationState.watts}
                        onChange={(val) => onSimulationStateChange('watts', val)}
                        valueDisplay={`${simulationState.watts} W`}
                        id="input-light-watts"
                    />
                </div>

                {/* Weather */}
                <div className="control-group">
                    <label className="control-label">
                        <span>
                            <i className="fa-solid fa-cloud-showers-water text-blue"></i> Estado del Clima
                            {isTech && <span className="tech-only"> (IDIGER)</span>}
                        </span>
                    </label>
                    <div className="button-switch full-width">
                        <Button
                            variant="switch-btn"
                            active={simulationState.weather === 'seco'}
                            onClick={() => onSimulationStateChange('weather', 'seco')}
                        >
                            <i className="fa-solid fa-sun"></i> Seco / Despejado
                        </Button>
                        <Button
                            variant="switch-btn"
                            active={simulationState.weather === 'lluvia'}
                            onClick={() => onSimulationStateChange('weather', 'lluvia')}
                        >
                            <i className="fa-solid fa-cloud-showers-heavy"></i> Lluvia Fuerte
                        </Button>
                    </div>
                </div>

                {/* CPTED: Natural Surveillance / Visibility */}
                <div className="control-group">
                    <label className="control-label">
                        <span>
                            <i className="fa-solid fa-eye text-green"></i> Visibilidad de la Vía
                            {isTech && <span className="tech-only"> (CPTED)</span>}
                        </span>
                    </label>
                    <RangeControl
                        label="Visibilidad / Despeje Vial:"
                        min={1}
                        max={3}
                        step={1}
                        value={simulationState.visibility}
                        onChange={(val) => onSimulationStateChange('visibility', val)}
                        valueDisplay={getVisibilityLabel(simulationState.visibility)}
                        id="input-cpted-visibility"
                    />
                    <div className="cpted-info-text">
                        <i className="fa-solid fa-circle-info"></i> Evalúa obstáculos visuales (maleza, laderas, curvas ciegas).
                    </div>
                </div>

                {/* Guardians & Construction */}
                <div className="control-group">
                    <label className="control-label">
                        <span>
                            <i className="fa-solid fa-shield-halved text-purple"></i> Factores de Entorno y Seguridad
                        </span>
                    </label>
                    <div className="toggle-card">
                        <div className="toggle-item">
                            <div className="toggle-text">
                                <span className="toggle-title">Presencia Policial (CAI)</span>
                                <span className="toggle-desc">Cercanía a CAI fijo o móvil</span>
                            </div>
                            <Switch
                                id="check-guardian-cai"
                                checked={simulationState.guardianCai}
                                onChange={(val) => onSimulationStateChange('guardianCai', val)}
                            />
                        </div>
                        <div className="toggle-item">
                            <div className="toggle-text">
                                <span className="toggle-title">Corredor Ruta Segura</span>
                                <span className="toggle-desc">Acompañamiento en horarios pico</span>
                            </div>
                            <Switch
                                id="check-guardian-ruta"
                                checked={simulationState.guardianRuta}
                                onChange={(val) => onSimulationStateChange('guardianRuta', val)}
                            />
                        </div>
                        <div className="toggle-item">
                            <div className="toggle-text">
                                <span className="toggle-title">Frentes de Obra (IDU)</span>
                                <span className="toggle-desc">Simular riesgo temporal de construcciones</span>
                            </div>
                            <Switch
                                id="check-show-construction"
                                checked={simulationState.showConstruction !== false}
                                onChange={(val) => onSimulationStateChange('showConstruction', val)}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
