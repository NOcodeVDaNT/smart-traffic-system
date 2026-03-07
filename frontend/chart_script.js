const ctxLine = document.getElementById('trafficChart').getContext('2d');

let timeLabels = [];
let actualTrafficData = [];
let predictedTrafficData = [];

// Initialize Chart.js
const trafficChart = new Chart(ctxLine, {
    type: 'line',
    data: {
        labels: timeLabels,
        datasets: [
            {
                label: 'Actual Traffic Volume (Total)',
                data: actualTrafficData,
                borderColor: '#00e676', // Bright Green
                backgroundColor: 'rgba(0, 230, 118, 0.2)',
                borderWidth: 2,
                pointBackgroundColor: '#00e676',
                pointRadius: 4,
                fill: true,
                tension: 0.3 // Smooth curves
            },
            {
                label: 'Predicted Traffic Volume (Total)',
                data: predictedTrafficData,
                borderColor: '#4facfe', // Bright Blue
                backgroundColor: 'transparent',
                borderWidth: 2,
                borderDash: [5, 5], // Dashed line to signify prediction
                pointBackgroundColor: '#4facfe',
                pointRadius: 4,
                fill: false,
                tension: 0.3
            }
        ]
    },
    options: {
        responsive: true,
        plugins: {
            legend: {
                labels: {
                    color: '#e0e0e0',
                    font: {
                        size: 14
                    }
                }
            },
            tooltip: {
                mode: 'index',
                intersect: false,
            }
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Time (Updates every cycle)',
                    color: '#a0a0a0'
                },
                ticks: {
                    color: '#a0a0a0'
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.05)'
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'Total Vehicles',
                    color: '#a0a0a0'
                },
                ticks: {
                    color: '#a0a0a0',
                    beginAtZero: true
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.05)'
                }
            }
        },
        animation: {
            duration: 800 // smooth transition
        }
    }
});

// We need a way to get the *latest* traffic data and prediction. 
// Since tracking is done locally in script.js and sent via POST, let's poll a new endpoint (if we make one) 
// or fetch from an existing one. 
// Wait, the backend currently doesn't expose an endpoint that *returns* the last prediction easily for polling, 
// EXCEPT when we send a POST to /traffic, it returns `predicted_next_traffic`.
// Let's modify how we store this. The simplest way without modifying backend is to use localStorage to pass data between index.html and chart.html!

// Define an array to hold all historical errors for long-term tracking
let historicalErrors = [];

function calculateMetrics() {
    if (actualTrafficData.length === 0) return;

    let totalAbsoluteError = 0;
    let totalActualVolume = 0;

    // Calculate sum of absolute errors for current visible points
    for (let i = 0; i < actualTrafficData.length; i++) {
        let actual = actualTrafficData[i];
        let predicted = predictedTrafficData[i];
        totalAbsoluteError += Math.abs(actual - predicted);
        totalActualVolume += actual;
    }

    // Calculate MAE
    let currentMAE = totalAbsoluteError / actualTrafficData.length;
    
    // Optional: Keep a running total if you want it smoothed over time, but for now we'll just track MAE of the visible window
    // Update MAE display
    document.getElementById('kpi-mae').innerText = currentMAE.toFixed(2) + " cars";

    // Calculate Accuracy (Avoid division by zero)
    let accuracy = 100;
    if (totalActualVolume > 0) {
        // Average Error %
        let errorPercentage = (totalAbsoluteError / totalActualVolume) * 100;
        accuracy = Math.max(0, 100 - errorPercentage);
    } else if (currentMAE > 0) {
        // If actual is 0 but there is an error, accuracy drops
        accuracy = Math.max(0, 100 - (currentMAE * 10)); // Arbitrary penalty when actual is 0
    }

    // Update Accuracy display
    let accElement = document.getElementById('kpi-accuracy');
    accElement.innerText = accuracy.toFixed(1) + "%";

    // Dynamic coloring based on accuracy
    if (accuracy >= 90) {
        accElement.style.color = '#00e676'; // Bright Green
        accElement.style.textShadow = '0 0 15px rgba(0, 230, 118, 0.4)';
    } else if (accuracy >= 75) {
        accElement.style.color = '#ffeb3b'; // Yellow
        accElement.style.textShadow = '0 0 15px rgba(255, 235, 59, 0.4)';
    } else {
        accElement.style.color = '#ff3d00'; // Red
        accElement.style.textShadow = '0 0 15px rgba(255, 61, 0, 0.4)';
    }
}

function updateChart() {
    // Read the latest data saved by script.js
    const latestDataStr = localStorage.getItem('lastTrafficData');

    if (latestDataStr) {
        const data = JSON.parse(latestDataStr);

        // Prevent adding duplicates if the timestamp hasn't changed
        const lastLabel = timeLabels[timeLabels.length - 1];
        if (lastLabel !== data.time) {

            // Add new data
            timeLabels.push(data.time);
            actualTrafficData.push(data.actualTotal);
            predictedTrafficData.push(data.predictedTotal);

            // Keep only the last 15 data points so it doesn't get squished
            if (timeLabels.length > 15) {
                timeLabels.shift();
                actualTrafficData.shift();
                predictedTrafficData.shift();
            }

            // Update Metrics calculations
            calculateMetrics();

            // Update the chart
            trafficChart.update();
        }
    }
}

// Check for new data every second
setInterval(updateChart, 60000);
