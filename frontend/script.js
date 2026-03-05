let currentPhase = "NS";
let currentState = "RED";

const canvas = document.getElementById("trafficCanvas");
const ctx = canvas.getContext("2d");

let cars = [];

console.log("PAGE LOADED at:", new Date().toLocaleTimeString());
let northCount = 0;
let southCount = 0;
let eastCount = 0;
let westCount = 0;

function generateTraffic() {

    northCount += Math.floor(Math.random() * 3);
    southCount += Math.floor(Math.random() * 3);
    eastCount  += Math.floor(Math.random() * 2);
    westCount  += Math.floor(Math.random() * 2);

    document.getElementById("count-north").innerText = northCount;
    document.getElementById("count-south").innerText = southCount;
    document.getElementById("count-east").innerText = eastCount;
    document.getElementById("count-west").innerText = westCount;

}
function sendTrafficData() {

    fetch("http://127.0.0.1:5000/traffic", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            north: northCount,
            south: southCount,
            east: eastCount,
            west: westCount
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log("Traffic sent to backend:", data);
    });

}
function updateSignalStatus() {

    fetch("http://127.0.0.1:5000/signal_status")
    .then(response => response.json())
    .then(data => {

          currentPhase = data.current_phase;
    currentState = data.current_state;

        document.getElementById("phase").innerText = data.current_phase;
        document.getElementById("state").innerText = data.current_state;
        document.getElementById("timer").innerText = data.remaining_time;

        updateLights(data);

          // 🚗 Reduce cars when signal is GREEN
        if (data.current_state === "GREEN") {

            if (data.current_phase === "NS") {

                northCount = Math.max(0, northCount - 3);
                southCount = Math.max(0, southCount - 3);

            }

            if (data.current_phase === "EW") {

                eastCount = Math.max(0, eastCount - 3);
                westCount = Math.max(0, westCount - 3);

            }

            // update display
            document.getElementById("count-north").innerText = northCount;
            document.getElementById("count-south").innerText = southCount;
            document.getElementById("count-east").innerText = eastCount;
            document.getElementById("count-west").innerText = westCount;

        }

    });

}

function updateLights(data) {

    const north = document.getElementById("light-north");
    const south = document.getElementById("light-south");
    const east  = document.getElementById("light-east");
    const west  = document.getElementById("light-west");

    // reset all lights
    north.style.backgroundColor = "red";
    south.style.backgroundColor = "red";
    east.style.backgroundColor = "red";
    west.style.backgroundColor = "red";

    if (data.current_phase === "NS") {

        if (data.current_state === "GREEN") {
            north.style.backgroundColor = "green";
            south.style.backgroundColor = "green";
        }

        if (data.current_state === "YELLOW") {
            north.style.backgroundColor = "yellow";
            south.style.backgroundColor = "yellow";
        }

    }

    if (data.current_phase === "EW") {

        if (data.current_state === "GREEN") {
            east.style.backgroundColor = "green";
            west.style.backgroundColor = "green";
        }

        if (data.current_state === "YELLOW") {
            east.style.backgroundColor = "yellow";
            west.style.backgroundColor = "yellow";
        }

    }

}

function spawnCars() {

    if (Math.random() < 0.5) {
        cars.push({x:300, y:0, dir:"south"});
    }

    if (Math.random() < 0.5) {
        cars.push({x:290, y:600, dir:"north"});
    }

    if (Math.random() < 0.4) {
        cars.push({x:600, y:300, dir:"west"});
    }

    if (Math.random() < 0.4) {
        cars.push({x:0, y:290, dir:"east"});
    }

}

function updateCars() {

    cars.forEach(car => {

        // NORTH → SOUTH movement
        if (car.dir === "south") {

            if (currentPhase === "NS" && currentState === "GREEN") {
                car.y += 1;
            }

            if (car.y < 280) {
                car.y += 1;
            }

        }

        // SOUTH → NORTH movement
        if (car.dir === "north") {

            if (currentPhase === "NS" && currentState === "GREEN") {
                car.y -= 1;
            }

            if (car.y > 320) {
                car.y -= 1;
            }

        }

        // EAST → WEST movement
        if (car.dir === "west") {

            if (currentPhase === "EW" && currentState === "GREEN") {
                car.x -= 1;
            }

            if (car.x > 320) {
                car.x -= 1;
            }

        }

        // WEST → EAST movement
        if (car.dir === "east") {

            if (currentPhase === "EW" && currentState === "GREEN") {
                car.x += 1;
            }

            if (car.x < 280) {
                car.x += 1;
            }

        }

    });
     // 🚗 Remove cars that left the screen
    cars = cars.filter(car =>
        car.x > -20 &&
        car.x < 620 &&
        car.y > -20 &&
        car.y < 620
    );

}

function drawCars() {

    ctx.clearRect(0,0,600,600);

    cars.forEach(car => {
        ctx.fillStyle = "blue";
        ctx.fillRect(car.x, car.y, 4, 8);
    });

}

function animate(){

    updateCars();
    drawCars();

    requestAnimationFrame(animate);

}

animate();

setInterval(generateTraffic, 1000);
setInterval(sendTrafficData, 60000);
setInterval(updateSignalStatus, 1000);
setInterval(spawnCars, 2000);