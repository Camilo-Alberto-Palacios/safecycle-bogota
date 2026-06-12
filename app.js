/**
 * SafeCycle Bogotá - MVP Application Logic
 * Interactive CPTED Simulator, Predictive Risk Engine, and SHAP Explainer
 */

// Global state variables
let map;
let activeLocalidad = 'usme';
let selectedSegmentId = null;
let shapChart = null;
let usmePolygon = null;
let ruuPolygon = null;
let usmeTooltip = null;
let ruuTooltip = null;
let customAuditMarker = null;

// Routing global variables
let selectingLocationMode = null; // 'origin' or 'destination'
let routePoints = { origin: null, destination: null };
let routeMarkers = { origin: null, destination: null };
let generatedRoutes = [];
let activeRouteId = null;

// Mock database of bicycle lane segments (tramos)
const bikeSegments = {
    // ==========================================
    // Usme Localidad (10 Tramos)
    // ==========================================
    'usme_caracas_norte': {
        id: 'usme_caracas_norte',
        name: 'Av. Caracas Sur (Molinos a Portal Usme)',
        localidad: 'Usme (05)',
        upz: 'UPZ 59 - El Danubio',
        baselineCrime: 'Alto',
        coordinates: [
            [4.550, -74.110],
            [4.542, -74.110],
            [4.532, -74.108]
        ],
        lightingType: 'Sodio',
        watts: 150,
        weather: 'seco',
        visibility: 2,
        guardianCai: false,
        guardianRuta: false
    },
    'usme_caracas': {
        id: 'usme_caracas',
        name: 'Av. Caracas Sur (Portal Usme a Yomasa)',
        localidad: 'Usme (05)',
        upz: 'UPZ 57 - Gran Yomasa',
        baselineCrime: 'Alto', // baseline factor
        coordinates: [
            [4.532, -74.108],
            [4.524, -74.111],
            [4.515, -74.114],
            [4.502, -74.117],
            [4.492, -74.119]
        ],
        lightingType: 'Sodio',
        watts: 100,
        weather: 'seco',
        visibility: 2,
        guardianCai: false,
        guardianRuta: false
    },
    'usme_caracas_sur': {
        id: 'usme_caracas_sur',
        name: 'Av. Caracas Sur (Yomasa a Alfonso López)',
        localidad: 'Usme (05)',
        upz: 'UPZ 56 - Alfonso López',
        baselineCrime: 'Medio',
        coordinates: [
            [4.492, -74.119],
            [4.485, -74.122],
            [4.478, -74.125],
            [4.468, -74.128]
        ],
        lightingType: 'Sodio',
        watts: 100,
        weather: 'seco',
        visibility: 2,
        guardianCai: false,
        guardianRuta: false
    },
    'usme_boyaca': {
        id: 'usme_boyaca',
        name: 'Av. Boyacá Sur (Meissen a Yomasa)',
        localidad: 'Usme (05)',
        upz: 'UPZ 58 - Comuneros',
        baselineCrime: 'Alto',
        coordinates: [
            [4.515, -74.128],
            [4.505, -74.121],
            [4.497, -74.115],
            [4.488, -74.107]
        ],
        lightingType: 'Sodio',
        watts: 75,
        weather: 'seco',
        visibility: 1, // High obstructions
        guardianCai: false,
        guardianRuta: false
    },
    'usme_yomasa_int': {
        id: 'usme_yomasa_int',
        name: 'Ciclorruta Gran Yomasa Interna',
        localidad: 'Usme (05)',
        upz: 'UPZ 57 - Gran Yomasa',
        baselineCrime: 'Alto',
        coordinates: [
            [4.505, -74.121],
            [4.502, -74.115],
            [4.503, -74.110]
        ],
        lightingType: 'Sodio',
        watts: 100,
        weather: 'seco',
        visibility: 2,
        guardianCai: false,
        guardianRuta: false
    },
    'usme_comuneros_int': {
        id: 'usme_comuneros_int',
        name: 'Conector Interno Comuneros',
        localidad: 'Usme (05)',
        upz: 'UPZ 58 - Comuneros',
        baselineCrime: 'Medio',
        coordinates: [
            [4.497, -74.115],
            [4.493, -74.110],
            [4.491, -74.103]
        ],
        lightingType: 'LED',
        watts: 100,
        weather: 'seco',
        visibility: 2,
        guardianCai: false,
        guardianRuta: false
    },
    'usme_alopez': {
        id: 'usme_alopez',
        name: 'Vía al Llano (Alfonso López)',
        localidad: 'Usme (05)',
        upz: 'UPZ 56 - Alfonso López',
        baselineCrime: 'Medio',
        coordinates: [
            [4.488, -74.120],
            [4.482, -74.116],
            [4.476, -74.110]
        ],
        lightingType: 'LED',
        watts: 150,
        weather: 'seco',
        visibility: 2,
        guardianCai: false,
        guardianRuta: true // Has Route patrol
    },
    'usme_danubio': {
        id: 'usme_danubio',
        name: 'Ciclorruta El Danubio - La Fiscala',
        localidad: 'Usme (05)',
        upz: 'UPZ 59 - El Danubio',
        baselineCrime: 'Bajo',
        coordinates: [
            [4.515, -74.115],
            [4.512, -74.108],
            [4.507, -74.102]
        ],
        lightingType: 'LED',
        watts: 150,
        weather: 'seco',
        visibility: 3, // Excellent visibility
        guardianCai: true,
        guardianRuta: false
    },
    'usme_fiscala': {
        id: 'usme_fiscala',
        name: 'Conector La Fiscala Alta',
        localidad: 'Usme (05)',
        upz: 'UPZ 59 - El Danubio',
        baselineCrime: 'Bajo',
        coordinates: [
            [4.525, -74.105],
            [4.520, -74.100],
            [4.515, -74.098]
        ],
        lightingType: 'LED',
        watts: 150,
        weather: 'seco',
        visibility: 3,
        guardianCai: false,
        guardianRuta: false
    },
    'usme_valles': {
        id: 'usme_valles',
        name: 'Ciclorruta Valles de Cafam',
        localidad: 'Usme (05)',
        upz: 'UPZ 57 - Gran Yomasa',
        baselineCrime: 'Bajo',
        coordinates: [
            [4.512, -74.108],
            [4.504, -74.106],
            [4.498, -74.102]
        ],
        lightingType: 'LED',
        watts: 200,
        weather: 'seco',
        visibility: 3,
        guardianCai: false,
        guardianRuta: false
    },

    // ==========================================
    // Rafael Uribe Uribe Localidad (10 Tramos)
    // ==========================================
    'ruu_primero_mayo': {
        id: 'ruu_primero_mayo',
        name: 'Av. Primero de Mayo (Carrera 27 a Carrera 24)',
        localidad: 'Rafael Uribe Uribe (18)',
        upz: 'UPZ 39 - Quiroga',
        baselineCrime: 'Alto',
        coordinates: [
            [4.589, -74.114],
            [4.582, -74.121],
            [4.577, -74.127]
        ],
        lightingType: 'Sodio',
        watts: 150,
        weather: 'seco',
        visibility: 2,
        guardianCai: false,
        guardianRuta: false
    },
    'ruu_primero_mayo_oriente': {
        id: 'ruu_primero_mayo_oriente',
        name: 'Av. Primero de Mayo (Carrera 24 a Carrera 10)',
        localidad: 'Rafael Uribe Uribe (18)',
        upz: 'UPZ 39 - Quiroga',
        baselineCrime: 'Medio',
        coordinates: [
            [4.589, -74.114],
            [4.593, -74.107],
            [4.596, -74.102]
        ],
        lightingType: 'Sodio',
        watts: 150,
        weather: 'seco',
        visibility: 2,
        guardianCai: false,
        guardianRuta: false
    },
    'ruu_caracas_molinos': {
        id: 'ruu_caracas_molinos',
        name: 'Av. Caracas Sur (Quiroga a Molinos)',
        localidad: 'Rafael Uribe Uribe (18)',
        upz: 'UPZ 53 - Marco Fidel Suárez',
        baselineCrime: 'Alto',
        coordinates: [
            [4.577, -74.116],
            [4.568, -74.114],
            [4.560, -74.112],
            [4.550, -74.110]
        ],
        lightingType: 'Sodio',
        watts: 100,
        weather: 'seco',
        visibility: 2,
        guardianCai: false,
        guardianRuta: false
    },
    'ruu_carrera24': {
        id: 'ruu_carrera24',
        name: 'Av. Carrera 24 (Cl 27 Sur a Cl 40 Sur)',
        localidad: 'Rafael Uribe Uribe (18)',
        upz: 'UPZ 39 - Quiroga',
        baselineCrime: 'Medio',
        coordinates: [
            [4.586, -74.125],
            [4.578, -74.123],
            [4.573, -74.121]
        ],
        lightingType: 'LED',
        watts: 150,
        weather: 'seco',
        visibility: 2,
        guardianCai: false,
        guardianRuta: false
    },
    'ruu_gustavo_restrepo': {
        id: 'ruu_gustavo_restrepo',
        name: 'Ciclorruta Gustavo Restrepo / Centenario',
        localidad: 'Rafael Uribe Uribe (18)',
        upz: 'UPZ 39 - Quiroga',
        baselineCrime: 'Bajo',
        coordinates: [
            [4.582, -74.122],
            [4.580, -74.115],
            [4.577, -74.116]
        ],
        lightingType: 'LED',
        watts: 200,
        weather: 'seco',
        visibility: 3,
        guardianCai: false,
        guardianRuta: false
    },
    'ruu_cl40sur': {
        id: 'ruu_cl40sur',
        name: 'Calle 40 Sur (Marruecos a Caracas)',
        localidad: 'Rafael Uribe Uribe (18)',
        upz: 'UPZ 54 - Marruecos',
        baselineCrime: 'Alto',
        coordinates: [
            [4.574, -74.117],
            [4.568, -74.124],
            [4.561, -74.129]
        ],
        lightingType: 'Sodio',
        watts: 100,
        weather: 'seco',
        visibility: 1,
        guardianCai: false,
        guardianRuta: false
    },
    'ruu_marruecos_sur': {
        id: 'ruu_marruecos_sur',
        name: 'Ciclorruta Marruecos Sur (Conector Caracas)',
        localidad: 'Rafael Uribe Uribe (18)',
        upz: 'UPZ 54 - Marruecos',
        baselineCrime: 'Alto',
        coordinates: [
            [4.561, -74.129],
            [4.558, -74.122],
            [4.554, -74.118],
            [4.550, -74.110]
        ],
        lightingType: 'Sodio',
        watts: 100,
        weather: 'seco',
        visibility: 2,
        guardianCai: false,
        guardianRuta: false
    },
    'ruu_diana_turbay': {
        id: 'ruu_diana_turbay',
        name: 'Acceso Diana Turbay (Subida Principal)',
        localidad: 'Rafael Uribe Uribe (18)',
        upz: 'UPZ 55 - Diana Turbay',
        baselineCrime: 'Alto',
        coordinates: [
            [4.562, -74.118],
            [4.557, -74.122],
            [4.551, -74.120],
            [4.544, -74.124]
        ],
        lightingType: 'Sodio',
        watts: 50,
        weather: 'seco',
        visibility: 1,
        guardianCai: false,
        guardianRuta: false
    },
    'ruu_chimi': {
        id: 'ruu_chimi',
        name: 'Conector Chiminigagua - Diana Turbay',
        localidad: 'Rafael Uribe Uribe (18)',
        upz: 'UPZ 55 - Diana Turbay',
        baselineCrime: 'Alto',
        coordinates: [
            [4.551, -74.120],
            [4.548, -74.115],
            [4.546, -74.110]
        ],
        lightingType: 'Sodio',
        watts: 75,
        weather: 'seco',
        visibility: 1,
        guardianCai: false,
        guardianRuta: false
    },
    'ruu_marco_fidel': {
        id: 'ruu_marco_fidel',
        name: 'Conectora Marco Fidel Suárez',
        localidad: 'Rafael Uribe Uribe (18)',
        upz: 'UPZ 53 - Marco Fidel Suárez',
        baselineCrime: 'Bajo',
        coordinates: [
            [4.579, -74.114],
            [4.573, -74.111],
            [4.567, -74.114]
        ],
        lightingType: 'LED',
        watts: 200,
        weather: 'seco',
        visibility: 3,
        guardianCai: true,
        guardianRuta: false
    }
};

