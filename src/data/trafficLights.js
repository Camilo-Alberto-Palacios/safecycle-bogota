// Datos georreferenciados de semáforos para SafeCycle Bogotá - Cobertura completa de Bogotá
// Fuente referencial: Secretaría Distrital de Movilidad (SDM) - Intersecciones principales

export const trafficLights = [
    // ─────────────────────────────────────────────────────────
    // USME (Localidad 05)
    // ─────────────────────────────────────────────────────────
    {
        id: 'tf_usme_01',
        name: 'Semáforo Av. Caracas con Entrada Portal Usme',
        intersection: 'Av. Caracas con Entrada Portal Usme',
        coordinates: [4.532, -74.108],
        localidad: 'usme',
        state: 'verde',
        cycleTime: 35,
        type: 'vehicular_ciclista'
    },
    {
        id: 'tf_usme_02',
        name: 'Semáforo Av. Caracas con Av. Boyacá (Yomasa)',
        intersection: 'Av. Caracas con Av. Boyacá',
        coordinates: [4.492, -74.119],
        localidad: 'usme',
        state: 'rojo',
        cycleTime: 40,
        type: 'vehicular_ciclista'
    },
    {
        id: 'tf_usme_03',
        name: 'Semáforo Av. Caracas con Calle 56 Sur (Danubio)',
        intersection: 'Av. Caracas con Calle 56 Sur',
        coordinates: [4.542, -74.110],
        localidad: 'usme',
        state: 'rojo',
        cycleTime: 30,
        type: 'vehicular'
    },
    {
        id: 'tf_usme_04',
        name: 'Semáforo Portal Usme (Entrada Transmilenio)',
        intersection: 'Portal Usme - Av. Boyacá',
        coordinates: [4.520, -74.113],
        localidad: 'usme',
        state: 'verde',
        cycleTime: 45,
        type: 'vehicular_ciclista'
    },
    {
        id: 'tf_usme_05',
        name: 'Semáforo Carrera 5 con Calle 90 Sur (Alfonso López)',
        intersection: 'Cra 5 con Calle 90 Sur',
        coordinates: [4.468, -74.128],
        localidad: 'usme',
        state: 'amarillo',
        cycleTime: 25,
        type: 'vehicular'
    },
    {
        id: 'tf_usme_06',
        name: 'Semáforo Autopista al Llano con Usme Pueblo',
        intersection: 'Autopista al Llano - Usme Pueblo',
        coordinates: [4.480, -74.107],
        localidad: 'usme',
        state: 'verde',
        cycleTime: 30,
        type: 'vehicular'
    },
    {
        id: 'tf_usme_07',
        name: 'Semáforo Av. Caracas con Calle 75 Sur',
        intersection: 'Av. Caracas con Calle 75 Sur',
        coordinates: [4.505, -74.116],
        localidad: 'usme',
        state: 'rojo',
        cycleTime: 35,
        type: 'vehicular_ciclista'
    },

    // ─────────────────────────────────────────────────────────
    // RAFAEL URIBE URIBE (Localidad 18)
    // ─────────────────────────────────────────────────────────
    {
        id: 'tf_ruu_01',
        name: 'Semáforo Av. Primero de Mayo con Av. Caracas',
        intersection: 'Av. Primero de Mayo con Av. Caracas',
        coordinates: [4.589, -74.114],
        localidad: 'ruu',
        state: 'verde',
        cycleTime: 30,
        type: 'vehicular_ciclista'
    },
    {
        id: 'tf_ruu_02',
        name: 'Semáforo Av. Primero de Mayo con Carrera 10',
        intersection: 'Av. Primero de Mayo con Cra 10',
        coordinates: [4.596, -74.102],
        localidad: 'ruu',
        state: 'rojo',
        cycleTime: 40,
        type: 'vehicular_ciclista'
    },
    {
        id: 'tf_ruu_03',
        name: 'Semáforo Av. Caracas con Calle 40 Sur (Quiroga)',
        intersection: 'Av. Caracas con Calle 40 Sur',
        coordinates: [4.574, -74.117],
        localidad: 'ruu',
        state: 'verde',
        cycleTime: 35,
        type: 'vehicular'
    },
    {
        id: 'tf_ruu_04',
        name: 'Semáforo Carrera 24 con Calle 36 Sur',
        intersection: 'Cra 24 con Calle 36 Sur',
        coordinates: [4.578, -74.123],
        localidad: 'ruu',
        state: 'rojo',
        cycleTime: 25,
        type: 'vehicular_ciclista'
    },
    {
        id: 'tf_ruu_05',
        name: 'Semáforo Diana Turbay con Calle 48 Sur',
        intersection: 'Subida Diana Turbay con Calle 48 Sur',
        coordinates: [4.557, -74.122],
        localidad: 'ruu',
        state: 'verde',
        cycleTime: 30,
        type: 'vehicular'
    },
    {
        id: 'tf_ruu_06',
        name: 'Semáforo Av. Caracas con Av. Villavicencio (Molinos)',
        intersection: 'Av. Caracas con Av. Villavicencio',
        coordinates: [4.560, -74.112],
        localidad: 'ruu',
        state: 'verde',
        cycleTime: 45,
        type: 'vehicular_ciclista'
    },
    {
        id: 'tf_ruu_07',
        name: 'Semáforo Av. Boyacá con Calle 44 Sur',
        intersection: 'Av. Boyacá con Calle 44 Sur',
        coordinates: [4.570, -74.130],
        localidad: 'ruu',
        state: 'amarillo',
        cycleTime: 30,
        type: 'vehicular'
    },
    {
        id: 'tf_ruu_08',
        name: 'Semáforo Av. Boyacá con Calle 61 Sur (Meissen)',
        intersection: 'Av. Boyacá con Calle 61 Sur',
        coordinates: [4.515, -74.128],
        localidad: 'ruu',
        state: 'verde',
        cycleTime: 30,
        type: 'vehicular'
    },
    {
        id: 'tf_ruu_09',
        name: 'Semáforo Calle 32 Sur con Carrera 18',
        intersection: 'Calle 32 Sur con Cra 18',
        coordinates: [4.583, -74.118],
        localidad: 'ruu',
        state: 'rojo',
        cycleTime: 28,
        type: 'vehicular_ciclista'
    },

    // ─────────────────────────────────────────────────────────
    // CIUDAD BOLÍVAR (Localidad 19)
    // ─────────────────────────────────────────────────────────
    {
        id: 'tf_cb_01',
        name: 'Semáforo Av. Boyacá con Calle 68 Sur (Perdomo)',
        intersection: 'Av. Boyacá con Calle 68 Sur',
        coordinates: [4.500, -74.148],
        localidad: 'ciudadbolivar',
        state: 'verde',
        cycleTime: 35,
        type: 'vehicular_ciclista'
    },
    {
        id: 'tf_cb_02',
        name: 'Semáforo Autopista Sur con Calle 57 Sur',
        intersection: 'Autopista Sur con Calle 57 Sur',
        coordinates: [4.548, -74.142],
        localidad: 'ciudadbolivar',
        state: 'rojo',
        cycleTime: 40,
        type: 'vehicular'
    },
    {
        id: 'tf_cb_03',
        name: 'Semáforo Av. Ciudad de Villavicencio con Av. Boyacá',
        intersection: 'Av. Ciudad de Villavicencio con Av. Boyacá',
        coordinates: [4.530, -74.152],
        localidad: 'ciudadbolivar',
        state: 'amarillo',
        cycleTime: 30,
        type: 'vehicular_ciclista'
    },
    {
        id: 'tf_cb_04',
        name: 'Semáforo Av. Boyacá con Autopista Bosa (Lucero)',
        intersection: 'Av. Boyacá con Autopista Bosa',
        coordinates: [4.561, -74.150],
        localidad: 'ciudadbolivar',
        state: 'verde',
        cycleTime: 45,
        type: 'vehicular'
    },

    // ─────────────────────────────────────────────────────────
    // TUNJUELITO (Localidad 06)
    // ─────────────────────────────────────────────────────────
    {
        id: 'tf_tun_01',
        name: 'Semáforo Autopista Sur con Calle 52 Sur (Abraham Lincoln)',
        intersection: 'Autopista Sur con Calle 52 Sur',
        coordinates: [4.570, -74.142],
        localidad: 'tunjuelito',
        state: 'verde',
        cycleTime: 38,
        type: 'vehicular_ciclista'
    },
    {
        id: 'tf_tun_02',
        name: 'Semáforo Av. Boyacá con Av. Bosa - Tunjuelito',
        intersection: 'Av. Boyacá con Av. Bosa',
        coordinates: [4.583, -74.143],
        localidad: 'tunjuelito',
        state: 'rojo',
        cycleTime: 32,
        type: 'vehicular'
    },
    {
        id: 'tf_tun_03',
        name: 'Semáforo Carrera 16 con Calle 52 Sur',
        intersection: 'Cra 16 con Calle 52 Sur',
        coordinates: [4.572, -74.135],
        localidad: 'tunjuelito',
        state: 'amarillo',
        cycleTime: 26,
        type: 'vehicular_ciclista'
    },

    // ─────────────────────────────────────────────────────────
    // SAN CRISTÓBAL (Localidad 04)
    // ─────────────────────────────────────────────────────────
    {
        id: 'tf_sc_01',
        name: 'Semáforo Av. Los Cerros con Calle 22 Sur (La Victoria)',
        intersection: 'Av. Los Cerros con Calle 22 Sur',
        coordinates: [4.557, -74.093],
        localidad: 'sancristobal',
        state: 'verde',
        cycleTime: 30,
        type: 'vehicular_ciclista'
    },
    {
        id: 'tf_sc_02',
        name: 'Semáforo Av. Primero de Mayo con Carrera 3 Este',
        intersection: 'Av. Primero de Mayo con Cra 3 Este',
        coordinates: [4.580, -74.090],
        localidad: 'sancristobal',
        state: 'rojo',
        cycleTime: 35,
        type: 'vehicular'
    },
    {
        id: 'tf_sc_03',
        name: 'Semáforo Calle 11 Sur con Carrera 5 Este (20 de Julio)',
        intersection: 'Calle 11 Sur con Cra 5 Este',
        coordinates: [4.565, -74.087],
        localidad: 'sancristobal',
        state: 'verde',
        cycleTime: 28,
        type: 'vehicular_ciclista'
    },

    // ─────────────────────────────────────────────────────────
    // SANTA FE (Localidad 03)
    // ─────────────────────────────────────────────────────────
    {
        id: 'tf_sf_01',
        name: 'Semáforo Av. Circunvalar con Calle 1 (La Concordia)',
        intersection: 'Av. Circunvalar con Calle 1',
        coordinates: [4.598, -74.063],
        localidad: 'santafe',
        state: 'rojo',
        cycleTime: 25,
        type: 'vehicular'
    },
    {
        id: 'tf_sf_02',
        name: 'Semáforo Av. Comuneros con Carrera 10',
        intersection: 'Av. Comuneros con Cra 10',
        coordinates: [4.591, -74.073],
        localidad: 'santafe',
        state: 'verde',
        cycleTime: 35,
        type: 'vehicular_ciclista'
    },

    // ─────────────────────────────────────────────────────────
    // LA CANDELARIA (Localidad 17)
    // ─────────────────────────────────────────────────────────
    {
        id: 'tf_can_01',
        name: 'Semáforo Av. Jiménez con Carrera 7 (Centro Histórico)',
        intersection: 'Av. Jiménez con Cra 7',
        coordinates: [4.597, -74.073],
        localidad: 'lacandelaria',
        state: 'verde',
        cycleTime: 30,
        type: 'vehicular_ciclista'
    },
    {
        id: 'tf_can_02',
        name: 'Semáforo Calle 11 con Carrera 5 (La Candelaria)',
        intersection: 'Calle 11 con Cra 5',
        coordinates: [4.594, -74.068],
        localidad: 'lacandelaria',
        state: 'amarillo',
        cycleTime: 20,
        type: 'vehicular'
    },

    // ─────────────────────────────────────────────────────────
    // LOS MÁRTIRES (Localidad 14)
    // ─────────────────────────────────────────────────────────
    {
        id: 'tf_mar_01',
        name: 'Semáforo Av. Caracas con Calle 6 (La Favorita)',
        intersection: 'Av. Caracas con Calle 6',
        coordinates: [4.605, -74.086],
        localidad: 'losmartires',
        state: 'rojo',
        cycleTime: 38,
        type: 'vehicular_ciclista'
    },
    {
        id: 'tf_mar_02',
        name: 'Semáforo Av. Caracas con Calle 13 (Ricaurte)',
        intersection: 'Av. Caracas con Calle 13',
        coordinates: [4.608, -74.083],
        localidad: 'losmartires',
        state: 'verde',
        cycleTime: 42,
        type: 'vehicular_ciclista'
    },

    // ─────────────────────────────────────────────────────────
    // ANTONIO NARIÑO (Localidad 15)
    // ─────────────────────────────────────────────────────────
    {
        id: 'tf_an_01',
        name: 'Semáforo Av. Primero de Mayo con Carrera 10 Sur',
        intersection: 'Av. Primero de Mayo con Cra 10',
        coordinates: [4.592, -74.103],
        localidad: 'antonionarino',
        state: 'verde',
        cycleTime: 32,
        type: 'vehicular_ciclista'
    },
    {
        id: 'tf_an_02',
        name: 'Semáforo Av. Caracas con Calle 24 Sur (Ciudad Jardín)',
        intersection: 'Av. Caracas con Calle 24 Sur',
        coordinates: [4.587, -74.110],
        localidad: 'antonionarino',
        state: 'rojo',
        cycleTime: 28,
        type: 'vehicular'
    },

    // ─────────────────────────────────────────────────────────
    // PUENTE ARANDA (Localidad 16)
    // ─────────────────────────────────────────────────────────
    {
        id: 'tf_pa_01',
        name: 'Semáforo Av. Américas con Carrera 50 (Puente Aranda)',
        intersection: 'Av. Américas con Cra 50',
        coordinates: [4.625, -74.115],
        localidad: 'puentearanda',
        state: 'verde',
        cycleTime: 40,
        type: 'vehicular_ciclista'
    },
    {
        id: 'tf_pa_02',
        name: 'Semáforo Av. NQS con Av. Américas',
        intersection: 'Av. NQS con Av. Américas',
        coordinates: [4.628, -74.106],
        localidad: 'puentearanda',
        state: 'rojo',
        cycleTime: 45,
        type: 'vehicular_ciclista'
    },
    {
        id: 'tf_pa_03',
        name: 'Semáforo Calle 13 con Carrera 68 (Zona Industrial)',
        intersection: 'Calle 13 con Cra 68',
        coordinates: [4.614, -74.118],
        localidad: 'puentearanda',
        state: 'amarillo',
        cycleTime: 30,
        type: 'vehicular'
    },

    // ─────────────────────────────────────────────────────────
    // KENNEDY (Localidad 08)
    // ─────────────────────────────────────────────────────────
    {
        id: 'tf_ken_01',
        name: 'Semáforo Av. Américas con Av. Ciudad de Cali',
        intersection: 'Av. Américas con Av. Ciudad de Cali',
        coordinates: [4.638, -74.157],
        localidad: 'kennedy',
        state: 'verde',
        cycleTime: 45,
        type: 'vehicular_ciclista'
    },
    {
        id: 'tf_ken_02',
        name: 'Semáforo Portal Américas (Transmilenio)',
        intersection: 'Portal Américas - Av. Américas con Cra 86',
        coordinates: [4.628, -74.172],
        localidad: 'kennedy',
        state: 'rojo',
        cycleTime: 38,
        type: 'vehicular_ciclista'
    },
    {
        id: 'tf_ken_03',
        name: 'Semáforo Av. Boyacá con Autopista Sur (Kennedy)',
        intersection: 'Av. Boyacá con Autopista Sur',
        coordinates: [4.620, -74.151],
        localidad: 'kennedy',
        state: 'verde',
        cycleTime: 42,
        type: 'vehicular_ciclista'
    },
    {
        id: 'tf_ken_04',
        name: 'Semáforo Av. NQS con Av. Primero de Mayo',
        intersection: 'Av. NQS con Av. Primero de Mayo',
        coordinates: [4.617, -74.107],
        localidad: 'kennedy',
        state: 'amarillo',
        cycleTime: 35,
        type: 'vehicular'
    },

    // ─────────────────────────────────────────────────────────
    // BOSA (Localidad 07)
    // ─────────────────────────────────────────────────────────
    {
        id: 'tf_bos_01',
        name: 'Semáforo Autopista Sur con Calle 59 Sur (Bosa Centro)',
        intersection: 'Autopista Sur con Calle 59 Sur',
        coordinates: [4.620, -74.190],
        localidad: 'bosa',
        state: 'verde',
        cycleTime: 35,
        type: 'vehicular_ciclista'
    },
    {
        id: 'tf_bos_02',
        name: 'Semáforo Av. Ciudad de Cali con Autopista Sur (Bosa)',
        intersection: 'Av. Ciudad de Cali con Autopista Sur',
        coordinates: [4.610, -74.180],
        localidad: 'bosa',
        state: 'rojo',
        cycleTime: 40,
        type: 'vehicular_ciclista'
    },
    {
        id: 'tf_bos_03',
        name: 'Semáforo Portal Bosa (Transmilenio Sur)',
        intersection: 'Portal Bosa - Autopista Sur con Cra 98',
        coordinates: [4.615, -74.200],
        localidad: 'bosa',
        state: 'amarillo',
        cycleTime: 30,
        type: 'vehicular'
    },

    // ─────────────────────────────────────────────────────────
    // FONTIBÓN (Localidad 09)
    // ─────────────────────────────────────────────────────────
    {
        id: 'tf_fon_01',
        name: 'Semáforo Av. El Dorado con Av. Ciudad de Cali (El Dorado)',
        intersection: 'Av. El Dorado con Av. Ciudad de Cali',
        coordinates: [4.682, -74.150],
        localidad: 'fontibon',
        state: 'verde',
        cycleTime: 50,
        type: 'vehicular_ciclista'
    },
    {
        id: 'tf_fon_02',
        name: 'Semáforo Av. Centenario con Carrera 86 (Fontibón)',
        intersection: 'Av. Centenario con Cra 86',
        coordinates: [4.670, -74.155],
        localidad: 'fontibon',
        state: 'rojo',
        cycleTime: 42,
        type: 'vehicular'
    },
    {
        id: 'tf_fon_03',
        name: 'Semáforo Av. El Dorado con Carrera 100 (Aeropuerto)',
        intersection: 'Av. El Dorado con Cra 100',
        coordinates: [4.700, -74.148],
        localidad: 'fontibon',
        state: 'verde',
        cycleTime: 55,
        type: 'vehicular_ciclista'
    },

    // ─────────────────────────────────────────────────────────
    // ENGATIVÁ (Localidad 10)
    // ─────────────────────────────────────────────────────────
    {
        id: 'tf_eng_01',
        name: 'Semáforo Av. Rojas con Av. El Dorado (Normandía)',
        intersection: 'Av. Rojas con Av. El Dorado',
        coordinates: [4.695, -74.115],
        localidad: 'engativa',
        state: 'rojo',
        cycleTime: 48,
        type: 'vehicular_ciclista'
    },
    {
        id: 'tf_eng_02',
        name: 'Semáforo Av. Boyacá con Calle 68 (Engativá)',
        intersection: 'Av. Boyacá con Calle 68',
        coordinates: [4.700, -74.106],
        localidad: 'engativa',
        state: 'verde',
        cycleTime: 40,
        type: 'vehicular_ciclista'
    },
    {
        id: 'tf_eng_03',
        name: 'Semáforo Av. Rojas con Calle 72 (Minuto de Dios)',
        intersection: 'Av. Rojas con Calle 72',
        coordinates: [4.704, -74.109],
        localidad: 'engativa',
        state: 'amarillo',
        cycleTime: 33,
        type: 'vehicular'
    },

    // ─────────────────────────────────────────────────────────
    // SUBA (Localidad 11)
    // ─────────────────────────────────────────────────────────
    {
        id: 'tf_sub_01',
        name: 'Semáforo Av. Suba con Av. Boyacá (Portal Suba)',
        intersection: 'Av. Suba con Av. Boyacá',
        coordinates: [4.745, -74.087],
        localidad: 'suba',
        state: 'verde',
        cycleTime: 45,
        type: 'vehicular_ciclista'
    },
    {
        id: 'tf_sub_02',
        name: 'Semáforo Av. Suba con Calle 100',
        intersection: 'Av. Suba con Calle 100',
        coordinates: [4.690, -74.074],
        localidad: 'suba',
        state: 'rojo',
        cycleTime: 40,
        type: 'vehicular_ciclista'
    },
    {
        id: 'tf_sub_03',
        name: 'Semáforo Av. Ciudad de Cali con Calle 138 (Niza)',
        intersection: 'Av. Ciudad de Cali con Calle 138',
        coordinates: [4.730, -74.073],
        localidad: 'suba',
        state: 'verde',
        cycleTime: 38,
        type: 'vehicular'
    },
    {
        id: 'tf_sub_04',
        name: 'Semáforo Portal Suba (Transmilenio Suba)',
        intersection: 'Portal Suba - Av. Suba con Cra 91',
        coordinates: [4.750, -74.092],
        localidad: 'suba',
        state: 'amarillo',
        cycleTime: 50,
        type: 'vehicular_ciclista'
    },

    // ─────────────────────────────────────────────────────────
    // BARRIOS UNIDOS (Localidad 12)
    // ─────────────────────────────────────────────────────────
    {
        id: 'tf_bu_01',
        name: 'Semáforo Av. NQS con Calle 68 (Barrios Unidos)',
        intersection: 'Av. NQS con Calle 68',
        coordinates: [4.665, -74.083],
        localidad: 'barriosunidos',
        state: 'verde',
        cycleTime: 38,
        type: 'vehicular_ciclista'
    },
    {
        id: 'tf_bu_02',
        name: 'Semáforo Av. Caracas con Calle 72',
        intersection: 'Av. Caracas con Calle 72',
        coordinates: [4.672, -74.068],
        localidad: 'barriosunidos',
        state: 'rojo',
        cycleTime: 35,
        type: 'vehicular'
    },

    // ─────────────────────────────────────────────────────────
    // TEUSAQUILLO (Localidad 13)
    // ─────────────────────────────────────────────────────────
    {
        id: 'tf_teu_01',
        name: 'Semáforo Av. El Dorado (Calle 26) con Av. NQS',
        intersection: 'Av. El Dorado con Av. NQS',
        coordinates: [4.636, -74.092],
        localidad: 'teusaquillo',
        state: 'verde',
        cycleTime: 55,
        type: 'vehicular_ciclista'
    },
    {
        id: 'tf_teu_02',
        name: 'Semáforo Av. El Dorado con Carrera 50 (CAN)',
        intersection: 'Av. El Dorado con Cra 50',
        coordinates: [4.643, -74.098],
        localidad: 'teusaquillo',
        state: 'rojo',
        cycleTime: 60,
        type: 'vehicular_ciclista'
    },
    {
        id: 'tf_teu_03',
        name: 'Semáforo Av. Caracas con Calle 45 (Marly)',
        intersection: 'Av. Caracas con Calle 45',
        coordinates: [4.649, -74.068],
        localidad: 'teusaquillo',
        state: 'verde',
        cycleTime: 40,
        type: 'vehicular'
    },

    // ─────────────────────────────────────────────────────────
    // CHAPINERO (Localidad 02)
    // ─────────────────────────────────────────────────────────
    {
        id: 'tf_cha_01',
        name: 'Semáforo Av. Caracas con Calle 57 (Chapinero Central)',
        intersection: 'Av. Caracas con Calle 57',
        coordinates: [4.656, -74.066],
        localidad: 'chapinero',
        state: 'rojo',
        cycleTime: 38,
        type: 'vehicular_ciclista'
    },
    {
        id: 'tf_cha_02',
        name: 'Semáforo Av. Chile (Calle 72) con Carrera 7 (El Lago)',
        intersection: 'Av. Chile con Cra 7',
        coordinates: [4.674, -74.053],
        localidad: 'chapinero',
        state: 'verde',
        cycleTime: 45,
        type: 'vehicular_ciclista'
    },
    {
        id: 'tf_cha_03',
        name: 'Semáforo Av. Caracas con Calle 63 (Palermo)',
        intersection: 'Av. Caracas con Calle 63',
        coordinates: [4.661, -74.064],
        localidad: 'chapinero',
        state: 'amarillo',
        cycleTime: 33,
        type: 'vehicular'
    },

    // ─────────────────────────────────────────────────────────
    // USAQUÉN (Localidad 01)
    // ─────────────────────────────────────────────────────────
    {
        id: 'tf_usa_01',
        name: 'Semáforo Av. 19 con Calle 127 (Usaquén)',
        intersection: 'Av. 19 con Calle 127',
        coordinates: [4.706, -74.047],
        localidad: 'usaquen',
        state: 'verde',
        cycleTime: 42,
        type: 'vehicular_ciclista'
    },
    {
        id: 'tf_usa_02',
        name: 'Semáforo Autopista Norte con Calle 100',
        intersection: 'Autopista Norte con Calle 100',
        coordinates: [4.688, -74.040],
        localidad: 'usaquen',
        state: 'rojo',
        cycleTime: 50,
        type: 'vehicular_ciclista'
    },
    {
        id: 'tf_usa_03',
        name: 'Semáforo Av. 19 con Calle 147 (Santa Bárbara)',
        intersection: 'Av. 19 con Calle 147',
        coordinates: [4.720, -74.043],
        localidad: 'usaquen',
        state: 'verde',
        cycleTime: 38,
        type: 'vehicular'
    },
    {
        id: 'tf_usa_04',
        name: 'Semáforo Autopista Norte con Calle 127 (Puente Largo)',
        intersection: 'Autopista Norte con Calle 127',
        coordinates: [4.707, -74.040],
        localidad: 'usaquen',
        state: 'amarillo',
        cycleTime: 45,
        type: 'vehicular_ciclista'
    },

    // ─────────────────────────────────────────────────────────
    // CENTRO - Eje de Av. Jiménez / Carrera 7 / Carrera 10
    // ─────────────────────────────────────────────────────────
    {
        id: 'tf_cen_01',
        name: 'Semáforo Av. Jiménez con Carrera 10 (Paloquemao)',
        intersection: 'Av. Jiménez con Cra 10',
        coordinates: [4.600, -74.082],
        localidad: 'lacandelaria',
        state: 'verde',
        cycleTime: 45,
        type: 'vehicular_ciclista'
    },
    {
        id: 'tf_cen_02',
        name: 'Semáforo Calle 19 con Carrera 7 (Centro)',
        intersection: 'Calle 19 con Cra 7',
        coordinates: [4.607, -74.071],
        localidad: 'santafe',
        state: 'rojo',
        cycleTime: 38,
        type: 'vehicular_ciclista'
    },
    {
        id: 'tf_cen_03',
        name: 'Semáforo Av. 26 con Carrera 7 (Torre Colpatria)',
        intersection: 'Av. 26 con Cra 7',
        coordinates: [4.612, -74.073],
        localidad: 'santafe',
        state: 'verde',
        cycleTime: 50,
        type: 'vehicular'
    },

    // ─────────────────────────────────────────────────────────
    // EJE PRINCIPAL AV. CARACAS (Norte-Sur)
    // ─────────────────────────────────────────────────────────
    {
        id: 'tf_cax_01',
        name: 'Semáforo Av. Caracas con Calle 100',
        intersection: 'Av. Caracas con Calle 100',
        coordinates: [4.691, -74.060],
        localidad: 'usaquen',
        state: 'amarillo',
        cycleTime: 50,
        type: 'vehicular_ciclista'
    },
    {
        id: 'tf_cax_02',
        name: 'Semáforo Av. Caracas con Calle 80',
        intersection: 'Av. Caracas con Calle 80',
        coordinates: [4.678, -74.063],
        localidad: 'barriosunidos',
        state: 'verde',
        cycleTime: 45,
        type: 'vehicular_ciclista'
    },
    {
        id: 'tf_cax_03',
        name: 'Semáforo Av. Caracas con Calle 53 (Marly Norte)',
        intersection: 'Av. Caracas con Calle 53',
        coordinates: [4.653, -74.066],
        localidad: 'chapinero',
        state: 'rojo',
        cycleTime: 40,
        type: 'vehicular_ciclista'
    },
    {
        id: 'tf_cax_04',
        name: 'Semáforo Av. Caracas con Av. El Dorado (Calle 26)',
        intersection: 'Av. Caracas con Av. El Dorado',
        coordinates: [4.624, -74.072],
        localidad: 'losmartires',
        state: 'verde',
        cycleTime: 60,
        type: 'vehicular_ciclista'
    },

    // ─────────────────────────────────────────────────────────
    // CORREDORES CICLISTAS - Ciclorrutas estratégicas
    // ─────────────────────────────────────────────────────────
    {
        id: 'tf_cic_01',
        name: 'Semáforo Ciclorruta Av. 9 con Calle 116',
        intersection: 'Ciclorruta Av. 9 con Calle 116',
        coordinates: [4.700, -74.043],
        localidad: 'usaquen',
        state: 'verde',
        cycleTime: 30,
        type: 'ciclista'
    },
    {
        id: 'tf_cic_02',
        name: 'Semáforo Ciclorruta Av. Suba con Calle 80',
        intersection: 'Ciclorruta Av. Suba con Calle 80',
        coordinates: [4.715, -74.070],
        localidad: 'suba',
        state: 'rojo',
        cycleTime: 28,
        type: 'ciclista'
    },
    {
        id: 'tf_cic_03',
        name: 'Semáforo Ciclorruta Transversal 93 con Calle 147',
        intersection: 'Ciclorruta TV 93 con Calle 147',
        coordinates: [4.722, -74.057],
        localidad: 'suba',
        state: 'amarillo',
        cycleTime: 25,
        type: 'ciclista'
    },
    {
        id: 'tf_cic_04',
        name: 'Semáforo Ciclorruta Av. NQS con Calle 26',
        intersection: 'Ciclorruta Av. NQS con Calle 26',
        coordinates: [4.637, -74.098],
        localidad: 'teusaquillo',
        state: 'verde',
        cycleTime: 35,
        type: 'ciclista'
    },
    {
        id: 'tf_cic_05',
        name: 'Semáforo Ciclorruta Av. Boyacá con Calle 26',
        intersection: 'Ciclorruta Av. Boyacá con Calle 26',
        coordinates: [4.645, -74.103],
        localidad: 'engativa',
        state: 'rojo',
        cycleTime: 30,
        type: 'ciclista'
    },
    {
        id: 'tf_cic_06',
        name: 'Semáforo Ciclorruta Río Fucha con Av. Boyacá',
        intersection: 'Ciclorruta Río Fucha con Av. Boyacá',
        coordinates: [4.618, -74.110],
        localidad: 'kennedy',
        state: 'verde',
        cycleTime: 28,
        type: 'ciclista'
    },
    {
        id: 'tf_cic_07',
        name: 'Semáforo Ciclorruta Av. Américas con Av. Boyacá',
        intersection: 'Ciclorruta Av. Américas con Av. Boyacá',
        coordinates: [4.633, -74.148],
        localidad: 'kennedy',
        state: 'amarillo',
        cycleTime: 32,
        type: 'ciclista'
    },
    {
        id: 'tf_cic_08',
        name: 'Semáforo Ciclorruta Av. El Dorado con Carrera 68',
        intersection: 'Ciclorruta Av. El Dorado con Cra 68',
        coordinates: [4.660, -74.118],
        localidad: 'fontibon',
        state: 'verde',
        cycleTime: 35,
        type: 'ciclista'
    },
    {
        id: 'tf_cic_09',
        name: 'Semáforo Ciclorruta Humedal Córdoba (Suba)',
        intersection: 'Ciclorruta Humedal Córdoba - Av. Suba',
        coordinates: [4.742, -74.064],
        localidad: 'suba',
        state: 'verde',
        cycleTime: 22,
        type: 'ciclista'
    },
    {
        id: 'tf_cic_10',
        name: 'Semáforo Ciclorruta Calle 26 con Carrera 36',
        intersection: 'Ciclorruta Calle 26 con Cra 36',
        coordinates: [4.635, -74.077],
        localidad: 'teusaquillo',
        state: 'rojo',
        cycleTime: 28,
        type: 'ciclista'
    },
    {
        id: 'tf_cic_11',
        name: 'Semáforo Ciclorruta Av. Caracas con Calle 32 Sur',
        intersection: 'Ciclorruta Av. Caracas con Calle 32 Sur',
        coordinates: [4.582, -74.115],
        localidad: 'ruu',
        state: 'verde',
        cycleTime: 30,
        type: 'ciclista'
    },
    {
        id: 'tf_cic_12',
        name: 'Semáforo Ciclorruta Calle 39 Sur con Carrera 6',
        intersection: 'Ciclorruta Calle 39 Sur con Cra 6',
        coordinates: [4.573, -74.108],
        localidad: 'ruu',
        state: 'amarillo',
        cycleTime: 25,
        type: 'ciclista'
    },
];
