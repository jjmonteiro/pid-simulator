// Heating simulation variables
let currentTemp = 0;
let setpoint = parseFloat(setpointSlider.value); // Initial target temperature
let heatLossFactor = parseFloat(heatLossSlider.value) / 100; // Initial heat loss factor
let timeStep = 0.1; // Time step in seconds for simulation

// Initialize PID controller with default values
let pid = new PID(50, 0.01, 10); // Adjust Kp, Ki, Kd as needed

// Initialize Chart
const ctx = tempChartCanvas.getContext('2d');
const tempChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [
            { label: 'Current Temperature (°C)', data: [], borderColor: 'rgb(75, 192, 192)', fill: false },
            { label: 'Target Temperature (Setpoint)', data: [], borderColor: 'rgb(255, 99, 132)', borderDash: [5, 5], fill: false }
        ]
    },
    options: {
        animation: false, // Disable animation for new points
        scales: {
            x: { display: true, title: { display: true, text: 'Time (s)' } },
            y: { display: true, title: { display: true, text: 'Temperature (°C)' }, min: 0, max: 40 }
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

    // Update PID parameters
    pid.Kp = parseFloat(kpSlider.value);
    pid.Ki = parseFloat(kiSlider.value);
    pid.Kd = parseFloat(kdSlider.value);

    setpoint = parseFloat(setpointSlider.value);
    heatLossFactor = parseFloat(heatLossSlider.value) / 100;
}

function simulateHeating() {
    if (!simulationRunning) return; // If simulation is paused, stop the function

    // Calculate PID output as power percentage (0-100%)
    const power = pid.calculate(setpoint, currentTemp, timeStep);

    // Apply the PID output to temperature, simulating heating with heat loss
    const heatingEffect = power / 100; // Control power as a fraction of heating effect
    currentTemp += heatingEffect - heatLossFactor * (currentTemp - 5); // Heat loss term

    // Update displays
    currentTempDisplay.textContent = currentTemp.toFixed(2);
    powerOutputDisplay.textContent = Math.min(Math.max(power, 0), 100).toFixed(2); // Clamp to 0-100%
    pTermDisplay.textContent = (pid.Kp * (setpoint - currentTemp)).toFixed(2);
    iTermDisplay.textContent = (pid.Ki * pid.integral).toFixed(2);
    dTermDisplay.textContent = (pid.Kd * (setpoint - pid.prevError) / timeStep).toFixed(2);
    errorDisplay.textContent = (setpoint - currentTemp).toFixed(2);

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

// Event Listeners
kpSlider.addEventListener('input', updateValues);
kiSlider.addEventListener('input', updateValues);
kdSlider.addEventListener('input', updateValues);
setpointSlider.addEventListener('input', updateValues);
heatLossSlider.addEventListener('input', updateValues);

dumpHeatBtn.addEventListener('click', () => {
    if (currentTemp > 5) currentTemp -= 10;
});

clearIntegralBtn.addEventListener('click', () => {
    pid.reset();
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

tempChartCanvas.addEventListener('click', () => {
    // Toggle simulation pause/resume on graph click
    simulationRunning = !simulationRunning;
    if (simulationRunning) {
        simulateHeating(); // Restart simulation if resumed
    }
});

// Start Simulation
updateValues();
simulateHeating();