// Store leaflet layers associated with each segment ID
const mapLayers = {};

// Initialization on DOM load
document.addEventListener('DOMContentLoaded', () => {
    initMap();
    initShapChart();
    
    // Select default segment on start
    selectSegment('usme_caracas');
});

// Initialize Leaflet Map with Light/Clear Theme
function initMap() {
    // Center initially in Usme
    map = L.map('map', {
        zoomControl: true,
        attributionControl: true
    }).setView([4.506, -74.115], 13);

    // CartoDB Positron (Light) tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
    }).addTo(map);

    // Render boundary polygons for each locality
    renderBoundaries();

    // Draw all segments on the map
    renderAllSegments();

    // Listen for map clicks to audit or select routing points
    map.on('click', (e) => {
        if (selectingLocationMode) {
            handleLocationSelect(e.latlng);
            return;
        }

        const clickedPoint = [e.latlng.lat, e.latlng.lng];
        let insideActive = false;
        
        if (activeLocalidad === 'usme' && usmePolygon) {
            const coords = usmePolygon.getLatLngs()[0].map(ll => [ll.lat, ll.lng]);
            insideActive = isPointInPolygon(clickedPoint, coords);
        } else if (activeLocalidad === 'ruu' && ruuPolygon) {
            const coords = ruuPolygon.getLatLngs()[0].map(ll => [ll.lat, ll.lng]);
            insideActive = isPointInPolygon(clickedPoint, coords);
        }
        
        if (insideActive) {
            handleMapAuditClick(e.latlng);
        }
    });
}

