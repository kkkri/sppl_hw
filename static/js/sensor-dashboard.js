let animationFrameId;
let isAnimating = true;
let animationSpeed = 5; // Default speed
const windowSize = 50; // Number of points to show at onc

document.addEventListener('DOMContentLoaded', async () => {
    // Initialize sensor selector
    const sensorSelect = new Choices('#sensor-select', {
        removeItemButton: true,
        searchEnabled: true,
        placeholder: true,
        shouldSort: false,
    });

    // Chart configuration
    const ctx = document.getElementById('sensorChart').getContext('2d');
    let chart = null;
    
    // Color palette for sensors
    const colors = [
        '#7c3aed', '#10b981', '#3b82f6', 
        '#f59e0b', '#ec4899', '#6366f1',
        '#84cc16', '#ef4444', '#14b8a6',
        '#f97316', '#8b5cf6', '#06b6d4',
        '#d946ef', '#0ea5e9', '#22c55e',
        '#eab308', '#64748b'
    ];

    const fullData = {
        labels: [],
        datasets: []
    };

    // Load and parse CSV data
    const { data } = await Papa.parse('/static/data/test_sensor_data.csv', {
        download: true,
        header: true,
        dynamicTyping: true
    });

        // Store all data
        csvData.forEach((row, index) => {
            fullData.labels.push(index); // Use index as x-axis for smooth scrolling
            for(let i = 1; i <= 17; i++) {
                if(!fullData.datasets[i-1]) {
                    fullData.datasets[i-1] = {
                        label: `Sensor ${i}`,
                        data: [],
                        borderColor: colors[(i-1) % colors.length],
                        backgroundColor: 'transparent',
                        borderWidth: 2,
                        pointRadius: 0,
                        tension: 0.4
                    };
                }
                fullData.datasets[i-1].data.push(row[`sensor_${i}`]);
            }
        });

    // Process timestamps
    const timestamps = data.map(row => {
        const date = new Date(row.timestamp * 1000);
        return date.toLocaleTimeString();
    });

    // Create initial chart
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: timestamps,
            datasets: []
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 1000,
                easing: 'easeInOutQuart'
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#94a3b8'
                    }
                },
                zoom: {
                    zoom: {
                        wheel: { enabled: true },
                        pinch: { enabled: true },
                        mode: 'x'
                    },
                    pan: {
                        enabled: true,
                        mode: 'x'
                    }
                }
            },
            scales: {
                x: {
                    // grid: { color: 'rgba(241, 136, 136, 0.1)' },
                    // ticks: { color: '#94a3b8' }
                    display: false // Hide x-axis labels for smooth animation
                },
                y: {
                    // grid: { color: 'rgba(255,255,255,0.1)' },
                    // ticks: { color: '#94a3b8' }
                    suggestedMin: 0,
                    suggestedMax: 100
                }
            }
        }
    });

    animateChart();

    // Update chart when sensors are selected
    sensorSelect.passedElement.element.addEventListener('change', updateChart);

    // Initial chart update
    updateChart();

    function updateChart() {
        const selectedSensors = sensorSelect.getValue(true);
        
        chart.data.datasets = selectedSensors.map((sensor, index) => ({
            label: `Sensor ${sensor.value.split('_')[1]}`,
            data: data.map(row => row[sensor.value]),
            borderColor: colors[index],
            backgroundColor: createGradient(ctx, colors[index]),
            borderWidth: 2,
            pointRadius: 0,
            tension: 0.4,
            fill: true
        }));

        chart.update();
    }

    function createGradient(ctx, color) {
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, `${color}33`);
        gradient.addColorStop(1, `${color}00`);
        return gradient;
    }

    // Simulate real-time updates
    setInterval(() => {
        if(chart.data.labels.length > 50) {
            chart.data.labels.shift();
            chart.data.datasets.forEach(dataset => dataset.data.shift());
        }
        
        chart.data.labels.push(new Date().toLocaleTimeString());
        chart.data.datasets.forEach(dataset => {
            dataset.data.push(dataset.data[dataset.data.length - 1] + (Math.random() - 0.5))
        });
        
        chart.update();
    }, 1000);
});


function animateChart() {
    if(!isAnimating) return;

    chart.data.labels = Array.from({length: windowSize}, (_, i) => i);
    
    const selectedSensors = sensorSelect.getValue(true).map(s => parseInt(s.value.split('_')[1]));
    chart.data.datasets = selectedSensors.map(sensorIndex => ({
        ...fullData.datasets[sensorIndex-1],
        data: fullData.datasets[sensorIndex-1].data.slice(
            currentFrame, 
            currentFrame + windowSize
        )
    }));

    chart.update();
    currentFrame = (currentFrame + animationSpeed) % (fullData.labels.length - windowSize);
    animationFrameId = requestAnimationFrame(animateChart);
}

function toggleAnimation() {
    isAnimating = !isAnimating;
    document.getElementById('animationBtn').textContent = isAnimating ? '⏸ Pause' : '▶ Play';
    if(isAnimating) animateChart();
}

function updateSpeed(speed) {
    animationSpeed = speed;
}
