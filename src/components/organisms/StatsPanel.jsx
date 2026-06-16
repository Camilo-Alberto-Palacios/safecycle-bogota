import React, { useEffect, useRef } from 'react';
import MetricCard from '../molecules/MetricCard';
import Chart from 'chart.js/auto';

export default function StatsPanel({ shaps }) {
    const canvasRef = useRef(null);
    const chartInstanceRef = useRef(null);

    useEffect(() => {
        // Initialize Chart.js
        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            
            // Set custom font families
            Chart.defaults.font.family = "'Inter', sans-serif";
            Chart.defaults.color = '#94a3b8';

            chartInstanceRef.current = new Chart(ctx, {
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
                            display: false
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
                                autoSkip: false,
                                font: {
                                    size: 10,
                                    weight: '600'
                                },
                                color: '#f8fafc'
                            }
                        }
                    }
                }
            });
        }

        return () => {
            // Destroy chart instance on unmount
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
                chartInstanceRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        // Update Chart data when shaps prop changes
        if (chartInstanceRef.current && shaps) {
            const labels = Object.keys(shaps);
            const values = Object.values(shaps);
            const backgroundColors = values.map(val => val >= 0 ? '#ef4444' : '#10b981'); // Red for positive, Green for negative

            chartInstanceRef.current.data.labels = labels;
            chartInstanceRef.current.data.datasets[0].data = values;
            chartInstanceRef.current.data.datasets[0].backgroundColor = backgroundColors;
            chartInstanceRef.current.update();
        }
    }, [shaps]);

    return (
        <div className="panel panel-right-inner">
            <div className="panel-header">
                <i className="fa-solid fa-chart-simple text-accent"></i>
                <h2>Explicabilidad y Métricas</h2>
            </div>

            {/* SHAP Chart Section */}
            <div className="stats-section">
                <h3>Valores SHAP (Impacto de Variables)</h3>
                <p className="section-desc">
                    Muestra el aporte marginal de cada factor al incremento o reducción del riesgo de atraco en este tramo.
                </p>
                <div className="shap-chart-container">
                    <canvas ref={canvasRef} id="shapChart"></canvas>
                </div>
                <div className="shap-legend">
                    <span className="shap-leg-item leg-red">
                        <i className="fa-solid fa-square-plus"></i> Incrementa Riesgo
                    </span>
                    <span className="shap-leg-item leg-green">
                        <i className="fa-solid fa-square-minus"></i> Reduce Riesgo
                    </span>
                </div>
            </div>

            {/* Validation Metrics Section */}
            <div className="stats-section">
                <h3>Métricas de Validación (NIJ)</h3>
                <p className="section-desc">
                    Validado contra sobreajuste mediante <strong>Spatial Block K-Fold</strong> para garantizar la equidad ética del modelo.
                </p>
                
                <div className="metrics-grid">
                    <MetricCard
                        value="86.4%"
                        label="Recall (Sensibilidad)"
                        target="Cumple Meta (>85%)"
                        title="Proporción de tramos de alto riesgo capturados exitosamente. Meta: >85%"
                        isGreen={true}
                    />
                    <MetricCard
                        value="2.45"
                        label="PAI (Focalización)"
                        target="Eficiencia Espacial"
                        title="Índice de Precisión Predictiva. Mide la concentración de delitos en las zonas marcadas como de alto riesgo."
                    />
                    <MetricCard
                        value="0.78"
                        label="PEI* (Eficiencia)"
                        target="Meta de Captura"
                        title="Índice de Eficiencia Predictiva Modificado. Compara el modelo con el límite máximo teórico."
                    />
                </div>

                <div className="block-kfold-card">
                    <div className="kfold-header">
                        <i className="fa-solid fa-cubes text-purple"></i>
                        <span>Validación Espacial</span>
                    </div>
                    <p>
                        El modelo utiliza divisiones territoriales por <strong>UPZ y hexágonos</strong> independientes. Esto evita que la cercanía geográfica contamine la validación, garantizando que el software aprenda variables físicas generalizables y no memorice zonas de bajos recursos.
                    </p>
                </div>
            </div>
        </div>
    );
}