// Render boundary polygons for Usme and Rafael Uribe Uribe
function renderBoundaries() {
    const usmeCoords = [
        [4.553, -74.105],
        [4.552, -74.114],
        [4.528, -74.132],
        [4.492, -74.135],
        [4.465, -74.132],
        [4.465, -74.122],
        [4.482, -74.102],
        [4.502, -74.095],
        [4.525, -74.095],
        [4.542, -74.099]
    ];
    
    const ruuCoords = [
        [4.597, -74.101],
        [4.591, -74.120],
        [4.580, -74.130],
        [4.565, -74.132],
        [4.551, -74.113],
        [4.551, -74.109],
        [4.562, -74.105],
        [4.575, -74.100],
        [4.590, -74.098]
    ];

    // Initialize boundaries with active style for Usme (default active)
    usmePolygon = L.polygon(usmeCoords, {
        color: '#6366f1',
        weight: 4,
        fillColor: '#6366f1',
        fillOpacity: 0.08,
        interactive: false
    }).addTo(map);

    ruuPolygon = L.polygon(ruuCoords, {
        color: '#a855f7',
        weight: 2,
        fillColor: '#a855f7',
        fillOpacity: 0.02,
        dashArray: '5, 10',
        interactive: false
    }).addTo(map);

    // Create standalone permanent tooltips positioned at optimal coordinates
    usmeTooltip = L.tooltip({
        permanent: true,
        direction: 'center',
        className: 'locality-tooltip usme-tooltip'
    })
    .setLatLng([4.522, -74.118])
    .setContent("<div class='locality-label-tooltip'><i class='fa-solid fa-map-pin'></i> Localidad de Usme (05)</div>")
    .addTo(map);

    ruuTooltip = L.tooltip({
        permanent: true,
        direction: 'center',
        className: 'locality-tooltip ruu-tooltip'
    })
    .setLatLng([4.580, -74.115])
    .setContent("<div class='locality-label-tooltip'><i class='fa-solid fa-map-pin'></i> Localidad Rafael Uribe Uribe (18)</div>")
    .addTo(map);

    // Set initial tooltip opacities (Usme active, RUU inactive)
    usmeTooltip.setOpacity(1.0);
    ruuTooltip.setOpacity(0.5);
}

// Render bike segments as colored polylines
function renderAllSegments() {
    // Clear existing layers if any
    Object.keys(mapLayers).forEach(id => {
        map.removeLayer(mapLayers[id]);
    });

    Object.keys(bikeSegments).forEach(id => {
        const segment = bikeSegments[id];
        
        // Calculate initial color based on default state risk level
        const prediction = calculateRisk(segment);
        const color = getRiskColor(prediction.level);
        
        // Create polyline
        const polyline = L.polyline(segment.coordinates, {
            color: color,
            weight: 6,
            opacity: 0.85,
            lineJoin: 'round'
        }).addTo(map);

        // Bind interactive events
        polyline.on('mouseover', function() {
            this.setStyle({
                weight: 10,
                opacity: 1.0
            });
        });

        polyline.on('mouseout', function() {
            // Restore normal style unless it is the selected segment
            const isSelected = selectedSegmentId === id;
            this.setStyle({
                weight: isSelected ? 9 : 6,
                opacity: 0.85
            });
        });

        polyline.on('click', (e) => {
            L.DomEvent.stopPropagation(e);
            selectSegment(id);
        });

        // Add a tooltip showing basic info
        polyline.bindTooltip(`<strong>${segment.name}</strong><br>UPZ: ${segment.upz}`, {
            sticky: true,
            className: 'custom-tooltip'
        });

        // Store reference
        mapLayers[id] = polyline;
    });
}

// Switch view between Localidades
function selectLocalidad(loc) {
    activeLocalidad = loc;
    
    // Clear active routes and custom markers when switching localities
    clearRoute();

    // Update Header buttons state
    document.getElementById('btn-usme').classList.toggle('active', loc === 'usme');
    document.getElementById('btn-ruu').classList.toggle('active', loc === 'ruu');

    // Update boundary polygon styles and tooltip opacities based on active locality
    if (usmePolygon && ruuPolygon) {
        if (loc === 'usme') {
            usmePolygon.setStyle({
                weight: 4,
                fillOpacity: 0.08,
                dashArray: null
            });
            ruuPolygon.setStyle({
                weight: 2,
                fillOpacity: 0.02,
                dashArray: '5, 10'
            });
            if (usmeTooltip) usmeTooltip.setOpacity(1.0);
            if (ruuTooltip) ruuTooltip.setOpacity(0.5);
        } else {
            usmePolygon.setStyle({
                weight: 2,
                fillOpacity: 0.02,
                dashArray: '5, 10'
            });
            ruuPolygon.setStyle({
                weight: 4,
                fillOpacity: 0.08,
                dashArray: null
            });
            if (usmeTooltip) usmeTooltip.setOpacity(0.5);
            if (ruuTooltip) ruuTooltip.setOpacity(1.0);
        }
    }

    // Pan map to locality center and select first segment
    if (loc === 'usme') {
        map.flyTo([4.506, -74.115], 13, { duration: 1.5 });
        selectSegment('usme_caracas');
    } else {
        map.flyTo([4.575, -74.122], 14, { duration: 1.5 });
        selectSegment('ruu_primero_mayo');
    }
}

// Select a specific segment and update UI controls
function selectSegment(id) {
    // Highlight segment on map
    if (selectedSegmentId && mapLayers[selectedSegmentId]) {
        // Reset old selected segment style
        const oldSeg = bikeSegments[selectedSegmentId];
        const oldPred = calculateRisk(oldSeg);
        mapLayers[selectedSegmentId].setStyle({
            weight: 6,
            color: getRiskColor(oldPred.level)
        });
    }

    selectedSegmentId = id;
    const segment = bikeSegments[id];

    // Style active segment
    const currentPred = calculateRisk(segment);
    if (mapLayers[id]) {
        mapLayers[id].setStyle({
            weight: 9,
            color: getRiskColor(currentPred.level)
        });
        mapLayers[id].bringToFront();
    }

    // Reset route comparison panel if selecting a predefined segment
    document.getElementById('prediction-main-container').classList.remove('has-route');

    // Update tramo details card in left panel
    document.getElementById('lbl-tramo-nombre').innerText = segment.name;
    document.getElementById('lbl-tramo-localidad').innerText = segment.localidad;
    document.getElementById('lbl-tramo-upz').innerText = segment.upz;
    
    const crimeBadge = document.getElementById('lbl-tramo-crimen');
    crimeBadge.innerText = segment.baselineCrime;
    crimeBadge.className = 'badge badge-' + segment.baselineCrime.toLowerCase();

    // Synchronize simulator controls with segment's current state
    syncControls(segment);
    
    // Recalculate and update the UI
    updatePrediction();
}

