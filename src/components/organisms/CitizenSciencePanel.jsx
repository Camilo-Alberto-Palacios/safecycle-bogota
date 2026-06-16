import React from 'react';
import Button from '../atoms/Button';

export default function CitizenSciencePanel({
    citizenReports = [],
    localidad,
    isReporting,
    setIsReporting,
    reportingType,
    setReportingType,
    reportingCoords,
    isSelectingCoords,
    setIsSelectingCoords,
    onSubmitReport,
    onCancelReport,
    onZoomToReport
}) {
    // Filter reports for the active locality
    const activeLocalityReports = citizenReports.filter(r => {
        const reportLoc = r.properties.localidad || '';
        // Match 'usme' or 'ruu' (rafael uribe)
        if (localidad === 'usme') {
            return reportLoc.toLowerCase().includes('usme');
        } else if (localidad === 'ruu') {
            return reportLoc.toLowerCase().includes('rafael') || reportLoc.toLowerCase().includes('uribe');
        }
        return true;
    });

    const getIconClass = (type) => {
        if (type.includes('Luminaria') || type.includes('lobo')) return 'fa-lightbulb text-yellow';
        if (type.includes('Hueco') || type.includes('destructiva')) return 'fa-triangle-exclamation text-yellow';
        return 'fa-hand text-red';
    };

    return (
        <div className="citizen-science-card">
            <h3>
                <i className="fa-solid fa-people-group text-accent"></i> Ciencia Ciudadana
            </h3>
            <p className="citizen-science-desc">
                Reporta novedades físicas o de seguridad en la vía para recalcular las rutas seguras de la comunidad en tiempo real.
            </p>

            {!isReporting ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <button
                        className="btn-flat btn-flat-primary"
                        onClick={() => setIsReporting(true)}
                        style={{ width: '100%' }}
                    >
                        <i className="fa-solid fa-plus"></i> Reportar Novedad
                    </button>

                    {activeLocalityReports.length > 0 && (
                        <div style={{ marginTop: '0.25rem' }}>
                            <h4 style={{ fontSize: '0.78rem', color: 'var(--text-primary)', marginBottom: '0.4rem', fontWeight: 600 }}>
                                Novedades Activas ({activeLocalityReports.length})
                            </h4>
                            <div className="citizen-reports-list">
                                {activeLocalityReports.map((report) => (
                                    <div key={report.id} className="citizen-report-card-item">
                                        <div className="report-item-header">
                                            <span className="report-item-type">
                                                <i className={`fa-solid ${getIconClass(report.properties.tipo_novedad)}`} style={{ marginRight: '0.35rem' }}></i>
                                                {report.properties.tipo_novedad.split('/')[0].split('(')[0].trim()}
                                            </span>
                                            <span className="report-item-votes">
                                                <i className="fa-solid fa-circle-arrow-up"></i> {report.properties.numero_votos}
                                            </span>
                                        </div>
                                        <div className="report-item-header" style={{ marginTop: '0.15rem' }}>
                                            <span className="report-item-meta">
                                                Creado: {report.properties.fecha_creacion}
                                            </span>
                                            <button
                                                onClick={() => onZoomToReport(report.properties.coordenadas)}
                                                style={{
                                                    background: 'transparent',
                                                    border: 'none',
                                                    color: 'var(--accent-color)',
                                                    cursor: 'pointer',
                                                    fontSize: '0.65rem',
                                                    fontWeight: 600,
                                                    padding: 0
                                                }}
                                            >
                                                Ver en mapa
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="report-form">
                    <div className="report-select-wrapper">
                        <label className="control-label" style={{ fontSize: '0.75rem' }}>Tipo de Novedad</label>
                        <select
                            className="report-select"
                            value={reportingType}
                            onChange={(e) => setReportingType(e.target.value)}
                        >
                            <option value="Luminaria Dañada / Boca de lobo">Luminaria Dañada / Boca de lobo (+0.8)</option>
                            <option value="Hueco crítico / Vía destructiva">Hueco crítico / Vía destructiva (+0.5)</option>
                            <option value="Punto Crítico de Inseguridad (Atraco reciente)">Punto Crítico de Inseguridad (+1.5)</option>
                        </select>
                    </div>

                    <div className="report-select-wrapper">
                        <label className="control-label" style={{ fontSize: '0.75rem' }}>Ubicación Geográfica</label>
                        <div
                            className={`map-pick-indicator ${isSelectingCoords ? 'active' : ''}`}
                            onClick={() => setIsSelectingCoords(!isSelectingCoords)}
                        >
                            {isSelectingCoords ? (
                                <>
                                    <i className="fa-solid fa-crosshairs fa-spin"></i> Haz clic en el mapa...
                                </>
                            ) : reportingCoords ? (
                                <>
                                    <i className="fa-solid fa-location-dot"></i> Lat: {reportingCoords[0].toFixed(5)}, Lng: {reportingCoords[1].toFixed(5)}
                                </>
                            ) : (
                                <>
                                    <i className="fa-solid fa-map-pin"></i> Fijar ubicación en el mapa
                                </>
                            )}
                        </div>
                    </div>

                    <div className="report-actions">
                        <button
                            className="btn-flat btn-flat-primary"
                            onClick={onSubmitReport}
                            disabled={!reportingCoords}
                            style={{ flex: 1, opacity: reportingCoords ? 1 : 0.5, cursor: reportingCoords ? 'pointer' : 'not-allowed' }}
                        >
                            <i className="fa-solid fa-check"></i> Enviar
                        </button>
                        <button
                            className="btn-flat btn-flat-danger"
                            onClick={onCancelReport}
                            style={{ flex: 1 }}
                        >
                            <i className="fa-solid fa-xmark"></i> Cancelar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
