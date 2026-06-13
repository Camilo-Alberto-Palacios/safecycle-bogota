// Boundaries and segment data for SafeCycle Bogotá

export const usmeCoords = [
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

export const ruuCoords = [
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

export const bikeSegments = {
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
        baselineCrime: 'Alto',
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
        visibility: 1,
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
        guardianRuta: true
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
        visibility: 3,
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
