export const constructionZones = [
    {
        id: 'const_caracas_portal',
        name: 'Ampliación Troncal Caracas - Portal Usme',
        contratista: 'Consorcio Troncal Caracas Sur',
        description: 'Construcción de carriles exclusivos de TransMilenio. Presencia de polisombras altas que limitan la visibilidad de los ciclistas y acumulación de escombros en andenes.',
        lat: 4.5317,
        lng: -74.1080,
        radius: 200, // en metros
        riskWeight: 1.8,
        localidad: 'usme',
        endDate: 'Diciembre 2026'
    },
    {
        id: 'const_boyaca_comuneros',
        name: 'Mantenimiento Vial Av. Boyacá Sur (Comuneros)',
        contratista: 'Pavimentar Bogotá S.A.S.',
        description: 'Rehabilitación de calzada. Excavaciones profundas descubiertas, desvíos provisionales por ciclorrutas alternas sin iluminación adecuada.',
        lat: 4.5050,
        lng: -74.1210,
        radius: 150, // en metros
        riskWeight: 1.5,
        localidad: 'usme',
        endDate: 'Octubre 2026'
    },
    {
        id: 'const_mayo_metro',
        name: 'Obras de Apoyo Metro L1 - Av. Primero de Mayo',
        contratista: 'Metro Línea 1 S.A.S.',
        description: 'Traslado de redes y cimentaciones del viaducto. Pasillos peatonales angostos delimitados por láminas metálicas ciegas (efecto túnel), nula visibilidad hacia los comercios.',
        lat: 4.5820,
        lng: -74.1210,
        radius: 250, // en metros
        riskWeight: 2.2,
        localidad: 'ruu',
        endDate: 'Marzo 2027'
    },
    {
        id: 'const_caracas_quiroga',
        name: 'Renovación de Red de Alcantarillado Quiroga',
        contratista: 'Obras Hidráulicas del Sur',
        description: 'Reemplazo de tubería matriz. Cierre total de andenes, paso obligado de ciclistas por el carril vehicular mixto en zona de penumbra nocturna.',
        lat: 4.5700,
        lng: -74.1140,
        radius: 160, // en metros
        riskWeight: 1.6,
        localidad: 'ruu',
        endDate: 'Noviembre 2026'
    }
];
