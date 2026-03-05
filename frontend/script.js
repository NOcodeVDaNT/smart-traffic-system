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

    // create cars for each new vehicle
    // NORTH → SOUTH lane
cars.push({x:285, y:0, dir:"south", color:"blue"});

// SOUTH → NORTH lane
cars.push({x:315, y:600, dir:"north", color:"green"});

// EAST → WEST lane
cars.push({x:600, y:285, dir:"west", color:"orange"});

// WEST → EAST lane
cars.push({x:0, y:315, dir:"east", color:"red"});
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



function updateCars() {

    cars.forEach(car => {

        // NORTH → SOUTH
      if (car.dir === "south") {

    const stopLine = 230;

    if (currentPhase === "NS" && currentState === "GREEN") {
        car.y += 1;
    }
    else if (car.y + 1 < stopLine) {
        car.y += 1;
    }
    else {
        car.y = stopLine - 1; // clamp exactly behind line
    }

}

        // SOUTH → NORTH
       if (car.dir === "north") {

    const stopLine = 370;

    if (currentPhase === "NS" && currentState === "GREEN") {
        car.y -= 1;
    }
    else if (car.y - 1 > stopLine) {
        car.y -= 1;
    }
    else {
        car.y = stopLine + 1;
    }

}
        // EAST → WEST
       if (car.dir === "west") {

    const stopLine = 370;

    if (currentPhase === "EW" && currentState === "GREEN") {
        car.x -= 1;
    }
    else if (car.x - 1 > stopLine) {
        car.x -= 1;
    }
    else {
        car.x = stopLine + 1;
    }

}

        // WEST → EAST
       if (car.dir === "east") {

    const stopLine = 230;

    if (currentPhase === "EW" && currentState === "GREEN") {
        car.x += 1;
    }
    else if (car.x + 1 < stopLine) {
        car.x += 1;
    }
    else {
        car.x = stopLine - 1;
    }

}

    });

    // remove cars leaving screen
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

    ctx.fillStyle = "#2f2f2f";
    ctx.fillRect(0,0,600,600);

    ctx.fillStyle = "#444";

    // vertical road
    ctx.fillRect(240,0,120,600);

    // horizontal road
    ctx.fillRect(0,240,600,120);

    // lane divider lines
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.setLineDash([12,10]);

    // vertical divider
    ctx.beginPath();
    ctx.moveTo(300,0);
    ctx.lineTo(300,600);
    ctx.stroke();

    // horizontal divider
    ctx.beginPath();
    ctx.moveTo(0,300);
    ctx.lineTo(600,300);
    ctx.stroke();

    ctx.setLineDash([]);

    ctx.fillStyle = "white";

ctx.fillRect(240,230,120,4); // north stop line
ctx.fillRect(240,366,120,4); // south stop line
ctx.fillRect(230,240,4,120); // west stop line
ctx.fillRect(366,240,4,120); // east stop line

}

function animate(){

    ctx.clearRect(0,0,600,600);

    drawRoad();     // draw intersection
    updateCars();   // move vehicles
    drawCars();     // render vehicles

    requestAnimationFrame(animate);

}

animate();

setInterval(generateTraffic, 1000);
setInterval(sendTrafficData, 60000);
setInterval(updateSignalStatus, 1000);