// Synchronize HTML form controls with segment state
function syncControls(segment) {
    // Alumbrado UAESP
    setLightingType(segment.lightingType, false); // false = do not trigger calculation loop yet
    document.getElementById('input-light-watts').value = segment.watts;
    document.getElementById('val-light-watts').innerText = segment.watts + ' W';

    // Weather IDIGER
    setWeather(segment.weather, false);

    // CPTED Visibilidad
    document.getElementById('input-cpted-visibility').value = segment.visibility;
    updateVisibilityLabel(segment.visibility);

    // Guardians Toggles
    document.getElementById('check-guardian-cai').checked = segment.guardianCai;
    document.getElementById('check-guardian-ruta').checked = segment.guardianRuta;
}

// Triggered by Alumbrado toggle button clicks
function setLightingType(type, triggerUpdate = true) {
    if (!selectedSegmentId) return;
    
    const segment = bikeSegments[selectedSegmentId];
    segment.lightingType = type;

    document.getElementById('btn-light-sodio').classList.toggle('active', type === 'Sodio');
    document.getElementById('btn-light-led').classList.toggle('active', type === 'LED');

    if (triggerUpdate) updatePrediction();
}

// Triggered by Watts slider
function updateWatts(val) {
    if (!selectedSegmentId) return;
    
    const segment = bikeSegments[selectedSegmentId];
    segment.watts = parseInt(val);
    
    document.getElementById('val-light-watts').innerText = val + ' W';
    updatePrediction();
}

// Triggered by Clima selector
function setWeather(weather, triggerUpdate = true) {
    if (!selectedSegmentId) return;
    
    const segment = bikeSegments[selectedSegmentId];
    segment.weather = weather;

    document.getElementById('btn-weather-dry').classList.toggle('active', weather === 'seco');
    document.getElementById('btn-weather-rain').classList.toggle('active', weather === 'lluvia');

    if (triggerUpdate) updatePrediction();
}

// Triggered by CPTED Visibility slider
function updateVisibility(val) {
    if (!selectedSegmentId) return;
    
    const segment = bikeSegments[selectedSegmentId];
    segment.visibility = parseInt(val);
    
    updateVisibilityLabel(val);
    updatePrediction();
}

function updateVisibilityLabel(val) {
    const labels = {
        1: 'Baja (Obstruido)',
        2: 'Regular',
        3: 'Buena (Despejado)'
    };
    document.getElementById('val-cpted-visibility').innerText = labels[val];
}

// Triggered by Guardian checkboxes
function toggleGuardian(type) {
    if (!selectedSegmentId) return;
    
    const segment = bikeSegments[selectedSegmentId];
    if (type === 'cai') {
        segment.guardianCai = document.getElementById('check-guardian-cai').checked;
    } else if (type === 'ruta') {
        segment.guardianRuta = document.getElementById('check-guardian-ruta').checked;
    }
    
    updatePrediction();
}

// Core Mathematical Simulator (Simulating the XGBoost model behavior)
function calculateRisk(segment) {
    // 1. Establish baseline expected value (score)
    const baseValue = 5.0;

    // 2. Compute SHAP components (feature contributions)
    
    // A. Historic Crime Baseline (SIEDCO)
    let shapCrime = 0.0;
    if (segment.baselineCrime === 'Alto') shapCrime = 2.4;
    else if (segment.baselineCrime === 'Medio') shapCrime = 0.2;
    else if (segment.baselineCrime === 'Bajo') shapCrime = -2.1;

    // B. Weather (IDIGER) - rain reduces natural vigilance as streets empty
    const shapWeather = (segment.weather === 'lluvia') ? 1.4 : -0.3;

    // C. Public Lighting Tech (UAESP) - Sodium yields poorer light definition than LED
    const shapLightingTech = (segment.lightingType === 'Sodio') ? 0.7 : -0.8;

    // D. Public Lighting Power (UAESP) - higher wattage directly lowers risk
    // Wattage ranges 50W to 250W. Expected baseline is 100W.
    const shapLightingPower = 0.4 - ((segment.watts - 50) / 200) * 1.1; 

    // E. Physical Obstacles / Visibility (CPTED)
    // 1 = Mala (+0.8), 2 = Regular (0.0), 3 = Buena (-0.9)
    let shapVisibility = 0.0;
    if (segment.visibility === 1) shapVisibility = 0.9;
    else if (segment.visibility === 3) shapVisibility = -1.0;

    // F. Guardians (CAI / Rutas Seguras)
    const shapCai = segment.guardianCai ? -1.3 : 0.0;
    const shapRuta = segment.guardianRuta ? -0.9 : 0.0;
    const shapGuardians = shapCai + shapRuta;

    // 3. Sum contributions to obtain final risk score
    let totalScore = baseValue + shapCrime + shapWeather + shapLightingTech + shapLightingPower + shapVisibility + shapGuardians;

    // Clamp score strictly between 0.5 and 9.5 for presentation
    const rawScore = totalScore;
    totalScore = Math.max(0.5, Math.min(9.5, totalScore));

    // Determine final risk category
    let level = 'Bajo';
    if (totalScore >= 7.0) level = 'Alto';
    else if (totalScore >= 3.8) level = 'Medio';

    return {
        score: totalScore.toFixed(1),
        level: level,
        shaps: {
            'Historial (SIEDCO)': shapCrime,
            'Clima (IDIGER)': shapWeather,
            'Tipo Luz (UAESP)': shapLightingTech,
            'Potencia (UAESP)': shapLightingPower,
            'Visibilidad (CPTED)': shapVisibility,
            'Guardianes (CAI/Ruta)': shapGuardians
        }
    };
}

// Get HEX color for a risk level
function getRiskColor(level) {
    if (level === 'Alto') return '#ef4444';
    if (level === 'Medio') return '#f59e0b';
    return '#10b981';
}

// Update UI elements based on recalculated risk
function updatePrediction() {
    if (!selectedSegmentId) return;

    const segment = bikeSegments[selectedSegmentId];
    const prediction = calculateRisk(segment);

    // Update risk gauge
    const lvlElement = document.getElementById('val-risk-level');
    lvlElement.innerText = prediction.level;
    lvlElement.className = 'risk-level risk-' + prediction.level.toLowerCase();

    document.getElementById('val-risk-score').innerText = prediction.score;

    // Update polyline color on the map dynamically!
    if (mapLayers[selectedSegmentId]) {
        mapLayers[selectedSegmentId].setStyle({
            color: getRiskColor(prediction.level)
        });
    }

    // Update SHAP chart
    updateShapChart(prediction.shaps);

    // Update CPTED Recommendations
    updateRecommendations(segment, prediction);
}

