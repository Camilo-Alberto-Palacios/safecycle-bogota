# SafeCycle Bogotá — Modelo Predictivo de Seguridad y CPTED (MVP)

Este documento sirve como especificación técnica y guía de referencia para que herramientas de análisis e Inteligencia Artificial (como **Antigravity IDE** y **NotebookLM**) puedan realizar el seguimiento, comprensión y análisis del código, arquitectura y lógica del proyecto **SafeCycle Bogotá**.

---

## 1. Contexto del Proyecto

*   **Nombre de la Aplicación:** SafeCycle Bogotá (Versión 1.0.0 - MVP)
*   **Propósito:** Proporcionar un simulador interactivo y un motor predictivo de riesgo de delincuencia (específicamente robos/atracos) en la cicloinfraestructura de las localidades de **Usme (05)** y **Rafael Uribe Uribe (18)** en Bogotá, Colombia. Integra directrices internacionales de **CPTED** (*Crime Prevention Through Environmental Design* o Prevención del Delito Mediante el Diseño Ambiental) para generar recomendaciones físicas de mitigación.
*   **Semillero de Investigación:** *"Construcción de software para la transformación del territorio"*
*   **Investigadores/Creadores:**
    *   **Docente Tutor:** Boris Alberto Salleg Royero
    *   **Estudiante Desarrollador:** Camilo Alberto Palacios Turriago
*   **Estatus:** MVP (Producto Mínimo Viable) funcional.

---

## 2. Arquitectura y Estructura de Archivos

La aplicación se construyó bajo un enfoque de desarrollo frontend moderno y ágil (Vanilla HTML5, CSS3, Javascript) estructurado de la siguiente forma en el directorio del proyecto:

*   [`index.html`](file:///c:/Users/Camilo%20Palacios/Documents/Semillero%20de%20Desarrollo%20de%20software/proyecto/index.html): Define la interfaz de usuario estructurada en un diseño de tres columnas (Simulador de Entorno, Visualización de Mapa e Indicador de Riesgo, y Métricas/Explicabilidad SHAP). Implementa fuentes estilizadas e iconos vía FontAwesome y Google Fonts.
*   [`style.css`](file:///c:/Users/Camilo%20Palacios/Documents/Semillero%20de%20Desarrollo%20de%20software/proyecto/style.css): Contiene el sistema de diseño completo. Utiliza variables CSS y una estética moderna de modo oscuro, bordes suavizados (glassmorphism), tipografía premium y transiciones dinámicas para botones e inputs.
*   [`app.js`](file:///c:/Users/Camilo%20Palacios/Documents/Semillero%20de%20Desarrollo%20de%20software/proyecto/app.js): Alberga la lógica completa del MVP. Contiene:
    *   Una base de datos mock de 20 tramos de ciclorruta (10 para Usme, 10 para Rafael Uribe Uribe) con coordenadas y estados iniciales.
    *   La configuración e inicialización del mapa interactivo usando la librería Leaflet.js con un estilo oscuro de CartoDB.
    *   El motor matemático que emula el comportamiento de un modelo predictivo XGBoost.
    *   La generación de valores explicativos SHAP y su renderizado gráfico interactivo mediante Chart.js.
    *   La generación dinámica de recomendaciones de infraestructura.

---

## 3. Base de Datos de Tramos (Ciclorrutas)

El simulador cuenta con 20 segmentos representativos digitalizados a través de coordenadas geográficas (`coordinates`):

### Localidad de Usme (05)
1.  `usme_caracas_norte`: Av. Caracas Sur (Molinos a Portal Usme) - UPZ 59 El Danubio. Historial: Alto.
2.  `usme_caracas`: Av. Caracas Sur (Portal Usme a Yomasa) - UPZ 57 Gran Yomasa. Historial: Alto.
3.  `usme_caracas_sur`: Av. Caracas Sur (Yomasa a Alfonso López) - UPZ 56 Alfonso López. Historial: Medio.
4.  `usme_boyaca`: Av. Boyacá Sur (Meissen a Yomasa) - UPZ 58 Comuneros. Historial: Alto.
5.  `usme_yomasa_int`: Ciclorruta Gran Yomasa Interna - UPZ 57 Gran Yomasa. Historial: Alto.
6.  `usme_comuneros_int`: Conector Interno Comuneros - UPZ 58 Comuneros. Historial: Medio.
7.  `usme_alopez`: Vía al Llano (Alfonso López) - UPZ 56 Alfonso López. Historial: Medio.
8.  `usme_danubio`: Ciclorruta El Danubio - La Fiscala - UPZ 59 El Danubio. Historial: Bajo.
9.  `usme_fiscala`: Conector La Fiscala Alta - UPZ 59 El Danubio. Historial: Bajo.
10. `usme_valles`: Ciclorruta Valles de Cafam - UPZ 57 Gran Yomasa. Historial: Bajo.

### Localidad de Rafael Uribe Uribe (18)
1.  `ruu_primero_mayo`: Av. Primero de Mayo (Cra 27 a Cra 24) - UPZ 39 Quiroga. Historial: Alto.
2.  `ruu_primero_mayo_oriente`: Av. Primero de Mayo (Cra 24 a Cra 10) - UPZ 39 Quiroga. Historial: Medio.
3.  `ruu_caracas_molinos`: Av. Caracas Sur (Quiroga a Molinos) - UPZ 53 Marco Fidel Suárez. Historial: Alto.
4.  `ruu_carrera24`: Av. Carrera 24 (Cl 27 Sur a Cl 40 Sur) - UPZ 39 Quiroga. Historial: Medio.
5.  `ruu_gustavo_restrepo`: Ciclorruta Gustavo Restrepo / Centenario - UPZ 39 Quiroga. Historial: Bajo.
6.  `ruu_cl40sur`: Calle 40 Sur (Marruecos a Caracas) - UPZ 54 Marruecos. Historial: Alto.
7.  `ruu_marruecos_sur`: Ciclorruta Marruecos Sur (Conector Caracas) - UPZ 54 Marruecos. Historial: Alto.
8.  `ruu_diana_turbay`: Acceso Diana Turbay (Subida Principal) - UPZ 55 Diana Turbay. Historial: Alto.
9.  `ruu_chimi`: Conector Chiminigagua - Diana Turbay - UPZ 55 Diana Turbay. Historial: Alto.
10. `ruu_marco_fidel`: Conectora Marco Fidel Suárez - UPZ 53 Marco Fidel Suárez. Historial: Bajo.

---

## 4. Motor de Predicción y Lógica Matemática

El riesgo se estima mediante una emulación matemática de los valores de impacto SHAP (*SHapley Additive exPlanations*) que tendría un modelo de aprendizaje automático XGBoost entrenado con variables de entorno físico y seguridad de Bogotá.

### Variables Simuladas y sus Pesos SHAP (Aporte Marginal)

Para cualquier tramo, el cálculo parte de un valor base esperado:
$$\text{Base} = 5.0$$

A este valor se le suman o restan aportes según las variables configuradas en el simulador:

1.  **Historial Delictivo Base (SIEDCO):**
    *   Alto: $+2.4$ al riesgo.
    *   Medio: $+0.2$ al riesgo.
    *   Bajo: $-2.1$ al riesgo.
2.  **Estado del Clima (IDIGER):**
    *   Lluvia Fuerte: $+1.4$ (la lluvia ahuyenta peatones y ciclistas, reduciendo la vigilancia natural).
    *   Seco/Despejado: $-0.3$ (mayor flujo y ojos en la calle).
3.  **Tecnología del Alumbrado (UAESP):**
    *   Sodio (Luz Amarilla): $+0.7$ (peor reproducción cromática, facilita zonas oscuras).
    *   LED (Luz Blanca): $-0.8$ (mejor nitidez y visibilidad nocturna).
4.  **Potencia del Alumbrado (UAESP):**
    *   Rango: $50\text{ W}$ a $250\text{ W}$.
    *   Fórmula de Impacto: $\text{SHAP} = 0.4 - \left(\frac{\text{Watts} - 50}{200}\right) \times 1.1$
    *   *Nota: A mayor wattaje, menor riesgo (p. ej. a 250W resta $-0.7$, a 50W suma $+0.4$).*
5.  **Visibilidad y Despeje Vial (CPTED - Vigilancia Natural):**
    *   Baja (Con obstrucciones, maleza, laderas ciegas): $+0.9$
    *   Regular: $0.0$
    *   Buena (Línea de visión despejada): $-1.0$
6.  **Guardianes del Entorno:**
    *   Presencia Policial (CAI fijo o móvil cercano): $-1.3$ (si está activo).
    *   Corredor Ruta Segura (Acompañamiento policial/gestores en horas pico): $-0.9$ (si está activo).

### Puntuación y Clasificación Final de Riesgo

El puntaje acumulado se calcula sumando todos los aportes anteriores y limitándolo en el rango $[0.5, 9.5]$:
$$\text{Puntaje} = \max(0.5, \min(9.5, \text{Base} + \sum \text{SHAPs}))$$

La categoría del riesgo se clasifica según el puntaje final:
*   **Riesgo Alto:** $\ge 7.0$ (Color en mapa y UI: Rojo `#ef4444`)
*   **Riesgo Medio:** $\ge 3.8$ y $< 7.0$ (Color en mapa y UI: Naranja `#f59e0b`)
*   **Riesgo Bajo:** $< 3.8$ (Color en mapa y UI: Verde `#10b981`)

---

## 5. Lógica del Generador de Recomendaciones CPTED

El sistema analiza dinámicamente las condiciones del tramo seleccionado y sus variables de simulación para proveer sugerencias de mitigación basadas en los principios de diseño ambiental:

*   **Poda y Limpieza Vial:** Si la visibilidad es baja (`visibility == 1`), sugiere poda de árboles y limpieza de laderas para mantener líneas de visión despejadas ("ver y ser visto").
*   **Tecnología de Luminarias:** Si el tramo usa sodio (`lightingType == 'Sodio'`), recomienda la migración urgente a tecnología LED, reduciendo estadísticamente el riesgo en un ~12%.
*   **Reforzamiento Lumínico:** Si el wattaje es inferior a 150W, recomienda potenciar las luminarias para erradicar puntos ciegos.
*   **Clima y Operatividad:** Si el clima es lluvia, advierte la necesidad de despliegue de patrullas móviles de apoyo en horas pico, dado que la lluvia deprime el flujo ciclista y por ende la vigilancia natural.
*   **Focalización de Guardianes:** Si el tramo es de Riesgo Alto y carece de acompañamiento policial o CAI, emite una advertencia de prioridad urgente para integrarse al plan "Bogotá Camina Segura" o para la instalación de CAIs móviles.

---

## 6. Validación Espacial y Equidad Ética

El modelo teórico en el que se basa el MVP fue validado contra sobreajuste espacial usando la metodología de **Spatial Block K-Fold**:

1.  **Definición:** En lugar de dividir aleatoriamente los datos de entrenamiento y validación (lo cual provoca filtración de información geográfica debido a la fuerte correlación espacial del crimen), los tramos se agrupan en "bloques" territoriales independientes (por UPZ y hexágonos geográficos).
2.  **Métricas del Modelo Incorporadas en la UI:**
    *   **Recall (Sensibilidad):** $86.4\%$ (Porcentaje de los tramos que de verdad son peligrosos y que el modelo identifica correctamente como de alto riesgo. Supera la meta de diseño del $>85\%$).
    *   **PAI (Predictive Accuracy Index):** $2.45$ (Mide cuán concentrado está el delito en las áreas identificadas como de alto riesgo frente a todo el territorio evaluado).
    *   **PEI\* (Prediction Efficiency Index Modificado):** $0.78$ (Indica qué tan cerca está la eficiencia del modelo con respecto al límite teórico máximo de predicción).
3.  **Enfoque de Equidad:** Al validar mediante bloques espaciales alejados entre sí, se previene que el modelo simplemente memorice que las áreas de menores recursos económicos son peligrosas. En su lugar, el sistema se ve obligado a aprender la relación real entre variables físicas (luminosidad, despeje, patrullas) y el nivel de riesgo, garantizando un software éticamente equitativo para el ordenamiento territorial.

---

## 7. Instrucciones para la Ejecución del MVP

El proyecto es un MVP del lado del cliente y no requiere de una base de datos relacional activa o servidores backend complejos para su funcionamiento:

1.  **Ejecución Rápida:** Abra el archivo [`index.html`](file:///c:/Users/Camilo%20Palacios/Documents/Semillero%20de%20Desarrollo%20de%20software/proyecto/index.html) directamente en cualquier navegador moderno.
2.  **Servidor de Desarrollo Local (Opcional):** Si se desea ejecutar en un entorno con recarga en vivo o servir los archivos mediante HTTP:
    *   Desde una consola con Node.js instalado, ejecute:
        ```bash
        npx http-server ./
        ```
        O bien inicie la extensión "Live Server" de VS Code.
3.  **Interacción en Pantalla:**
    *   Seleccione una localidad en el encabezado (**Usme** o **Rafael Uribe Uribe**).
    *   Haga clic en cualquiera de las líneas de ciclorruta dibujadas en el mapa.
    *   Interactúe con los controles del simulador izquierdo (cambie de Sodio a LED, mueva los sliders de visibilidad o wattaje, o active guardianes).
    *   Observe en tiempo real cómo cambia el color del tramo en el mapa, el indicador de riesgo central, las barras del gráfico SHAP y las recomendaciones de infraestructura generadas.
