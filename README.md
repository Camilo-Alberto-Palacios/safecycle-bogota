# SafeCycle Bogotá 🚲

**Simulador Predictivo de Seguridad en Ciclorrutas para Bogotá, Colombia**

SafeCycle Bogotá es una aplicación web interactiva de investigación que modela y predice el riesgo de inseguridad en la infraestructura ciclista de Bogotá (ciclorrutas). Fue desarrollada como MVP (Producto Mínimo Viable) por el Semillero de Desarrollo de Software, enfocándose inicialmente en las localidades de **Usme** y **Rafael Uribe Uribe**, y expandida posteriormente a las **20 localidades oficiales** del Distrito Capital.

---

## Tabla de Contenidos

1. [Propósito e Investigación](#propósito-e-investigación)
2. [Funcionalidades Principales](#funcionalidades-principales)
3. [Arquitectura del Software](#arquitectura-del-software)
4. [Modelo Predictivo de Riesgo](#modelo-predictivo-de-riesgo)
5. [Datos y Localidades](#datos-y-localidades)
6. [Stack Tecnológico](#stack-tecnológico)
7. [Estructura del Proyecto](#estructura-del-proyecto)
8. [Guía de Inicio Rápido](#guía-de-inicio-rápido)
9. [Vistas y Modos de Usuario](#vistas-y-modos-de-usuario)
10. [Capas del Mapa](#capas-del-mapa)

---

## Propósito e Investigación

Este proyecto nace de una investigación formal sobre la **viabilidad de un modelo predictivo de seguridad aplicado a la ciclo-infraestructura de Bogotá**. El objetivo principal es identificar los factores ambientales, sociales e infraestructurales que correlacionan con la inseguridad en las ciclorrutas y proponer intervenciones basadas en datos.

### Contexto

- Bogotá cuenta con más de 550 km de ciclorrutas, siendo una de las redes más extensas de América Latina.
- Las localidades de Usme y Rafael Uribe Uribe presentan indicadores de criminalidad superiores al promedio distrital.
- El proyecto busca responder: ¿Qué variables (iluminación, presencia policial, condiciones climáticas) más influyen en el riesgo percibido y real para ciclistas?

### Documentos de Investigación

Los siguientes documentos de soporte se encuentran en la raíz del repositorio:

- `Informe de Sesión_ Modelo Predictivo de Seguridad en Cicloinfraestructura (Usme y Rafael Uribe Uribe).pdf` — Informe técnico detallado de la primera sesión de modelado.
- `PROPUESTA DE INVESTIGACIÓN FORMAL.pdf` — Propuesta metodológica completa para el semillero.
- `Viabilidad Modelo Predictivo Ciclorrutas Bogotá.pdf` — Análisis de viabilidad del modelo para toda Bogotá.

---

## Funcionalidades Principales

### 1. Mapa Interactivo Full-Screen
- El mapa de Leaflet ocupa toda la pantalla (100vw × 100vh), siendo el centro visual de la aplicación.
- **20 localidades de Bogotá** dibujadas con polígonos GeoJSON oficiales del IDECA/Datos Abiertos Bogotá.
- Cada localidad tiene un color único, etiqueta de nombre y tooltip interactivo al hacer hover.
- Al hacer clic en una localidad, se muestra un popup con su nombre oficial y número.

### 2. Planificador de Rutas (Route Planner)
- Panel flotante de vidrio (glassmorphism) en la esquina superior izquierda.
- Selección de **origen y destino** mediante:
  - Texto libre en campos de input.
  - Clic directo en el mapa con modo "crosshair" (cursor de punto de mira).
- Generación de hasta **3 rutas alternativas** con puntuación de riesgo diferenciada:
  - Ruta Más Segura (menor índice de riesgo).
  - Ruta Más Rápida (menor distancia).
  - Ruta Recomendada (equilibrio seguridad/distancia).
- Visualización de cada ruta con color y grosor diferente en el mapa.
- Panel de resultados con métricas: distancia, tiempo estimado, índice de riesgo y recomendaciones.

### 3. Simulador de Variables de Riesgo
- Panel flotante de vidrio en la esquina inferior izquierda.
- Permite modificar en tiempo real las variables del modelo predictivo:
  - **Tipo de iluminación**: Sodio, LED, Fluorescente, Sin iluminación.
  - **Potencia (Watts)**: Control deslizante 0–400W.
  - **Visibilidad**: Control deslizante 0–5 km.
  - **Condición climática**: Seco, Lluvia leve, Lluvia fuerte.
  - **Presencia de CAI** (Centro de Atención Inmediata de policía): Toggle sí/no.
  - **Guardia de Ruta**: Toggle sí/no.
- El índice de riesgo del tramo seleccionado se recalcula instantáneamente.

### 4. Panel de Estadísticas
- Métricas globales de la red de ciclorrutas modeladas:
  - Total de tramos modelados.
  - Promedio de riesgo de la red.
  - Distribución de riesgo: Alto / Medio / Bajo.
- Visualización tipo Chart.js con gráfico de barras de distribución.

### 5. Modo Ciudadano vs. Modo Investigador
- **Modo Ciudadano**: Vista simplificada para planificar rutas seguras cotidianas.
- **Modo Investigador**: Acceso completo al simulador, estadísticas y herramientas de análisis de tramos individuales.

---

## Arquitectura del Software

El proyecto sigue la metodología de **Diseño Atómico (Atomic Design)** de Brad Frost, organizada en 5 niveles de abstracción:

```
src/
├── components/
│   ├── atoms/          → Componentes primitivos (Button, Input, Slider, Badge, Switch)
│   ├── molecules/      → Grupos de átomos (FormField, RangeControl, ToggleGroup, RouteCard, MetricCard)
│   ├── organisms/      → Secciones complejas (FloatingHeader, RoutePlanner, SimulatorPanel, ResultsPanel, StatsPanel, MapComponent)
│   ├── templates/      → Estructuras de página (DashboardLayout)
│   └── pages/          → Páginas completas (MainDashboard)
├── data/
│   └── bikeSegments.js → Datos de tramos de ciclorrutas y mapa de localidades
├── utils/
│   └── riskCalculator.js → Motor de cálculo del modelo predictivo
└── index.css           → Sistema de diseño global (variables CSS, glassmorphism, animaciones)
```

---

## Modelo Predictivo de Riesgo

El modelo implementado en `src/utils/riskCalculator.js` calcula un **Índice de Riesgo** (0–100) para cada tramo de ciclorruta basado en una ponderación de variables:

### Variables del Modelo

| Variable | Descripción | Peso en el Modelo |
|---|---|---|
| **Tipo de Iluminación** | Sodio, LED, Fluorescente, Ninguna | Alto |
| **Potencia (Watts)** | Intensidad lumínica instalada | Medio |
| **Visibilidad** | Alcance visual en km | Medio |
| **Condición Climática** | Seco / Lluvia leve / Lluvia fuerte | Alto |
| **Presencia de CAI** | Centro de Atención Inmediata próximo | Alto |
| **Guardia de Ruta** | Vigilancia activa en el tramo | Alto |
| **Crimen Base (Baseline)** | Historial delictivo del tramo | Alto |

### Clasificación de Riesgo

- 🔴 **Alto** (≥ 65): Tramo con condiciones de alta peligrosidad. Evitar en horas nocturnas.
- 🟡 **Medio** (35–64): Condiciones moderadas. Precaución recomendada.
- 🟢 **Bajo** (< 35): Tramo relativamente seguro bajo condiciones actuales.

### Recomendaciones Automáticas

El sistema genera hasta 3 recomendaciones específicas por tramo según las variables con mayor contribución al riesgo (ej: "Mejorar iluminación a LED 150W", "Solicitar patrullaje en el tramo").

---

## Datos y Localidades

### 20 Localidades de Bogotá

El archivo `src/data/bikeSegments.js` contiene el mapa completo de las 20 localidades del Distrito Capital con sus datos de referencia:

| Código | Localidad | Color Identificador |
|---|---|---|
| 01 | Usaquén | Azul cielo |
| 02 | Chapinero | Rosa |
| 03 | Santa Fe | Verde esmeralda |
| 04 | San Cristóbal | Amarillo |
| 05 | **Usme** ⭐ | Índigo |
| 06 | Tunjuelito | Verde lima |
| 07 | Bosa | Cian |
| 08 | Kennedy | Rosa brillante |
| 09 | Fontibón | Naranja |
| 10 | Engativá | Azul |
| 11 | Suba | Verde azulado |
| 12 | Barrios Unidos | Púrpura |
| 13 | Teusaquillo | Fucsia |
| 14 | Los Mártires | Gris azulado |
| 15 | Antonio Nariño | Cian oscuro |
| 16 | Puente Aranda | Ámbar |
| 17 | La Candelaria | Rojo |
| 18 | **Rafael Uribe Uribe** ⭐ | Púrpura |
| 19 | Ciudad Bolívar | Rosa oscuro |
| 20 | Sumapaz | Verde |

> ⭐ Localidades prioritarias del estudio inicial.

### Capa GeoJSON de Localidades

El componente `MapComponent.jsx` carga dinámicamente los polígonos oficiales de las 20 localidades desde la API de Datos Abiertos de Bogotá (IDECA). Cada localidad se dibuja con:
- Polígono relleno con color distintivo (opacidad 0.35).
- Borde resaltado (opacidad 0.85, grosor 2px).
- Etiqueta de nombre centrada en el polígono.
- Tooltip con nombre al hacer hover.
- Popup informativo al hacer clic.

### Tramos de Ciclorrutas Modelados

La versión actual modela 20 tramos representativos distribuidos en Usme (10 tramos) y Rafael Uribe Uribe (10 tramos), cada uno con coordenadas GPS reales, tipo de iluminación, condición base de crimen, y parámetros ambientales.

---

## Stack Tecnológico

| Tecnología | Versión | Propósito |
|---|---|---|
| **React** | 19.x | Framework de UI con arquitectura de componentes |
| **Vite** | 8.x | Bundler y servidor de desarrollo (HMR ultra-rápido) |
| **Leaflet** | 1.9.x | Mapas interactivos con capas GeoJSON |
| **Chart.js** | 4.5.x | Gráficos de estadísticas de riesgo |
| **Vanilla CSS** | — | Sistema de diseño con variables custom + glassmorphism |

### Decisiones de Diseño

- **Sin TailwindCSS**: Se usa CSS puro con variables para mantener control total del sistema de diseño.
- **Sin React Router**: Aplicación de una sola vista (SPA single-panel), el estado gestiona todo.
- **Sin Backend**: Toda la lógica es client-side. Los datos de tramos están hardcodeados como MVP.
- **GeoJSON dinámico**: Los polígonos de localidades se cargan desde la API pública de Bogotá en runtime.

---

## Estructura del Proyecto

```
proyecto/
├── public/                          → Assets estáticos
├── src/
│   ├── assets/                      → Imágenes y recursos
│   ├── components/
│   │   ├── atoms/
│   │   │   ├── Button.jsx           → Botón reutilizable con variantes
│   │   │   ├── Input.jsx            → Campo de texto estilizado
│   │   │   ├── Slider.jsx           → Control deslizante
│   │   │   ├── Badge.jsx            → Etiqueta de estado (riesgo Alto/Medio/Bajo)
│   │   │   └── Switch.jsx           → Toggle booleano
│   │   ├── molecules/
│   │   │   ├── FormField.jsx        → Label + Input combinados
│   │   │   ├── RangeControl.jsx     → Label + Slider + valor actual
│   │   │   ├── ToggleGroup.jsx      → Grupo de botones de selección única
│   │   │   ├── RouteCard.jsx        → Tarjeta de ruta con métricas
│   │   │   └── MetricCard.jsx       → Tarjeta de métrica estadística
│   │   ├── organisms/
│   │   │   ├── FloatingHeader.jsx   → Encabezado flotante con logo y selector de localidad
│   │   │   ├── RoutePlanner.jsx     → Panel de planificación de rutas
│   │   │   ├── SimulatorPanel.jsx   → Panel de simulación de variables de riesgo
│   │   │   ├── ResultsPanel.jsx     → Panel de resultados de rutas calculadas
│   │   │   ├── StatsPanel.jsx       → Panel de estadísticas globales de la red
│   │   │   └── MapComponent.jsx     → Mapa Leaflet full-screen con todas las capas
│   │   ├── templates/
│   │   │   └── DashboardLayout.jsx  → Layout: mapa de fondo + paneles flotantes superpuestos
│   │   └── pages/
│   │       └── MainDashboard.jsx    → Página principal: estado central y lógica de negocio
│   ├── data/
│   │   └── bikeSegments.js          → Datos de tramos + mapa de las 20 localidades
│   ├── utils/
│   │   └── riskCalculator.js        → Motor del modelo predictivo de riesgo
│   ├── App.jsx                      → Componente raíz de React
│   ├── main.jsx                     → Punto de entrada de la aplicación
│   └── index.css                    → Estilos globales y sistema de diseño
├── index.html                       → HTML raíz con meta SEO
├── vite.config.js                   → Configuración de Vite
├── package.json                     → Dependencias del proyecto
└── README.md                        → Este documento
```

---

## Guía de Inicio Rápido

### Prerrequisitos

- Node.js 18+ instalado
- npm 9+ instalado

### Instalación y Ejecución

```bash
# Clonar el repositorio
git clone <url-del-repositorio>
cd proyecto

# Instalar dependencias
npm install

# Iniciar el servidor de desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:5173/`

### Build para Producción

```bash
npm run build
npm run preview
```

---

## Vistas y Modos de Usuario

### Modo Ciudadano (Vista por defecto)
Orientado al usuario final que quiere planificar un trayecto seguro:
1. Seleccionar localidad desde el header flotante.
2. Ingresar origen y destino en el planificador de rutas.
3. Hacer clic en "Calcular Rutas".
4. Seleccionar la ruta óptima del panel de resultados.
5. El mapa muestra la ruta con código de colores de riesgo.

### Modo Investigador
Activo desde el switch de modo en el header:
- Acceso al simulador de variables para modificar condiciones ambientales.
- Clic en cualquier tramo del mapa → selección y análisis en tiempo real.
- Panel de estadísticas globales con distribución de riesgo.
- Modo "audit" para pinchar un punto en el mapa y analizar el tramo más cercano.

---

## Capas del Mapa

El `MapComponent.jsx` gestiona las siguientes capas de visualización:

1. **Capa Base**: OpenStreetMap (tiles estándar).
2. **Capa de Localidades**: 20 polígonos GeoJSON con colores únicos y etiquetas.
3. **Capa de Tramos**: Polilíneas de los tramos modelados, coloreadas por nivel de riesgo.
4. **Capa de Rutas**: Rutas calculadas superpuestas con grosor variable.
5. **Marcadores de Origen/Destino**: Pins de inicio y fin de ruta.
6. **Pin de Auditoría**: Marcador especial al analizar un punto arbitrario del mapa.

---

## Estado del Proyecto y Roadmap

### Versión Actual: v1.1.0

- ✅ MVP con 20 tramos de Usme y Rafael Uribe Uribe.
- ✅ Modelo predictivo con 7 variables.
- ✅ Migración a React + Vite con Diseño Atómico.
- ✅ UI premium con glassmorphism y mapa full-screen.
- ✅ Menú minimalista tipo hamburguesa.
- ✅ 20 localidades de Bogotá dibujadas con GeoJSON oficial.
- ✅ Tooltips, popups y colores únicos por localidad.

### Próximos Pasos (Roadmap)

- [ ] Ampliar la base de tramos a todas las localidades.
- [ ] Integrar datos reales de criminalidad (SIEDCO, Policía Bogotá).
- [ ] Conectar con API de iluminación pública del ICANH/UAESP.
- [ ] Añadir datos climáticos en tiempo real (IDEAM API).
- [ ] Implementar autenticación para guardar rutas favoritas.
- [ ] Backend con PostgreSQL + PostGIS para geoespacialidad.
- [ ] Validación del modelo con datos históricos de incidentes.

---

## Semillero de Desarrollo de Software

Este proyecto es desarrollado por el **Semillero de Desarrollo de Software** como parte de una investigación aplicada sobre seguridad urbana y movilidad sostenible en Bogotá.

### Palabras Clave para Indexación

`ciclorrutas bogotá`, `seguridad urbana ciclistas`, `modelo predictivo riesgo`, `React Vite atomic design`, `leaflet mapa bogotá`, `localidades bogotá geojson`, `semillero investigación`, `SafeCycle`, `infraestructura ciclista colombia`, `simulador riesgo`, `usme rafael uribe uribe`

---

*Última actualización: Junio 2026 | Versión 1.1.0*