// Generate CPTED & Infrastructure recommendations dynamically
function updateRecommendations(segment, prediction) {
    const list = document.getElementById('list-recommendations');
    list.innerHTML = ''; // Clear

    const recs = [];

    // 1. Weather related recommendation
    if (segment.weather === 'lluvia') {
        recs.push({
            text: '<strong>Lluvia:</strong> Despliegue de patrullas móviles en horarios pico, ya que la lluvia reduce un 40% el flujo ciclista y la vigilancia natural.',
            warning: true
        });
    }

    // 2. Lighting Tech related recommendation
    if (segment.lightingType === 'Sodio') {
        recs.push({
            text: '<strong>Iluminación:</strong> Reemplazar la luminaria de Sodio por tecnología LED. Esto reduce el riesgo en un ~12% al mejorar la reproducción cromática del entorno.',
            warning: true
        });
    }

    // 3. Lighting Power related recommendation
    if (segment.watts < 150) {
        recs.push({
            text: `<strong>Potencia Lumínica:</strong> Incrementar la potencia del alumbrado (actualmente en ${segment.watts}W) a un estándar de 150W o superior para eliminar puntos ciegos.`,
            warning: true
        });
    }

    // 4. Visibility CPTED recommendation
    if (segment.visibility === 1) {
        recs.push({
            text: '<strong>Vigilancia Natural:</strong> Realizar poda de árboles y limpieza de laderas obstaculizadoras para asegurar líneas de visión despejadas ("ver y ser visto").',
            warning: true
        });
    } else if (segment.visibility === 2) {
        recs.push({
            text: '<strong>Vigilancia Natural:</strong> Se aconseja mantenimiento preventivo regular del follaje circundante para evitar que tape las luminarias.',
            warning: false
        });
    }

    // 5. Guardian recommendation if risk is high
    if (prediction.level === 'Alto' && !segment.guardianCai && !segment.guardianRuta) {
        recs.push({
            text: '<strong>Urgente:</strong> Establecer este tramo como prioridad de patrullaje preventivo del Plan Bogotá Camina Segura, o bien instalar un CAI móvil.',
            warning: true
        });
    }

    // Default good feedback if segment has low risk
    if (prediction.level === 'Bajo') {
        recs.push({
            text: '<strong>Entorno Seguro:</strong> El diseño físico actual (luminarias eficientes y visibilidad óptima) cumple con las directrices internacionales CPTED.',
            warning: false
        });
    }

    // Append to DOM
    recs.forEach(rec => {
        const li = document.createElement('li');
        li.innerHTML = rec.text;
        if (rec.warning) {
            li.className = 'warning';
        }
        list.appendChild(li);
    });
}

