import React, { useState, useEffect } from 'react';
import Input from '../atoms/Input';
import Button from '../atoms/Button';

// Ubicaciones comunes predefinidas para fallback y acceso rápido
const PRESETS = [
    { name: 'Portal Usme', lat: 4.5317, lng: -74.1166 },
    { name: 'Estación Molinos', lat: 4.5631, lng: -74.1128 },
    { name: 'Parque Metropolitano El Tunal', lat: 4.5761, lng: -74.1332 },
    { name: 'Centro Comercial Altavista', lat: 4.5292, lng: -74.1132 },
    { name: 'Alcaldía Local de Usme', lat: 4.4719, lng: -74.1205 },
    { name: 'Estación Consuelo', lat: 4.5482, lng: -74.1154 },
    { name: 'Estación Socorro', lat: 4.5552, lng: -74.1141 },
    { name: 'Parque Entre Nubes', lat: 4.5539, lng: -74.0934 },
    { name: 'UPZ Quiroga', lat: 4.5815, lng: -74.1118 }
];

export default function FormField({
    value,
    onChange,
    placeholder,
    iconClass = '',
    onSelectOnMap,
    isSelecting = false,
    title = '',
    onSelectLocation,
    showGpsButton = false
}) {
    const [suggestions, setSuggestions] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [loading, setLoading] = useState(false);
    const [gpsLoading, setGpsLoading] = useState(false);

    useEffect(() => {
        if (!showDropdown) return;

        // Si el valor está vacío, muestra las ubicaciones recomendadas (presets)
        if (!value.trim()) {
            setSuggestions(PRESETS.map(p => ({ ...p, type: 'preset' })));
            setLoading(false);
            return;
        }

        // Si ya contiene un formato de coordenada exacta (del mapa), no busca en la API
        const coordRegex = /^(-?\d+\.\d+),\s*(-?\d+\.\d+)$/;
        if (coordRegex.test(value)) {
            setSuggestions([]);
            return;
        }

        // Si el valor coincide exactamente con un preset o con una ubicación GPS reciente, no busca
        if (PRESETS.some(p => p.name === value) || value.includes('(Mi ubicación)') || value.includes('Ubicación GPS')) {
            return;
        }

        setLoading(true);
        const delayDebounceFn = setTimeout(async () => {
            try {
                const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(value)},+Bogota,+Colombia&format=json&limit=5`;
                const response = await fetch(url, {
                    headers: {
                        'Accept-Language': 'es'
                    }
                });
                const data = await response.json();
                if (data && data.length > 0) {
                    const results = data.map(item => ({
                        name: item.display_name.split(',')[0],
                        fullName: item.display_name,
                        lat: parseFloat(item.lat),
                        lng: parseFloat(item.lon),
                        type: 'nominatim'
                    }));
                    setSuggestions(results);
                } else {
                    setSuggestions([]);
                }
            } catch (error) {
                console.error("Autocomplete fetch failed:", error);
                // Fallback a presets filtrados localmente
                const filteredPresets = PRESETS.filter(p => 
                    p.name.toLowerCase().includes(value.toLowerCase())
                );
                setSuggestions(filteredPresets.map(p => ({ ...p, type: 'preset' })));
            } finally {
                setLoading(false);
            }
        }, 500); // Debounce de 500ms

        return () => clearTimeout(delayDebounceFn);
    }, [value, showDropdown]);

    const handleSelect = (s) => {
        onChange(s.name);
        if (onSelectLocation) {
            onSelectLocation({ lat: s.lat, lng: s.lng }, s.name);
        }
        setShowDropdown(false);
    };

    const handleGeolocate = () => {
        if (!navigator.geolocation) {
            alert("La geolocalización no es soportada por tu navegador.");
            return;
        }

        setGpsLoading(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                let displayName = `Ubicación GPS (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;

                try {
                    const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`;
                    const res = await fetch(url, {
                        headers: {
                            'Accept-Language': 'es'
                        }
                    });
                    const data = await res.json();
                    if (data && data.display_name) {
                        displayName = data.display_name.split(',')[0] + ' (Mi ubicación)';
                    }
                } catch (error) {
                    console.error("Reverse geocoding failed:", error);
                }

                onChange(displayName);
                if (onSelectLocation) {
                    onSelectLocation({ lat: latitude, lng: longitude }, displayName);
                }
                setGpsLoading(false);
            },
            (error) => {
                console.error("GPS Error:", error);
                alert("No se pudo obtener tu ubicación. Por favor verifica los permisos de ubicación de tu navegador.");
                setGpsLoading(false);
            },
            { enableHighAccuracy: true, timeout: 6000, maximumAge: 0 }
        );
    };

    return (
        <div className="route-input-group w-full">
            <div className="input-with-icon w-full relative flex items-center bg-slate-100/80 border border-slate-200/60 rounded-xl px-3 py-2">
                <i className={`${iconClass} flex-shrink-0 mr-2`}></i>
                <Input
                    value={value}
                    onChange={(e) => {
                        onChange(e.target.value);
                        if (onSelectLocation) {
                            // Limpia las coordenadas guardadas ya que el usuario empezó a escribir manualmente
                            onSelectLocation(null, e.target.value);
                        }
                    }}
                    onFocus={() => setShowDropdown(true)}
                    onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                    placeholder={placeholder}
                    className="w-full bg-transparent border-none outline-none text-slate-800 text-xs py-0.5"
                />

                {/* Dropdown de Sugerencias */}
                {showDropdown && (suggestions.length > 0 || loading) && (
                    <ul className="suggestions-dropdown absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto">
                        {loading ? (
                            <li className="suggestion-info p-3 text-xs text-slate-500 flex items-center gap-2">
                                <i className="fa-solid fa-spinner fa-spin"></i> Buscando...
                            </li>
                        ) : (
                            suggestions.map((s, idx) => (
                                <li
                                    key={idx}
                                    className={`suggestion-item ${s.type}-item p-2.5 hover:bg-slate-100 cursor-pointer text-xs text-slate-700 flex items-center gap-2 border-b border-slate-100 last:border-none`}
                                    onMouseDown={() => handleSelect(s)}
                                >
                                    <i className={
                                        s.type === 'preset' 
                                            ? 'fa-solid fa-star text-amber-500' 
                                            : (s.type === 'gps' ? 'fa-solid fa-location-arrow text-emerald-600' : 'fa-solid fa-location-dot text-slate-400')
                                    }></i>
                                    <span>{s.name}</span>
                                </li>
                            ))
                        )}
                        {!loading && suggestions.length === 0 && (
                            <li className="suggestion-info p-3 text-xs text-slate-500">No se encontraron resultados</li>
                        )}
                    </ul>
                )}
            </div>

            {/* Buttons rendered outside the input */}
            {showGpsButton && (
                <Button
                    variant="icon-select"
                    onClick={handleGeolocate}
                    title="Usar mi ubicación GPS"
                    disabled={gpsLoading}
                >
                    <i className={`fa-solid ${gpsLoading ? 'fa-spinner fa-spin' : 'fa-location-arrow'}`}></i>
                </Button>
            )}
            {onSelectOnMap && (
                <Button
                    variant="icon-select"
                    active={isSelecting}
                    onClick={onSelectOnMap}
                    title={title}
                >
                    <i className="fa-solid fa-location-crosshairs"></i>
                </Button>
            )}
        </div>
    );
}
