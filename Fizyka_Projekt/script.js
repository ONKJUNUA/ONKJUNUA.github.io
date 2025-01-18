const canvas = document.getElementById('pendulumCanvas');
const ctx = canvas.getContext('2d');

let length = parseFloat(document.getElementById('length').value);
let mass = parseFloat(document.getElementById('mass').value);
let angle = parseFloat(document.getElementById('angle').value) * (Math.PI / 180);
let gravity = parseFloat(document.getElementById('gravity').value);

const lengthOutput = document.getElementById('length-value');
const massOutput = document.getElementById('mass-value');
const angleOutput = document.getElementById('angle-value');

const timeSlider = document.getElementById('time-slider');
const timeOutput = document.getElementById('time-value');

let omega = 0;
let alpha = 0;
let timeStep = 0.02;
let isPaused = true;
let animationFrame;

function updateTimeBasedValues() {
    const period = 2 * Math.PI * Math.sqrt(length / gravity);
    const time = parseFloat(timeSlider.value) * period;
    const angularFrequency = 2 * Math.PI / period;
    const newAngle = angle * Math.cos(angularFrequency * time);

    const totalEnergy = mass * gravity * length * (1 - Math.cos(angle));

    const potentialEnergy = mass * gravity * length * (1 - Math.cos(newAngle));
    const kineticEnergy = totalEnergy - potentialEnergy;

    document.getElementById('current-angle').textContent = (newAngle * (180 / Math.PI)).toFixed(2);
    document.getElementById('kinetic-energy').textContent = kineticEnergy.toFixed(2);
    document.getElementById('potential-energy').textContent = potentialEnergy.toFixed(2);
    timeOutput.textContent = time.toFixed(2);

    drawPendulumAt(newAngle);
    drawEnergyBars(kineticEnergy, potentialEnergy);
}

function drawPendulumAt(newAngle) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const originX = canvas.width / 2;
    const originY = 50;
    const bobX = originX + length * 200 * Math.sin(newAngle);
    const bobY = originY + length * 200 * Math.cos(newAngle);
    
    ctx.beginPath();
    ctx.moveTo(originX, originY);
    ctx.lineTo(bobX, bobY);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(bobX, bobY, mass * 5, 0, 2 * Math.PI);
    ctx.fill();
}

timeSlider.addEventListener('input', updateTimeBasedValues);

function updateValues() {
    length = parseFloat(document.getElementById('length').value);
    mass = parseFloat(document.getElementById('mass').value);
    angle = parseFloat(document.getElementById('angle').value) * (Math.PI / 180);
    gravity = parseFloat(document.getElementById('gravity').value);

    lengthOutput.textContent = length;
    massOutput.textContent = mass;
    angleOutput.textContent = document.getElementById('angle').value;

    const period = 2 * Math.PI * Math.sqrt(length / gravity);
    document.getElementById('period-time').textContent = period.toFixed(2);
    drawPendulum();
}

function drawPendulum() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const originX = canvas.width / 2;
    const originY = 50;
    const bobX = originX + length * 200 * Math.sin(angle);
    const bobY = originY + length * 200 * Math.cos(angle);
    
    ctx.beginPath();
    ctx.moveTo(originX, originY);
    ctx.lineTo(bobX, bobY);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(bobX, bobY, mass * 5, 0, 2 * Math.PI);
    ctx.fill();
    
    document.getElementById('current-angle').textContent = (angle * (180 / Math.PI)).toFixed(2);

    const kineticEnergy = 0.5 * mass * (length * omega) ** 2;
    const potentialEnergy = mass * gravity * (length - length * Math.cos(angle));
    
    document.getElementById('kinetic-energy').textContent = kineticEnergy.toFixed(2);
    document.getElementById('potential-energy').textContent = potentialEnergy.toFixed(2);
}

const energyCanvas = document.getElementById('energyChart');
const energyCtx = energyCanvas.getContext('2d');

let energyTime = [];
let kineticEnergyData = [];
let potentialEnergyData = [];
let totalEnergyData = [];

function updateEnergyChart(currentTime, kineticEnergy, potentialEnergy) {
    const totalEnergy = kineticEnergy + potentialEnergy;

    energyTime.push(currentTime);
    kineticEnergyData.push(kineticEnergy);
    potentialEnergyData.push(potentialEnergy);
    totalEnergyData.push(totalEnergy);

    if (energyTime.length > 200) {
        energyTime.shift();
        kineticEnergyData.shift();
        potentialEnergyData.shift();
        totalEnergyData.shift();
    }
}

