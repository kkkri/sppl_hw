// Add scroll event listener for navbar effect
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Close dropdowns when clicking outside
document.addEventListener('click', function(e) {
    const dropdowns = document.querySelectorAll('.dropdown');
    dropdowns.forEach(dropdown => {
        if (!dropdown.contains(e.target)) {
            dropdown.querySelector('.dropdown-menu').style.display = 'none';
        }
    });
});

// Mobile menu toggle (optional)
// You can add mobile responsiveness if needed
document.addEventListener("DOMContentLoaded", function () {
    const csvFile = "/static/data/test_sensor_data.csv"; // Ensure correct path
    let sensorData = [];
    let timestamps = [];
    let animationInterval;
    let isPlaying = true;
    let animationStep = 0;

    function loadCSV() {
        fetch(csvFile)
            .then(response => response.text())
            .then(data => {
                Papa.parse(data, {
                    dynamicTyping: true,
                    skipEmptyLines: true,
                    complete: function (results) {
                        timestamps = results.data.map(row => row[0]); // First column as timestamps
                        sensorData = results.data.map(row => row.slice(1)); // All sensor columns
                        populateSensorDropdown(sensorData[0].length);
                        plotSensorData(1); // Default sensor 1
                    }
                });
            });
    }

    function populateSensorDropdown(sensorCount) {
        const select = document.getElementById("sensorSelect");
        select.innerHTML = ""; // Clear previous options

        for (let i = 1; i <= sensorCount; i++) {
            let option = document.createElement("option");
            option.value = i;
            option.textContent = `Sensor ${i}`;
            select.appendChild(option);
        }

        select.addEventListener("change", function () {
            plotSensorData(parseInt(this.value));
        });
    }

    let myChart;
    function plotSensorData(sensorIndex) {
        if (myChart) {
            myChart.destroy();
        }

        const sensorValues = sensorData.map(row => row[sensorIndex - 1]); // Extract sensor column
        const ctx = document.getElementById("myChart").getContext("2d");

        myChart = new Chart(ctx, {
            type: "line",
            data: {
                labels: timestamps,
                datasets: [{
                    label: `Sensor ${sensorIndex} Readings`,
                    data: sensorValues,
                    borderColor: "rgba(243, 118, 27, 1)",
                    borderWidth: 2,
                    fill: false,
                    pointRadius: 0,
                    tension: 0.4 // Smooth curves instead of straight lines
                }]
            },
            options: {
                responsive: true,
                animation: false,
                scales: {
                    x: {
                        type: "linear",
                        ticks: {
                            display: false
                        }
                    },
                    y: {
                        beginAtZero: false
                    }
                }
            }
        });

        startAnimation();
    }

    function startAnimation() {
        if (!myChart) return;
        clearInterval(animationInterval);
        animationStep = 0;

        animationInterval = setInterval(() => {
            if (!isPlaying) return;
            
            if (animationStep >= timestamps.length - 50) {
                animationStep = 0;
            }

            myChart.data.labels = timestamps.slice(animationStep, animationStep + 50);
            myChart.data.datasets[0].data = sensorData.slice(animationStep, animationStep + 50)
                .map(row => row[document.getElementById("sensorSelect").value - 1]);

            myChart.update();
            animationStep += 1;
        }, 100); // Slow animation speed
    }

    document.getElementById("playPauseBtn").addEventListener("click", function () {
        isPlaying = !isPlaying;
        this.textContent = isPlaying ? "Pause" : "Play";
    });

    loadCSV();
});
