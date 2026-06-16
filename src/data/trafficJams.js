// Datos de trancones (congestión vehicular) en tiempo real para SafeCycle Bogotá
// Fuente simulada: Waze / Google Maps / Secretaría de Movilidad

export const trafficJams = [
    {
        id: 'tj_caracas_usme',
        name: 'Trancón Av. Caracas Sur - Portal Usme',
        fromName: 'Av. Caracas con Calle 68 Sur',
        toName: 'Portal Usme (Estación TM)',
        coordinates: [
            [4.542, -74.110],
            [4.536, -74.109],
            [4.532, -74.108],
            [4.528, -74.109],
            [4.524, -74.111]
        ],
        severity: 'severo',
        delayMinutes: 12,
        source: 'Waze',
        localidad: 'usme',
        reportedTime: '07:45 AM'
    },
    {
        id: 'tj_boyaca_comuneros',
        name: 'Trancón Av. Boyacá Sur',
        fromName: 'Av. Boyacá con Calle 73 Sur',
        toName: 'Av. Boyacá con Av. Villavicencio',
        coordinates: [
            [4.515, -74.128],
            [4.510, -74.125],
            [4.505, -74.121],
            [4.500, -74.118]
        ],
        severity: 'moderado',
        delayMinutes: 7,
        source: 'Google Maps',
        localidad: 'usme',
        reportedTime: '08:10 AM'
    },
    {
        id: 'tj_primero_mayo',
        name: 'Trancón Av. Primero de Mayo',
        fromName: 'Av. 1° de Mayo con Carrera 27',
        toName: 'Av. 1° de Mayo con Carrera 10',
        coordinates: [
            [4.589, -74.114],
            [4.591, -74.110],
            [4.593, -74.107],
            [4.595, -74.103],
            [4.596, -74.102]
        ],
        severity: 'severo',
        delayMinutes: 15,
        source: 'Waze',
        localidad: 'ruu',
        reportedTime: '07:30 AM'
    },
    {
        id: 'tj_caracas_molinos',
        name: 'Trancón Av. Caracas - Molinos',
        fromName: 'Av. Caracas con Calle 46 Sur (Quiroga)',
        toName: 'Av. Caracas con Calle 58 Sur (Molinos)',
        coordinates: [
            [4.577, -74.116],
            [4.572, -74.115],
            [4.568, -74.114],
            [4.563, -74.113],
            [4.560, -74.112]
        ],
        severity: 'moderado',
        delayMinutes: 8,
        source: 'Secretaría de Movilidad',
        localidad: 'ruu',
        reportedTime: '08:00 AM'
    },
    {
        id: 'tj_autopista_sur',
        name: 'Trancón Autopista Sur - Kennedy',
        fromName: 'Autopista Sur con Av. 68',
        toName: 'Autopista Sur con Av. Boyacá',
        coordinates: [
            [4.610, -74.135],
            [4.612, -74.140],
            [4.615, -74.145],
            [4.618, -74.150],
            [4.620, -74.155]
        ],
        severity: 'severo',
        delayMinutes: 18,
        source: 'Waze',
        localidad: 'kennedy',
        reportedTime: '07:15 AM'
    },
    {
        id: 'tj_calle26_fontibon',
        name: 'Trancón Calle 26 - Fontibón',
        fromName: 'Calle 26 con Av. 68',
        toName: 'Calle 26 con Av. Ciudad de Cali',
        coordinates: [
            [4.660, -74.100],
            [4.662, -74.108],
            [4.665, -74.115],
            [4.668, -74.122],
            [4.670, -74.130]
        ],
        severity: 'moderado',
        delayMinutes: 10,
        source: 'Google Maps',
        localidad: 'fontibon',
        reportedTime: '07:50 AM'
    },
    {
        id: 'tj_septima_chapinero',
        name: 'Trancón Carrera 7 - Chapinero',
        fromName: 'Cra 7 con Calle 72',
        toName: 'Cra 7 con Calle 57',
        coordinates: [
            [4.660, -74.052],
            [4.656, -74.054],
            [4.650, -74.056],
            [4.646, -74.058],
            [4.642, -74.060]
        ],
        severity: 'leve',
        delayMinutes: 5,
        source: 'Waze',
        localidad: 'chapinero',
        reportedTime: '08:20 AM'
    },
    {
        id: 'tj_nqs_centro',
        name: 'Trancón NQS - Centro',
        fromName: 'NQS con Calle 26',
        toName: 'NQS con Calle 6',
        coordinates: [
            [4.635, -74.085],
            [4.628, -74.084],
            [4.620, -74.083],
            [4.612, -74.082],
            [4.605, -74.080]
        ],
        severity: 'moderado',
        delayMinutes: 9,
        source: 'Secretaría de Movilidad',
        localidad: 'losmartires',
        reportedTime: '07:55 AM'
    },
    {
        id: 'tj_suba_cali',
        name: 'Trancón Av. Suba con Av. Ciudad de Cali',
        fromName: 'Av. Suba con Calle 116',
        toName: 'Av. Suba con Calle 127',
        coordinates: [
            [4.712, -74.078],
            [4.716, -74.082],
            [4.720, -74.086],
            [4.724, -74.090]
        ],
        severity: 'leve',
        delayMinutes: 4,
        source: 'Google Maps',
        localidad: 'suba',
        reportedTime: '08:30 AM'
    },
    {
        id: 'tj_villavicencio',
        name: 'Trancón Av. Villavicencio',
        fromName: 'Av. Villavicencio con Av. Caracas',
        toName: 'Av. Villavicencio con Av. Boyacá',
        coordinates: [
            [4.560, -74.112],
            [4.558, -74.118],
            [4.555, -74.122],
            [4.552, -74.126],
            [4.548, -74.130]
        ],
        severity: 'moderado',
        delayMinutes: 8,
        source: 'Waze',
        localidad: 'usme',
        reportedTime: '07:40 AM'
    }
];
