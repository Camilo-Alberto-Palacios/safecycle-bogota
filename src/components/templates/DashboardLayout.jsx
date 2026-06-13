import React, { useState, useEffect } from 'react';
import Button from '../atoms/Button';

export default function DashboardLayout({
    header,
    mapComponent,
    routePlanner,
    simulatorPanel,
    resultsPanel,
    statsPanel,
    viewMode
}) {
    // Drawer open/close states for desktop
    const [leftDrawerOpen, setLeftDrawerOpen] = useState(true);
    const [rightDrawerOpen, setRightDrawerOpen] = useState(true);

    // Mobile tabs state: 'map', 'simulator', 'results'
    const [activeMobileTab, setActiveMobileTab] = useState('map');
    const [isMobile, setIsMobile] = useState(false);

    // Check window size to set mobile mode
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 900);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isTech = viewMode === 'tech';

    return (
        <div className={`app-container ${isTech ? 'scientific-view' : 'citizen-view'}`}>
            {/* Header */}
            {header}

            {/* Main Content Area */}
            <main className="main-layout">
                {/* Background Map */}
                <div className="map-background-wrapper">
                    {mapComponent}
                </div>

                {/* DESKTOP DRAWERS */}
                {!isMobile && (
                    <>
                        {/* Left Drawer */}
                        <div className={`floating-drawer left-drawer ${leftDrawerOpen ? 'open' : 'closed'}`}>
                            <div className="drawer-content scrollable">
                                {routePlanner}
                                <div className="drawer-divider"></div>
                                {simulatorPanel}
                            </div>
                            <Button 
                                variant="secondary"
                                onClick={() => setLeftDrawerOpen(!leftDrawerOpen)}
                                className="drawer-toggle-btn left-toggle"
                                title={leftDrawerOpen ? "Contraer Panel" : "Expandir Panel"}
                            >
                                <i className={`fa-solid ${leftDrawerOpen ? 'fa-chevron-left' : 'fa-sliders'}`}></i>
                            </Button>
                        </div>

                        {/* Right Drawer */}
                        <div className={`floating-drawer right-drawer ${rightDrawerOpen ? 'open' : 'closed'}`}>
                            <div className="drawer-content scrollable">
                                {isTech && statsPanel}
                                {isTech && <div className="drawer-divider"></div>}
                                {resultsPanel}
                            </div>
                            <Button 
                                variant="secondary"
                                onClick={() => setRightDrawerOpen(!rightDrawerOpen)}
                                className="drawer-toggle-btn right-toggle"
                                title={rightDrawerOpen ? "Contraer Panel" : "Expandir Resultados"}
                            >
                                <i className={`fa-solid ${rightDrawerOpen ? 'fa-chevron-right' : 'fa-chart-simple'}`}></i>
                            </Button>
                        </div>
                    </>
                )}

                {/* MOBILE BOTTOM SHEET SHEETS */}
                {isMobile && (
                    <>
                        {/* Mobile Simulator Sheet */}
                        <div className={`mobile-bottom-sheet ${activeMobileTab === 'simulator' ? 'visible' : 'hidden'}`}>
                            <div className="sheet-header">
                                <h3><i className="fa-solid fa-sliders text-accent"></i> Planificación y Simulación</h3>
                                <Button variant="secondary" onClick={() => setActiveMobileTab('map')} className="sheet-close-btn">
                                    <i className="fa-solid fa-xmark"></i>
                                </Button>
                            </div>
                            <div className="sheet-body scrollable">
                                {routePlanner}
                                <div className="drawer-divider"></div>
                                {simulatorPanel}
                            </div>
                        </div>

                        {/* Mobile Results/Stats Sheet */}
                        <div className={`mobile-bottom-sheet ${activeMobileTab === 'results' ? 'visible' : 'hidden'}`}>
                            <div className="sheet-header">
                                <h3><i className="fa-solid fa-square-poll-vertical text-accent"></i> Resultados y Análisis</h3>
                                <Button variant="secondary" onClick={() => setActiveMobileTab('map')} className="sheet-close-btn">
                                    <i className="fa-solid fa-xmark"></i>
                                </Button>
                            </div>
                            <div className="sheet-body scrollable">
                                {resultsPanel}
                                {isTech && <div className="drawer-divider"></div>}
                                {isTech && statsPanel}
                            </div>
                        </div>

                        {/* Mobile Navigation/Tab Bar */}
                        <div className="mobile-tab-bar">
                            <button 
                                className={`tab-item ${activeMobileTab === 'map' ? 'active' : ''}`}
                                onClick={() => setActiveMobileTab('map')}
                            >
                                <i className="fa-solid fa-map"></i>
                                <span>Mapa</span>
                            </button>
                            <button 
                                className={`tab-item ${activeMobileTab === 'simulator' ? 'active' : ''}`}
                                onClick={() => setActiveMobileTab('simulator')}
                            >
                                <i className="fa-solid fa-sliders"></i>
                                <span>Simulador</span>
                            </button>
                            <button 
                                className={`tab-item ${activeMobileTab === 'results' ? 'active' : ''}`}
                                onClick={() => setActiveMobileTab('results')}
                            >
                                <i className="fa-solid fa-chart-line"></i>
                                <span>Resultados</span>
                            </button>
                        </div>
                    </>
                )}
            </main>

            {/* Footer - Floating in the bottom of the drawers on desktop or omitted for neatness, let's keep a tiny footer in the drawers or bottom of screen */}
            {!isMobile && (
                <footer className="floating-footer">
                    <p><strong>SafeCycle Bogotá v1.0.0 (MVP)</strong> • Semillero Construcción de software para la transformación del territorio</p>
                </footer>
            )}
        </div>
    );
}