// Chart.js SHAP bar chart initialization
function initShapChart() {
    const ctx = document.getElementById('shapChart').getContext('2d');
    
    // Set custom font families
    Chart.defaults.font.family = "'Inter', sans-serif";
    Chart.defaults.color = '#94a3b8';

    shapChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [],
                borderWidth: 0,
                borderRadius: 4
            }]
        },
        options: {
            indexAxis: 'y', // horizontal bar chart
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false // hide legend
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const val = context.raw;
                            return `Impacto SHAP: ${val > 0 ? '+' : ''}${val.toFixed(2)}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)',
                        zeroLineColor: 'rgba(255, 255, 255, 0.2)'
                    },
                    ticks: {
                        font: {
                            size: 10
                        }
                    },
                    title: {
                        display: true,
                        text: '← Reduce Riesgo | Aumenta Riesgo →',
                        font: {
                            size: 10,
                            weight: '600'
                        }
                    }
                },
                y: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            size: 11,
                            weight: '600'
                        },
                        color: '#f8fafc'
                    }
                }
            }
        }
    });
}

// Create a custom audit point on the map where the user clicked
function handleMapAuditClick(latlng) {
    // Remove previous custom marker if it exists
    if (customAuditMarker) {
        map.removeLayer(customAuditMarker);
    }
    
    // Find nearest segment to copy UPZ and baseline crime rate
    const nearest = findNearestSegment(latlng);
    
    // Create or update the custom segment in our database
    bikeSegments['custom_audit'] = {
        id: 'custom_audit',
        name: `Calle Auditada (Lat: ${latlng.lat.toFixed(4)}, Lng: ${latlng.lng.toFixed(4)})`,
        localidad: activeLocalidad === 'usme' ? 'Usme (05)' : 'Rafael Uribe Uribe (18)',
        upz: nearest ? nearest.upz : (activeLocalidad === 'usme' ? 'UPZ 57 - Gran Yomasa' : 'UPZ 39 - Quiroga'),
        baselineCrime: nearest ? nearest.baselineCrime : 'Medio',
        coordinates: [[latlng.lat, latlng.lng]],
        lightingType: 'Sodio',
        watts: 100,
        weather: 'seco',
        visibility: 2,
        guardianCai: false,
        guardianRuta: false
    };

    // Create the custom marker with crosshairs icon
    customAuditMarker = L.marker([latlng.lat, latlng.lng], {
        icon: L.divIcon({
            className: 'custom-audit-pin',
            html: '<i class="fa-solid fa-location-crosshairs text-accent" style="font-size: 22px; filter: drop-shadow(0 0 5px rgba(99,102,241,0.8));"></i>',
            iconSize: [22, 22],
            iconAnchor: [11, 11]
        })
    }).addTo(map);

    // Bind tooltip to custom marker
    customAuditMarker.bindTooltip(`<strong>Punto de Auditoría</strong><br>Lat: ${latlng.lat.toFixed(4)} Lng: ${latlng.lng.toFixed(4)}`, {
        sticky: true,
        className: 'custom-tooltip'
    });

    // Reset route comparison panel layout to show segment details card
    document.getElementById('prediction-main-container').classList.remove('has-route');

    // Select this custom segment in the UI
    selectSegment('custom_audit');
}

// ==========================================
// Route Planning & Navigation Engine
// ==========================================

// Enable map click mode to set origin or destination coordinates
function startLocationSelect(mode) {
    selectingLocationMode = mode;
    
    // Toggle active styles on buttons
    document.getElementById('btn-select-origin').classList.toggle('active', mode === 'origin');
    document.getElementById('btn-select-dest').classList.toggle('active', mode === 'destination');
    
    // Change mouse cursor over the map to crosshair
    document.getElementById('map').style.cursor = 'crosshair';
}

// Receive coordinates from map click in select mode
function handleLocationSelect(latlng) {
    const mode = selectingLocationMode;
    selectingLocationMode = null;
    
    // Reset buttons and map cursor
    document.getElementById('btn-select-origin').classList.remove('active');
    document.getElementById('btn-select-dest').classList.remove('active');
    document.getElementById('map').style.cursor = '';
    
    // Store point coordinate
    routePoints[mode] = { lat: latlng.lat, lng: latlng.lng };
    
    // Place/update marker on map
    updateRouteMarkersOnMap();
    
    // Update HTML input text with raw coordinates
    const inputId = mode === 'origin' ? 'input-route-origin' : 'input-route-dest';
    document.getElementById(inputId).value = `${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}`;
}

// Update origin and destination pins on the map
function updateRouteMarkersOnMap() {
    ['origin', 'destination'].forEach(mode => {
        const pt = routePoints[mode];
        if (pt) {
            if (routeMarkers[mode]) map.removeLayer(routeMarkers[mode]);
            
            const iconColor = mode === 'origin' ? '#10b981' : '#ef4444';
            const label = mode === 'origin' ? 'Origen' : 'Destino';
            
            routeMarkers[mode] = L.marker([pt.lat, pt.lng], {
                icon: L.divIcon({
                    className: 'route-point-marker',
                    html: `<i class="fa-solid fa-location-dot" style="font-size: 24px; color: ${iconColor}; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));"></i>`,
                    iconSize: [24, 24],
                    iconAnchor: [12, 24]
                })
            }).addTo(map);
            
            routeMarkers[mode].bindTooltip(`<strong>${label}</strong><br>Lat: ${pt.lat.toFixed(4)}, Lng: ${pt.lng.toFixed(4)}`, {
                permanent: false,
                className: 'custom-tooltip'
            });
        }
    });
}

// Trigger routing calculation from search panel buttons
async function calculateRouteSearch() {
    const originText = document.getElementById('input-route-origin').value.trim();
    const destText = document.getElementById('input-route-dest').value.trim();
    
    if (!originText || !destText) {
        alert("Por favor, ingresa origen y destino (escribiendo o haciendo clic en el mapa).");
        return;
    }
    
    const coordRegex = /^(-?\d+\.\d+),\s*(-?\d+\.\d+)$/;
    const calcBtn = document.getElementById('btn-calculate-route');
    
    let originCoord = null;
    const originMatch = originText.match(coordRegex);
    if (originMatch) {
        originCoord = { lat: parseFloat(originMatch[1]), lng: parseFloat(originMatch[2]) };
    } else {
        calcBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Buscando origen...';
        const result = await geocodeAddress(originText);
        if (result) {
            originCoord = { lat: result.lat, lng: result.lng };
            document.getElementById('input-route-origin').value = result.name;
        } else {
            alert(`No se pudo encontrar la ubicación de origen: "${originText}"`);
            calcBtn.innerHTML = '<i class="fa-solid fa-compass"></i> Calcular Ruta';
            return;
        }
    }
    
    let destCoord = null;
    const destMatch = destText.match(coordRegex);
    if (destMatch) {
        destCoord = { lat: parseFloat(destMatch[1]), lng: parseFloat(destMatch[2]) };
    } else {
        calcBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Buscando destino...';
        const result = await geocodeAddress(destText);
        if (result) {
            destCoord = { lat: result.lat, lng: result.lng };
            document.getElementById('input-route-dest').value = result.name;
        } else {
            alert(`No se pudo encontrar la ubicación de destino: "${destText}"`);
            calcBtn.innerHTML = '<i class="fa-solid fa-compass"></i> Calcular Ruta';
            return;
        }
    }
    
    routePoints.origin = originCoord;
    routePoints.destination = destCoord;
    updateRouteMarkersOnMap();
    
    calcBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Trazando ruta...';
    await generateAndRenderRoutes();
    calcBtn.innerHTML = '<i class="fa-solid fa-compass"></i> Calcular Ruta';
}

// Fetch geocoding search queries using OpenStreetMap Nominatim API
async function geocodeAddress(addressText) {
    // Restrict query context to Bogota, Colombia
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(addressText)},+Bogota,+Colombia&format=json&limit=1`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data && data.length > 0) {
            return {
                lat: parseFloat(data[0].lat),
                lng: parseFloat(data[0].lon),
                name: data[0].display_name.split(',')[0]
            };
        }
    } catch (error) {
        console.error("Geocoding failed:", error);
    }
    return null;
}