function drawEnergyBars(kineticEnergy, potentialEnergy) {
    energyCtx.clearRect(0, 0, energyCanvas.width, energyCanvas.height);

    const width = energyCanvas.width;
    const height = energyCanvas.height;

    const barWidth = 100;
    const gap = 50;
    const maxEnergy = Math.max(kineticEnergy, potentialEnergy, 1);

    const kineticBarHeight = (kineticEnergy / maxEnergy) * (height - 50);
    const potentialBarHeight = (potentialEnergy / maxEnergy) * (height - 50);

    energyCtx.fillStyle = 'red';
    energyCtx.fillRect(
        width / 4 - barWidth / 2,
        height - kineticBarHeight - 20,
        barWidth,
        kineticBarHeight
    );

    energyCtx.fillStyle = 'blue';
    energyCtx.fillRect(
        (3 * width) / 4 - barWidth / 2,
        height - potentialBarHeight - 20,
        barWidth,
        potentialBarHeight
    );

    energyCtx.fillStyle = 'black';
    energyCtx.font = '16px Arial';
    energyCtx.textAlign = 'center';
    energyCtx.fillText('Energia kinetyczna', width / 4, height - 5);
    energyCtx.fillText('Energia potencjalna', (3 * width) / 4, height - 5);

    energyCtx.fillText(
        kineticEnergy.toFixed(2) + ' J',
        width / 4,
        height - kineticBarHeight - 30
    );
    energyCtx.fillText(
        potentialEnergy.toFixed(2) + ' J',
        (3 * width) / 4,
        height - potentialBarHeight - 30
    );
}

function animate() {
    if (!isPaused) {
        alpha = - (gravity / length) * Math.sin(angle);
        omega += alpha * timeStep;
        angle += omega * timeStep;

        const kineticEnergy = 0.5 * mass * (length * omega) ** 2;
        const potentialEnergy = mass * gravity * (length - length * Math.cos(angle));

        drawEnergyBars(kineticEnergy, potentialEnergy);
        drawPendulum();
        animationFrame = requestAnimationFrame(animate);
    }
}

function resetSimulation() {
    isPaused = true;
    cancelAnimationFrame(animationFrame);
    document.getElementById('start-button').textContent = "Start";
    document.getElementById('pause-button').disabled = true;
    enableSliders();
    resetValues();

    drawEnergyBars(0, 0);
    drawPendulum();
}

function resetValues() {
    omega = 0;
    angle = parseFloat(document.getElementById('angle').value) * (Math.PI / 180);
}

function disableSliders() {
    document.getElementById('length').disabled = true;
    document.getElementById('mass').disabled = true;
    document.getElementById('angle').disabled = true;
    document.getElementById('gravity').disabled = true;
    document.getElementById('time-slider').disabled = true;
}

function enableSliders() {
    document.getElementById('length').disabled = false;
    document.getElementById('mass').disabled = false;
    document.getElementById('angle').disabled = false;
    document.getElementById('gravity').disabled = false;
    document.getElementById('time-slider').disabled = false;
}

document.getElementById('start-button').addEventListener('click', () => {
    if (isPaused) {
        isPaused = false;
        document.getElementById('start-button').textContent = "Reset";
        document.getElementById('pause-button').disabled = false;
        disableSliders();
        animate();
    } else {
        resetSimulation();
    }
});

document.getElementById('pause-button').addEventListener('click', () => {
    if (!isPaused) {
        isPaused = true;
        cancelAnimationFrame(animationFrame);
        document.getElementById('pause-button').textContent = "Wznów";
        document.getElementById('start-button').disabled = true;
    } else {
        isPaused = false;
        document.getElementById('pause-button').textContent = "Pauza";
        document.getElementById('start-button').disabled = false;
        animate();
    }
});

document.getElementById('length').addEventListener('input', updateValues);
document.getElementById('mass').addEventListener('input', updateValues);
document.getElementById('angle').addEventListener('input', updateValues);
document.getElementById('gravity').addEventListener('change', updateValues);

updateValues();
drawPendulum();
document.getElementById('pause-button').disabled = true;