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

    let newNorth = Math.floor(Math.random() * 3);
    let newSouth = Math.floor(Math.random() * 3);
    let newEast  = Math.floor(Math.random() * 2);
    let newWest  = Math.floor(Math.random() * 2);

    northCount += newNorth;
    southCount += newSouth;
    eastCount  += newEast;
    westCount  += newWest;

    // create cars only when vehicles generated
    for (let i = 0; i < newNorth; i++) {
        cars.push({x:285, y:0, dir:"south", color:"blue"});
    }

    for (let i = 0; i < newSouth; i++) {
        cars.push({x:315, y:600, dir:"north", color:"green"});
    }

    for (let i = 0; i < newEast; i++) {
        cars.push({x:600, y:285, dir:"west", color:"orange"});
    }

    for (let i = 0; i < newWest; i++) {
        cars.push({x:0, y:315, dir:"east", color:"red"});
    }

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

        if (data.current_state === "GREEN") {

            if (data.current_phase === "NS") {
                northCount = Math.max(0, northCount - 3);
                southCount = Math.max(0, southCount - 3);
            }

            if (data.current_phase === "EW") {
                eastCount = Math.max(0, eastCount - 3);
                westCount = Math.max(0, westCount - 3);
            }

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

function updateCars() {

    cars.forEach(car => {

        let blocked = false;

        cars.forEach(other => {

            if (car === other) return;

            if (car.dir === "south" && other.dir === "south") {
                if (Math.abs(car.x - other.x) < 8 &&
                    other.y > car.y &&
                    other.y - car.y < 25) {
                    blocked = true;
                }
            }

            if (car.dir === "north" && other.dir === "north") {
                if (Math.abs(car.x - other.x) < 8 &&
                    car.y > other.y &&
                    car.y - other.y < 25) {
                    blocked = true;
                }
            }

            if (car.dir === "west" && other.dir === "west") {
                if (Math.abs(car.y - other.y) < 8 &&
                    car.x > other.x &&
                    car.x - other.x < 25) {
                    blocked = true;
                }
            }

            if (car.dir === "east" && other.dir === "east") {
                if (Math.abs(car.y - other.y) < 8 &&
                    other.x > car.x &&
                    other.x - car.x < 25) {
                    blocked = true;
                }
            }

        });

        if (blocked) return;

        let speed = 2;

        if (car.dir === "south") {
            if ((currentPhase === "NS" && currentState === "GREEN") || car.y + speed <= 230 || car.y > 230) {
                car.y += speed;
            }
        }

        if (car.dir === "north") {
            if ((currentPhase === "NS" && currentState === "GREEN") || car.y - speed >= 370 || car.y < 370) {
                car.y -= speed;
            }
        }

        if (car.dir === "west") {
            if ((currentPhase === "EW" && currentState === "GREEN") || car.x - speed >= 370 || car.x < 370) {
                car.x -= speed;
            }
        }

        if (car.dir === "east") {
            if ((currentPhase === "EW" && currentState === "GREEN") || car.x + speed <= 230 || car.x > 230) {
                car.x += speed;
            }
        }

    });

    cars = cars.filter(car =>
        car.x > -20 &&
        car.x < 620 &&
        car.y > -20 &&
        car.y < 620
    );

}

function drawCars(){

    cars.forEach(car => {
        ctx.fillStyle = car.color;
        ctx.fillRect(car.x, car.y, 8, 12);
    });

}

function drawRoad(){

    // Background (Grass/Dark Area)
    ctx.fillStyle = "#2f2f2f";
    ctx.fillRect(0,0,600,600);

    // Main Roads
    ctx.fillStyle = "#444";
    ctx.fillRect(240,0,120,600); // Vertical road
    ctx.fillRect(0,240,600,120); // Horizontal road

    // Left Lane solid lines
    ctx.fillStyle = "#ccc";
    ctx.fillRect(238,0,2,240); // Top-left
    ctx.fillRect(360,0,2,240); // Top-right
    ctx.fillRect(238,360,2,240); // Bottom-left
    ctx.fillRect(360,360,2,240); // Bottom-right
    
    ctx.fillRect(0,238,240,2); // Left-top
    ctx.fillRect(0,360,240,2); // Left-bottom
    ctx.fillRect(360,238,240,2); // Right-top
    ctx.fillRect(360,360,240,2); // Right-bottom

    // Center Dashed Lines (Lane Markings)
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.setLineDash([12,10]);
    
    // Vertical center line
    ctx.beginPath();
    ctx.moveTo(300,0);
    ctx.lineTo(300,230); // Stop at intersection
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(300,370); // Start after intersection
    ctx.lineTo(300,600);
    ctx.stroke();

    // Horizontal center line
    ctx.beginPath();
    ctx.moveTo(0,300);
    ctx.lineTo(230,300); // Stop at intersection
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(370,300); // Start after intersection
    ctx.lineTo(600,300);
    ctx.stroke();

    ctx.setLineDash([]); // Reset dash for subsequent drawing

    // Stop Lines (Thicker and clearer)
    ctx.fillStyle = "white";
    ctx.fillRect(240,230,120,6); // Top
    ctx.fillRect(240,364,120,6); // Bottom
    ctx.fillRect(230,240,6,120); // Left
    ctx.fillRect(364,240,6,120); // Right

    // Zebra Crossings
    ctx.fillStyle = "#ddd";
    // Top zebra crossing
    for (let i = 245; i < 355; i += 15) {
        ctx.fillRect(i, 210, 8, 15);
    }
    // Bottom zebra crossing
    for (let i = 245; i < 355; i += 15) {
        ctx.fillRect(i, 375, 8, 15);
    }
    // Left zebra crossing
    for (let i = 245; i < 355; i += 15) {
        ctx.fillRect(210, i, 15, 8);
    }
    // Right zebra crossing
    for (let i = 245; i < 355; i += 15) {
        ctx.fillRect(375, i, 15, 8);
    }

    // Traffic Light Poles & Base boxes
    ctx.fillStyle = "#111"; // Pole base
    ctx.fillRect(215, 215, 12, 12); // Top-left
    ctx.fillRect(373, 215, 12, 12); // Top-right
    ctx.fillRect(215, 373, 12, 12); // Bottom-left
    ctx.fillRect(373, 373, 12, 12); // Bottom-right
    
    // Light Pole stalks
    ctx.fillStyle = "#555";
    ctx.fillRect(225, 220, 15, 2); // Top-left pointing right
    ctx.fillRect(360, 220, 15, 2); // Top-right pointing left
    ctx.fillRect(225, 378, 15, 2); // Bottom-left pointing right
    ctx.fillRect(360, 378, 15, 2); // Bottom-right pointing left

}

function animate(){

    ctx.clearRect(0,0,600,600);

    drawRoad();
    updateCars();
    drawCars();

    requestAnimationFrame(animate);

}

animate();

setInterval(generateTraffic, 1000);
setInterval(sendTrafficData, 60000);
setInterval(updateSignalStatus, 1000);