// Fetch alternative routes from OSRM Routing service
async function fetchOSRMAlternatives(origin, dest) {
    const url = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${dest.lng},${dest.lat}?overview=full&geometries=geojson&alternatives=true`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data && data.code === 'Ok') {
            return data.routes;
        }
    } catch (error) {
        console.error("OSRM routing service failed:", error);
    }
    return [];
}

// Calculate risk at a specific coordinate based on CPTED and historic crime baseline
function evaluateCoordinatesRisk(lat, lng) {
    const nearest = findNearestSegment({ lat, lng });
    const baseValue = 5.0;
    
    let shapCrime = 0.0;
    const baseline = nearest ? nearest.baselineCrime : 'Medio';
    if (baseline === 'Alto') shapCrime = 2.4;
    else if (baseline === 'Medio') shapCrime = 0.2;
    else if (baseline === 'Bajo') shapCrime = -2.1;
    
    const weather = document.getElementById('btn-weather-rain').classList.contains('active') ? 'lluvia' : 'seco';
    const lightingType = document.getElementById('btn-light-led').classList.contains('active') ? 'LED' : 'Sodio';
    const watts = parseInt(document.getElementById('input-light-watts').value);
    const visibilityVal = parseInt(document.getElementById('input-cpted-visibility').value);
    const guardianCai = document.getElementById('check-guardian-cai').checked;
    const guardianRuta = document.getElementById('check-guardian-ruta').checked;
    
    const shapWeather = (weather === 'lluvia') ? 1.4 : -0.3;
    const shapLightingTech = (lightingType === 'Sodio') ? 0.7 : -0.8;
    const shapLightingPower = 0.4 - ((watts - 50) / 200) * 1.1;
    
    let shapVisibility = 0.0;
    if (visibilityVal === 1) shapVisibility = 0.9;
    else if (visibilityVal === 3) shapVisibility = -1.0;
    
    const shapCai = guardianCai ? -1.3 : 0.0;
    const shapRuta = guardianRuta ? -0.9 : 0.0;
    
    let score = baseValue + shapCrime + shapWeather + shapLightingTech + shapLightingPower + shapVisibility + (shapCai + shapRuta);
    score = Math.max(0.5, Math.min(9.5, score));
    
    let level = 'Bajo';
    if (score >= 7.0) level = 'Alto';
    else if (score >= 3.8) level = 'Medio';
    
    return { score, level };
}

// Calculate the average risk and max risk levels across route coordinates
function calculateRouteAverageRisk(coords) {
    let totalScore = 0;
    let maxScore = 0;
    const step = Math.max(1, Math.floor(coords.length / 20)); // sample coordinates to keep performance high
    let count = 0;
    
    for (let i = 0; i < coords.length; i += step) {
        const pt = coords[i];
        const risk = evaluateCoordinatesRisk(pt[0], pt[1]);
        totalScore += parseFloat(risk.score);
        if (parseFloat(risk.score) > maxScore) {
            maxScore = parseFloat(risk.score);
        }
        count++;
    }
    
    const avgScore = (totalScore / count).toFixed(1);
    let maxLevel = 'Bajo';
    if (maxScore >= 7.0) maxLevel = 'Alto';
    else if (maxScore >= 3.8) maxLevel = 'Medio';
    
    return { avgScore, maxLevel };
}

// Clear, fetch, and render alternative routes
async function generateAndRenderRoutes() {
    const origin = routePoints.origin;
    const dest = routePoints.destination;
    
    if (!origin || !dest) return;
    
    clearActiveRoutesFromMap();
    
    const routesData = await fetchOSRMAlternatives(origin, dest);
    if (routesData.length === 0) {
        alert("No se pudieron encontrar rutas para los puntos ingresados.");
        return;
    }
    
    generatedRoutes = [];
    
    routesData.forEach((route, idx) => {
        const leafletCoords = route.geometry.coordinates.map(pt => [pt[1], pt[0]]);
        const riskDetails = calculateRouteAverageRisk(leafletCoords);
        
        generatedRoutes.push({
            id: `route_${idx}`,
            name: `Ruta ${idx + 1}`,
            distanceKm: (route.distance / 1000).toFixed(1),
            durationMin: (route.duration / 60).toFixed(0),
            coordinates: leafletCoords,
            avgRiskScore: riskDetails.avgScore,
            maxRiskLevel: riskDetails.maxLevel,
            layers: null
        });
    });
    
    activeRouteId = 'route_0';
    renderRouteLayers();
    updateRouteComparisonUI();
    
    document.getElementById('btn-clear-route').style.display = 'block';
    document.getElementById('route-comparison-box').style.display = 'block';
    document.getElementById('prediction-main-container').classList.add('has-route');
    
    selectRoute(activeRouteId);
}

// Draw route polylines colored segment-by-segment by risk level
function drawColoredRoute(routeCoords, isActive) {
    const group = L.layerGroup();
    
    for (let i = 0; i < routeCoords.length - 1; i++) {
        const pt1 = routeCoords[i];
        const pt2 = routeCoords[i+1];
        
        const midLat = (pt1[0] + pt2[0]) / 2;
        const midLng = (pt1[1] + pt2[1]) / 2;
        const risk = evaluateCoordinatesRisk(midLat, midLng);
        const color = getRiskColor(risk.level);
        
        const polyline = L.polyline([pt1, pt2], {
            color: color,
            weight: isActive ? 8 : 4,
            opacity: isActive ? 0.95 : 0.25,
            lineJoin: 'round'
        });
        
        group.addLayer(polyline);
    }
    
    return group;
}

// Render route layers on map
function renderRouteLayers() {
    generatedRoutes.forEach(route => {
        const isActive = route.id === activeRouteId;
        const layerGroup = drawColoredRoute(route.coordinates, isActive);
        
        layerGroup.eachLayer(layer => {
            layer.on('click', (e) => {
                L.DomEvent.stopPropagation(e);
                selectRoute(route.id);
            });
            
            layer.bindTooltip(`<strong>${route.name}</strong><br>Distancia: ${route.distanceKm} km<br>Riesgo Promedio: ${route.avgRiskScore}`, {
                sticky: true,
                className: 'custom-tooltip'
            });
        });
        
        layerGroup.addTo(map);
        route.layers = layerGroup;
    });
}

// Select a route alternative and update UI predictions
function selectRoute(routeId) {
    activeRouteId = routeId;
    const route = generatedRoutes.find(r => r.id === routeId);
    if (!route) return;
    
    generatedRoutes.forEach(r => {
        const isActive = r.id === routeId;
        if (r.layers) {
            r.layers.eachLayer(poly => {
                poly.setStyle({
                    weight: isActive ? 8 : 4,
                    opacity: isActive ? 0.95 : 0.25
                });
                if (isActive) poly.bringToFront();
            });
        }
    });
    
    document.querySelectorAll('.route-card').forEach(card => {
        card.classList.toggle('active', card.getAttribute('data-route-id') === routeId);
    });
    
    const lvlElement = document.getElementById('val-risk-level');
    let overallLevel = 'Bajo';
    if (route.avgRiskScore >= 7.0) overallLevel = 'Alto';
    else if (route.avgRiskScore >= 3.8) overallLevel = 'Medio';
    
    lvlElement.innerText = overallLevel;
    lvlElement.className = 'risk-level risk-' + overallLevel.toLowerCase();
    document.getElementById('val-risk-score').innerText = route.avgRiskScore;
    
    updateRouteRecommendations(route);
}

// Render recommendations specific to route conditions
function updateRouteRecommendations(route) {
    const list = document.getElementById('list-recommendations');
    list.innerHTML = '';
    
    const recs = [];
    recs.push({
        text: `<strong>Resumen de Trayecto:</strong> Ruta de ${route.distanceKm} km (${route.durationMin} min) con un índice de riesgo promedio de <strong>${route.avgRiskScore}</strong>.`,
        warning: false
    });
    
    const weather = document.getElementById('btn-weather-rain').classList.contains('active') ? 'lluvia' : 'seco';
    const lightingType = document.getElementById('btn-light-led').classList.contains('active') ? 'LED' : 'Sodio';
    const watts = parseInt(document.getElementById('input-light-watts').value);
    
    if (route.maxRiskLevel === 'Alto') {
        recs.push({
            text: '<strong>Puntos Críticos Detectados:</strong> Esta ruta cruza tramos catalogados como de Alto Riesgo. Se sugiere transitar con precaución o activar patrullas móviles.',
            warning: true
        });
    }
    
    if (lightingType === 'Sodio') {
        recs.push({
            text: '<strong>Alumbrado Público:</strong> La ruta tiene luminarias de Sodio. Cambiarlas a LED a nivel distrital reduciría el riesgo promedio de atraco un ~12%.',
            warning: true
        });
    }
    
    if (watts < 150) {
        recs.push({
            text: '<strong>Potencia Lumínica:</strong> Se detectaron sectores con wattaje deficiente. Incrementar la potencia eliminará zonas oscuras en curvas ciegas.',
            warning: true
        });
    }
    
    if (weather === 'lluvia') {
        recs.push({
            text: '<strong>Alerta Clima:</strong> La lluvia reduce el flujo peatonal. Si viajas en estas condiciones, prefiere rutas principales con patrullaje activo.',
            warning: true
        });
    }
    
    const safestRoute = generatedRoutes.reduce((prev, curr) => parseFloat(prev.avgRiskScore) < parseFloat(curr.avgRiskScore) ? prev : curr);
    if (route.id === safestRoute.id && generatedRoutes.length > 1) {
        recs.push({
            text: '<strong>Ruta Recomendada:</strong> Has seleccionado la alternativa de menor exposición al delito del sistema.',
            warning: false
        });
    } else if (generatedRoutes.length > 1) {
        recs.push({
            text: `<strong>Sugerencia de Seguridad:</strong> La ${safestRoute.name} tiene un riesgo menor (${safestRoute.avgRiskScore}). Considera seleccionarla.`,
            warning: false
        });
    }
    
    recs.forEach(rec => {
        const li = document.createElement('li');
        li.innerHTML = rec.text;
        if (rec.warning) li.className = 'warning';
        list.appendChild(li);
    });
}

// Update routing cards comparison in the prediction results box
function updateRouteComparisonUI() {
    const listContainer = document.getElementById('list-route-alternatives');
    listContainer.innerHTML = '';
    
    generatedRoutes.forEach(route => {
        let riskClass = 'risk-low';
        let riskText = 'Bajo';
        
        if (route.avgRiskScore >= 7.0) {
            riskClass = 'risk-high';
            riskText = 'Alto';
        } else if (route.avgRiskScore >= 3.8) {
            riskClass = 'risk-mid';
            riskText = 'Medio';
        }
        
        const card = document.createElement('div');
        card.className = `route-card ${route.id === activeRouteId ? 'active' : ''}`;
        card.setAttribute('data-route-id', route.id);
        card.onclick = () => selectRoute(route.id);
        
        card.innerHTML = `
            <div class="route-card-header">
                <span class="route-card-title">${route.name}</span>
                <span class="route-card-meta">${route.distanceKm} km • ${route.durationMin} min</span>
            </div>
            <div class="route-card-risk">
                <span class="route-card-meta">Riesgo Promedio:</span>
                <span class="${riskClass}">${route.avgRiskScore} (${riskText})</span>
            </div>
        `;
        
        listContainer.appendChild(card);
    });
}

// Clear all active routes from map and memory and restore default state
function clearRoute() {
    clearActiveRoutesFromMap();
    generatedRoutes = [];
    activeRouteId = null;
    
    document.getElementById('input-route-dest').value = '';
    
    ['origin', 'destination'].forEach(mode => {
        if (routeMarkers[mode]) {
            map.removeLayer(routeMarkers[mode]);
            routeMarkers[mode] = null;
        }
        routePoints[mode] = null;
    });
    
    document.getElementById('route-comparison-box').style.display = 'none';
    document.getElementById('btn-clear-route').style.display = 'none';
    document.getElementById('prediction-main-container').classList.remove('has-route');
    
    if (activeLocalidad === 'usme') {
        document.getElementById('input-route-origin').value = 'Portal Usme';
        selectSegment('usme_caracas');
    } else {
        document.getElementById('input-route-origin').value = 'Molinos';
        selectSegment('ruu_primero_mayo');
    }
}

// Clear route polylines from the map
function clearActiveRoutesFromMap() {
    generatedRoutes.forEach(r => {
        if (r.layers) {
            map.removeLayer(r.layers);
        }
    });
}

// Toggle view mode between Citizen (simple) and Scientific (technical)
function setViewMode(mode) {
    if (mode === 'citizen') {
        document.body.classList.add('simple-view');
        document.getElementById('btn-view-citizen').classList.add('active');
        document.getElementById('btn-view-tech').classList.remove('active');
    } else {
        document.body.classList.remove('simple-view');
        document.getElementById('btn-view-citizen').classList.remove('active');
        document.getElementById('btn-view-tech').classList.add('active');
    }
    
    // Invalidate map size so Leaflet resizes correctly when the right column is shown/hidden
    setTimeout(() => {
        if (map) map.invalidateSize();
    }, 300);
}

// Check if a coordinates point is inside a polygon (Ray-Casting Algorithm)
function isPointInPolygon(point, polygonCoords) {
    const x = point[0], y = point[1];
    let inside = false;
    for (let i = 0, j = polygonCoords.length - 1; i < polygonCoords.length; j = i++) {
        const xi = polygonCoords[i][0], yi = polygonCoords[i][1];
        const xj = polygonCoords[j][0], yj = polygonCoords[j][1];
        const intersect = ((yi > y) !== (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
}

// Find nearest pre-defined segment to a given coordinate (for UPZ/Crime rate estimation)
function findNearestSegment(latlng) {
    let nearestSeg = null;
    let minDist = Infinity;
    
    Object.keys(bikeSegments).forEach(id => {
        const segment = bikeSegments[id];
        if (segment.id === 'custom_audit') return;
        
        const start = segment.coordinates[0];
        const dist = Math.sqrt(Math.pow(latlng.lat - start[0], 2) + Math.pow(latlng.lng - start[1], 2));
        if (dist < minDist) {
            minDist = dist;
            nearestSeg = segment;
        }
    });
    
    return nearestSeg;
}

// Create a custom audit point on the map where the user clicked
function handleMapAuditClick(latlng) {
    // Remove previous custom marker if it exists
    if (customAuditMarker) {
        map.removeLayer(customAuditMarker);
    }
    
    // Find nearest segment to copy UPZ and baseline crime rate
    const nearest = findNearestSegment(latlng);
    
    // Create or update the custom segment in our database
    bikeSegments['custom_audit'] = {
        id: 'custom_audit',
        name: `Calle Auditada (Lat: ${latlng.lat.toFixed(4)}, Lng: ${latlng.lng.toFixed(4)})`,
        localidad: activeLocalidad === 'usme' ? 'Usme (05)' : 'Rafael Uribe Uribe (18)',
        upz: nearest ? nearest.upz : (activeLocalidad === 'usme' ? 'UPZ 57 - Gran Yomasa' : 'UPZ 39 - Quiroga'),
        baselineCrime: nearest ? nearest.baselineCrime : 'Medio',
        coordinates: [[latlng.lat, latlng.lng]],
        lightingType: 'Sodio',
        watts: 100,
        weather: 'seco',
        visibility: 2,
        guardianCai: false,
        guardianRuta: false
    };

    // Create the custom marker with crosshairs icon
    customAuditMarker = L.marker([latlng.lat, latlng.lng], {
        icon: L.divIcon({
            className: 'custom-audit-pin',
            html: '<i class="fa-solid fa-location-crosshairs text-accent" style="font-size: 22px; filter: drop-shadow(0 0 5px rgba(99,102,241,0.8));"></i>',
            iconSize: [22, 22],
            iconAnchor: [11, 11]
        })
    }).addTo(map);

    // Bind tooltip to custom marker
    customAuditMarker.bindTooltip(`<strong>Punto de Auditoría</strong><br>Lat: ${latlng.lat.toFixed(4)} Lng: ${latlng.lng.toFixed(4)}`, {
        sticky: true,
        className: 'custom-tooltip'
    });

    // Select this custom segment in the UI
    selectSegment('custom_audit');
}
