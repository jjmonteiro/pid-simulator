// Heating simulation variables
let currentTemp = 0;
let setpoint = parseFloat(setpointSlider.value); // Initial target temperature
let heatLossFactor = parseFloat(heatLossSlider.value) / 100; // Initial heat loss factor
let timeStep = 0.1; // Time step in seconds for simulation

// Initialize PID controller with default values
let pid = new PID(0, 0, 0); // Adjust Kp, Ki, Kd as needed

// Initialize Chart
const ctx = tempChartCanvas.getContext('2d');
const tempChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [
            { label: 'Current Temperature (°C)', data: [], borderColor: '#4bc0c0', fill: false },
            { label: 'Target Temperature (Setpoint)', data: [], borderColor: '#ff7d66', fill: false }
        ]
    },
    options: {
        animation: false,
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: { display: true, title: { display: true, text: 'Time (s)' } },
            y: { display: true, position: 'left', title: { display: true, text: 'Temperature (°C)' }, min: 0, max: 40 },
            y1:{ display: true, position: 'right', title: { display: true, text: 'Temperature (°C)' }, min: 0, max: 40 }
        },
        plugins: {
            legend: {
                labels: {
                    // This more specific font property overrides the global property
                    font: {
                        family: 'Raleway'
                    }
                }
            }
        }
    }
});

let simulationRunning = true; // Variable to track simulation state

function updateValues() {
    kpValue.textContent = kpSlider.value;
    kiValue.textContent = kiSlider.value;
    kdValue.textContent = kdSlider.value;
    setpointValue.textContent = setpointSlider.value;
    heatLossValue.textContent = heatLossSlider.value;
    outsideTempValue.textContent = outsideTempSlider.value;

    // Update PID parameters
    pid.Kp = parseFloat(kpSlider.value);
    pid.Ki = parseFloat(kiSlider.value);
    pid.Kd = parseFloat(kdSlider.value);

    setpoint = parseFloat(setpointSlider.value);
    heatLossFactor = parseFloat(heatLossSlider.value) / 100;
    outsideTemp = parseFloat(outsideTempSlider.value);
}

function simulateHeating() {
    if (!simulationRunning) return; // If simulation is paused, stop the function

    // Calculate PID output
    let controlOutput = pid.calculate(setpoint, currentTemp, timeStep);
    
    // Clamp power between 0 and 100
    controlOutput = Math.min(Math.max(controlOutput, 0), 100);

    // Control power as a fraction of heating effect
    const heatingEffect = controlOutput / 100;

    // Adjust temperature based on heating effect
    currentTemp += heatingEffect;

    // Apply heat loss only if heatLossFactor > 0
    if (heatLossFactor > 0) {
        currentTemp -= heatLossFactor * (currentTemp - outsideTemp); // Heat loss term
    }

    // Update displays
    
    // Update each custom progress bar
    function updateProgressBar(elementId, textId, value, max = 100) {
        const width = Math.min((value / max) * 100, 100); // Calculate width as a percentage
        document.getElementById(elementId).style.width = width + "%"; // Update bar width
        document.getElementById(textId).textContent = value.toFixed(2) + (textId.includes("Temp") ? " °C" : " %"); // Update text content
    }
    
    //currentTempDisplay.textContent = currentTemp.toFixed(2);
    //powerOutputDisplay.textContent = controlOutput.toFixed(2);
    pTermDisplay.textContent = (pid.Kp * (setpoint - currentTemp)).toFixed(2);
    iTermDisplay.textContent = (pid.Ki * pid.integral).toFixed(2);
    dTermDisplay.textContent = (pid.Kd * (setpoint - pid.prevError) / timeStep).toFixed(2);
    errorDisplay.textContent = (setpoint - currentTemp).toFixed(2);
    
    // Update progress bars
    updateProgressBar("currentTempProgress", "currentTempText", currentTemp);
    updateProgressBar("powerOutputProgress", "powerOutputText", Math.min(Math.max(controlOutput, 0), 100));

    // Update Chart
    if (tempChart.data.labels.length >= 100) {
        tempChart.data.labels.shift();
        tempChart.data.datasets[0].data.shift();
        tempChart.data.datasets[1].data.shift();
    }

    timeStep += 0.1;
    tempChart.data.labels.push(timeStep.toFixed(1));
    tempChart.data.datasets[0].data.push(currentTemp);
    tempChart.data.datasets[1].data.push(setpoint);
    tempChart.update();

    // Continue simulation
    setTimeout(simulateHeating, 100); // Update every 100ms
}

dumpHeatBtn.addEventListener('click', () => {
    if ((currentTemp -outsideTemp) > 5) currentTemp -= 5;
});

clearIntegralBtn.addEventListener('click', () => {
    pid.clearKi();
});

resetSimulationBtn.addEventListener('click', () => {
    currentTemp = 0;
    timeStep = 0.1;  // Ensure timeStep starts at a valid value
    pid.reset();
    tempChart.data.labels = [];
    tempChart.data.datasets[0].data = [];
    tempChart.data.datasets[1].data = [];
    tempChart.update();
});

// Event Listeners
kpSlider.addEventListener('input', updateValues);
kiSlider.addEventListener('input', updateValues);
kdSlider.addEventListener('input', updateValues);
setpointSlider.addEventListener('input', updateValues);
heatLossSlider.addEventListener('input', updateValues);
outsideTempSlider.addEventListener('input', updateValues);

tempChartCanvas.addEventListener('click', () => {
    // Toggle simulation pause/resume on graph click
    simulationRunning = !simulationRunning;
    if (simulationRunning) {
        simulateHeating(); // Restart simulation if resumed
    }
});

window.addEventListener('resize', () => {
    tempChart.resize();
});

// Start Simulation
updateValues();
simulateHeating();
