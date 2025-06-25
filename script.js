// Variables globales
var numeroLanzamiento = 0;
var contadorEscaleras = 0;
var valoresDados = [1, 1, 1, 1, 1];
var simulacionEnCurso = false;
var probabilidadTeorica = 240/7776 * 100; // (120+120)/7776 * 100 ≈ 3.08%
var puntosDatos = [{x: 0, y: 0}]; // Para el gráfico

// Inicializar gráfico
document.addEventListener('DOMContentLoaded', function() {
    var ctx = document.getElementById('probabilityChart').getContext('2d');
    var grafico = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [{
                label: 'Probabilidad experimental (%)',
                data: puntosDatos,
                borderColor: '#4caf50',
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                tension: 0.1,
                fill: true
            }, {
                label: 'Probabilidad teórica (%)',
                data: [{x: 0, y: probabilidadTeorica}, {x: 1000, y: probabilidadTeorica}],
                borderColor: '#f44336',
                borderDash: [5, 5],
                pointRadius: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: 'linear',
                    title: {
                        display: true,
                        text: 'Número de simulaciones'
                    },
                    min: 0
                },
                y: {
                    title: {
                        display: true,
                        text: 'Probabilidad (%)'
                    },
                    min: 0,
                    max: Math.max(10, probabilidadTeorica * 1.5)
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Simulaciones: ${context.parsed.x}, Probabilidad: ${context.parsed.y.toFixed(2)}%`;
                        }
                    }
                }
            }
        }
    });

    // Inicializar los dados
    for (let i = 1; i <= 5; i++) {
        actualizarCaraDado(i, 1);
    }

    // Asignar gráfico a variable global para acceder desde otras funciones
    window.instanciaGrafico = grafico;
});

function lanzarDados() {
    if (simulacionEnCurso) return;
    
    const elementosDados = []; 
    for (let i = 1; i <= 5; i++) {
        elementosDados.push(document.getElementById("die" + i));
        elementosDados[i-1].classList.add("rolling");
    }
    
    // Simular animación de tirada
    let contadorAnimacion = 0;
    const intervaloLanzamiento = setInterval(() => {
        for (let i = 0; i < 5; i++) {
            const valorTemporal = Math.floor(Math.random() * 6) + 1;
            actualizarCaraDado(i+1, valorTemporal);
        }
        contadorAnimacion++;
        
        if (contadorAnimacion > 10) {
            clearInterval(intervaloLanzamiento);
            finalizarLanzamiento();
        }
    }, 50);
}

function finalizarLanzamiento() {
    // Obtener valores finales de los dados
    for (let i = 0; i < 5; i++) {
        valoresDados[i] = Math.floor(Math.random() * 6) + 1;
        actualizarCaraDado(i+1, valoresDados[i]);
    }
    
    // Quitar la animación
    setTimeout(() => {
        for (let i = 1; i <= 5; i++) {
            document.getElementById("die" + i).classList.remove("rolling");
        }
    }, 500);
    
    // Incrementar contador de tiradas
    numeroLanzamiento++;
    
    // Comprobar si se forma una escalera
    const hayEscalera = verificarEscalera(valoresDados);
    if (hayEscalera) {
        contadorEscaleras++;
        document.getElementById("isStraight").textContent = "¡ESCALERA!";
        document.getElementById("isStraight").style.color = "#45a049";
    } else {
        document.getElementById("isStraight").textContent = "No hay escalera";
        document.getElementById("isStraight").style.color = "#333";
    }
    
    // Actualizar la interfaz
    actualizarEstadisticas();
}

function ejecutarSimulacion(cantidad) {
    if (simulacionEnCurso) return;
    
    simulacionEnCurso = true;
    const intervalo = cantidad > 100 ? 1 : 10; // Ajustar velocidad según cantidad
    const retraso = cantidad > 100 ? 0 : 50;
    let contadorActual = 0;
    
    function simular() {
        if (contadorActual >= cantidad) {
            simulacionEnCurso = false;
            return;
        }
        
        for (let i = 0; i < intervalo && contadorActual < cantidad; i++) {
            // Generar valores aleatorios para los dados
            let valoresSimulados = [];
            for (let j = 0; j < 5; j++) {
                valoresSimulados.push(Math.floor(Math.random() * 6) + 1);
            }
            
            // Actualizar visualización solo para el último lanzamiento
            if (i === intervalo - 1 || contadorActual === cantidad - 1) {
                for (let j = 0; j < 5; j++) {
                    actualizarCaraDado(j+1, valoresSimulados[j]);
                }
                valoresDados = valoresSimulados;
            }
            
            // Comprobar escalera
            if (verificarEscalera(valoresSimulados)) {
                contadorEscaleras++;
            }
            
            numeroLanzamiento++;
            contadorActual++;
        }
        
        // Comprobar si el último lanzamiento formó una escalera
        const ultimoTieneEscalera = verificarEscalera(valoresDados);
        document.getElementById("isStraight").textContent = ultimoTieneEscalera ? "¡ESCALERA!" : "No hay escalera";
        document.getElementById("isStraight").style.color = ultimoTieneEscalera ? "#45a049" : "#333";
        
        // Actualizar estadísticas
        actualizarEstadisticas();
        
        // Continuar la simulación
        setTimeout(simular, retraso);
    }
    
    simular();
}

function reiniciarSimulacion() {
    numeroLanzamiento = 0;
    contadorEscaleras = 0;
    simulacionEnCurso = false;
    puntosDatos = [{x: 0, y: 0}];
    
    // Actualizar el gráfico
    window.instanciaGrafico.data.datasets[0].data = puntosDatos;
    window.instanciaGrafico.update();
    
    // Actualizar la interfaz
    document.getElementById("rollCount").textContent = "Simulaciones realizadas: 0";
    document.getElementById("straightCount").textContent = "Escaleras formadas: 0";
    document.getElementById("lastRoll").textContent = "Última tirada: ";
    document.getElementById("isStraight").textContent = "";
    document.getElementById("probability").textContent = "Probabilidad de escalera: 0%";
    document.getElementById("probabilityBar").style.width = "0%";
    document.getElementById("probabilityBar").textContent = "0%";
    
    // Reiniciar los dados a 1
    for (let i = 1; i <= 5; i++) {
        actualizarCaraDado(i, 1);
    }
    valoresDados = [1, 1, 1, 1, 1];
}

function verificarEscalera(valores) {
    // Ordenar los valores
    const valoresOrdenados = [...valores].sort((a, b) => a - b);
    
    // Eliminar duplicados
    const valoresUnicos = [...new Set(valoresOrdenados)];
    
    // Si hay menos de 5 valores únicos, no puede haber escalera
    if (valoresUnicos.length < 5) return false;
    
    // Verificar si hay una escalera pequeña (1-2-3-4-5)
    const escaleraPequena = [1, 2, 3, 4, 5];
    const escaleraGrande = [2, 3, 4, 5, 6];
    
    // Comprobar si los valores ordenados coinciden con alguna escalera
    if (arraysIguales(valoresUnicos, escaleraPequena) || arraysIguales(valoresUnicos, escaleraGrande)) {
        return true;
    }
    
    return false;
}

function arraysIguales(a, b) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

function actualizarEstadisticas() {
    document.getElementById("rollCount").textContent = "Simulaciones realizadas: " + numeroLanzamiento;
    document.getElementById("straightCount").textContent = "Escaleras formadas: " + contadorEscaleras;
    document.getElementById("lastRoll").textContent = "Última tirada: " + valoresDados.join(", ");
    
    // Calcular y mostrar la probabilidad
    if (numeroLanzamiento > 0) {
        const prob = (contadorEscaleras / numeroLanzamiento * 100).toFixed(2);
        document.getElementById("probability").textContent = `Probabilidad de escalera: ${prob}%`;
        document.getElementById("probabilityBar").style.width = `${Math.min(prob * 3, 100)}%`;
        document.getElementById("probabilityBar").textContent = `${prob}%`;
        
        // Actualizar el gráfico
        puntosDatos.push({x: numeroLanzamiento, y: parseFloat(prob)});
        window.instanciaGrafico.data.datasets[0].data = puntosDatos;
        
        // Ajustar escala X si es necesario
        if (numeroLanzamiento > window.instanciaGrafico.options.scales.x.max) {
            window.instanciaGrafico.options.scales.x.max = numeroLanzamiento * 1.2;
        }
        
        window.instanciaGrafico.update();
    }
}

function actualizarCaraDado(numeroDado, valor) {
    // Ocultar todos los puntos primero
    for (let i = 1; i <= 9; i++) {
        document.getElementById("die" + numeroDado + "-dot" + i).classList.add("hidden");
    }
    
    // Mostrar los puntos según el valor del dado
    switch (valor) {
        case 1:
            document.getElementById("die" + numeroDado + "-dot5").classList.remove("hidden");
            break;
        case 2:
            document.getElementById("die" + numeroDado + "-dot1").classList.remove("hidden");
            document.getElementById("die" + numeroDado + "-dot9").classList.remove("hidden");
            break;
        case 3:
            document.getElementById("die" + numeroDado + "-dot1").classList.remove("hidden");
            document.getElementById("die" + numeroDado + "-dot5").classList.remove("hidden");
            document.getElementById("die" + numeroDado + "-dot9").classList.remove("hidden");
            break;
        case 4:
            document.getElementById("die" + numeroDado + "-dot1").classList.remove("hidden");
            document.getElementById("die" + numeroDado + "-dot3").classList.remove("hidden");
            document.getElementById("die" + numeroDado + "-dot7").classList.remove("hidden");
            document.getElementById("die" + numeroDado + "-dot9").classList.remove("hidden");
            break;
        case 5:
            document.getElementById("die" + numeroDado + "-dot1").classList.remove("hidden");
            document.getElementById("die" + numeroDado + "-dot3").classList.remove("hidden");
            document.getElementById("die" + numeroDado + "-dot5").classList.remove("hidden");
            document.getElementById("die" + numeroDado + "-dot7").classList.remove("hidden");
            document.getElementById("die" + numeroDado + "-dot9").classList.remove("hidden");
            break;
        case 6:
            document.getElementById("die" + numeroDado + "-dot1").classList.remove("hidden");
            document.getElementById("die" + numeroDado + "-dot3").classList.remove("hidden");
            document.getElementById("die" + numeroDado + "-dot4").classList.remove("hidden");
            document.getElementById("die" + numeroDado + "-dot6").classList.remove("hidden");
            document.getElementById("die" + numeroDado + "-dot7").classList.remove("hidden");
            document.getElementById("die" + numeroDado + "-dot9").classList.remove("hidden");
            break;
    }
}