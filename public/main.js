// vars
let canvas;
let ctx;
let bounds;
let cssScaling;

const missileWidth = 4;
const missileHeight = 4;

// will vary based on user
let frameRate = 60;

// classes
class Missile {
    constructor(x, y, angle, speed, launchPoint, type="normal") {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.speed = speed;
        this.path = [{x: this.x, y: this.y}];
        this.launchPoint = launchPoint
        this.detonatePoint = null;
        this.launched = false;
        this.exploded = false;
        this.explodeRadius = 0;
        this.explodeOut = true;
        this.type = type;
        this.scored = false;
    }

    update() {
        if(this.exploded) {
            if(this.explodeOut === true) {
                this.explodeRadius += 0.25;
            } else if (this.explodeRadius > 0 && this.explodeOut === false) {
                this.explodeRadius -= 0.25;
            }

            if(this.explodeRadius > 40) {
                this.explodeOut = false
            }

            if(this.type === "enemy" && !this.scored) {
                score += 25;
                this.scored = true;
            }

        } else {
            this.x += Math.cos(this.angle) * this.speed;
            this.y += Math.sin(this.angle) * this.speed;

            if(this.detonatePoint && Math.abs(this.x - this.detonatePoint.x) < 5 && Math.abs(this.y - this.detonatePoint.y) < 5) {
                this.exploded = true;
                if(this.type === "enemy") {
                    gameOver = true
                }
            }

            if(this.path.length > 10){
                this.path.shift()
            } else if (Math.abs(this.x - this.path[this.path.length-1].x) > 4 ||
                Math.abs(this.y - this.path[this.path.length-1].y) > 4) {
                this.path.push({x: this.x, y: this.y});
            }
        }

    }

    launch(angle, speed, detonatePoint) {
        this.angle = angle;
        this.speed = speed;
        this.x = this.launchPoint.x;
        this.y = this.launchPoint.y;
        this.detonatePoint = detonatePoint;

        this.launched = true;
    }

    draw(ctx) {
        if(this.exploded){
            ctx.save();
            ctx.beginPath();
            ctx.fillStyle = "white";
            ctx.arc(this.x, this.y, this.explodeRadius, 0, Math.PI * 2, false);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        } else {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.fillStyle = "blue";
            ctx.fillRect(-missileWidth/2, -missileHeight/2, missileWidth, missileHeight);
            ctx.restore();

            ctx.fillStyle = "red";
            this.path.forEach((p) => {
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.fillRect(-1, 0, 2, 2);
                ctx.restore();
            })
        }

    }
}

let myMissiles = [];
let enemyMissles = [];
let hills = [];
let h1, h2, h3;
let hillWidth, hillRadius, mid, leftRegion, rightRegion;
let level = 1;
let time = 0;
let score = 0;
let gameOver = false;
let gameRunning = false;

// initialize
window.onload = () => {
    const start = document.getElementById("start");
    start.addEventListener("click", startGame)
}

function startGame() {
    if (!gameRunning) {
        level = 1;
        score = 0;
        init()
        gameRunning = true;
    }
}

function init() {
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    bounds = canvas.getBoundingClientRect();
    myMissiles = [];
    enemyMissles = [];
    gameOver = false;

    // scaling to make mouse coords work
    cssScaling = canvas.width / bounds.width;

    h1 = {x1: 25, y1: canvas.height-50, x2: 45, y2: canvas.height-75, x3: 85, y3: canvas.height-75, x4: 105, y4: canvas.height-50}

    hillWidth = h1.x4 + h1.x1;
    mid = canvas.width/2;

    h2 = {x1: h1.x1+mid-hillWidth/2, x2: h1.x2+mid-hillWidth/2, x3: h1.x3+mid-hillWidth/2, x4: h1.x4+mid-hillWidth/2}
    h3 = {x1: h1.x1+canvas.width-hillWidth, x2: h1.x2+canvas.width-hillWidth, x3: h1.x3+canvas.width-hillWidth, x4: h1.x4+canvas.width-hillWidth}

    hills.push(h1, h2, h3);

    // borders for missile launching
    hillRadius = (h2.x2 + (h2.x3 - h2.x2)/2) - (h1.x2 + (h1.x3 - h1.x2)/2)
    leftRegion =  mid - hillRadius/ 2
    rightRegion = mid + hillRadius/ 2;

    drawLand()

    // setting up my missiles
    for (let h = 0; h < 3; h++) {
        let currentHill = hills[h];

        const rowCount = 4;
        const spacingX = 15;
        const spacingY = 7;
        const hillCenter = currentHill.x2 + (currentHill.x3 - currentHill.x2)/2

        let startX = hillCenter
        let startY = canvas.height - 70;
        let startColCount = 1;

        let missiles = [];

        for(let i= 0; i < rowCount; i++) {
            for(let j = 0; j < startColCount; j++) {

                const m = new Missile(startX, startY, 0, 0, {x: currentHill.x2 + (currentHill.x3 - currentHill.x2)/2, y: h1.y2});
                missiles.push(m);
                m.draw(ctx);


                startX += spacingX;
            }
            startColCount++;

            startX = hillCenter - (spacingX * (startColCount-1))/2;
            startY += spacingY;
        }

        myMissiles.push(missiles);
    }

    // setting up enemy missiles
    const enemyCount = Math.trunc(level * 2) + 3;

    for(let i = 0; i < enemyCount; i++) {
        const startX = Math.random() * (canvas.width-100);
        const m = new Missile(startX, -50, 0, 0, {x: startX, y: -50}, "enemy");
        enemyMissles.push(m);
    }


    ctx.stroke();
    requestAnimationFrame(redraw)
}

function drawLand() {
    ctx.fillStyle = "orange";

    // bottom rec
    ctx.beginPath()
    ctx.moveTo(0, h1.y1);
    ctx.lineTo(canvas.width, h1.y1)
    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(0, canvas.height);
    ctx.closePath();
    ctx.fill()

    // mountains
    ctx.beginPath()
    ctx.moveTo(h1.x1, h1.y1);
    ctx.lineTo(h1.x2, h1.y2);
    ctx.lineTo(h1.x3, h1.y3);
    ctx.lineTo(h1.x4, h1.y4);
    ctx.closePath();
    ctx.fill()

    ctx.beginPath()
    ctx.moveTo(h2.x1, h1.y1)
    ctx.lineTo(h2.x2, h1.y2)
    ctx.lineTo(h2.x3, h1.y3)
    ctx.lineTo(h2.x4, h1.y4)
    ctx.closePath();
    ctx.fill()

    ctx.beginPath()
    ctx.moveTo(h3.x1, h1.y1)
    ctx.lineTo(h3.x2, h1.y2)
    ctx.lineTo(h3.x3, h1.y3)
    ctx.lineTo(h3.x4, h1.y4)
    ctx.closePath();
    ctx.fill()

}

function redraw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save()

    drawLand();

    myMissiles.forEach(missile => {
        missile.forEach(m => {
            if(!m.exploded) {
                checkMissileCollisions(m);
            }
            m.update();
            m.draw(ctx);
        })
    })

    let numToLaunch = 0;

    // launches enemy missiles based on users frame rate
    if(time % (frameRate * 5) === 0) {
        numToLaunch = level;
        time = 0;
    }

    enemyMissles.forEach(m => {
        const targetX = Math.random() * (canvas.width-100);
        const targetY = canvas.height - 50;

        if(!m.launched && numToLaunch !== 0) {
            let speed = 0.2 + level/100;
            if(speed > 0.3) {
                speed = 0.3;
            }
            m.launch(Math.atan2(targetY - m.launchPoint.y, targetX - m.launchPoint.x ), speed, {x: targetX, y: targetY});
            numToLaunch--
        }

        if(!m.exploded) {
            checkMissileCollisions(m);
        }
        m.update();
        m.draw(ctx);
    })

    ctx.fillStyle = "white";
    ctx.font = "15px Serif";
    ctx.fillText(`${score}`, 20, 30);
    ctx.fillText("Wave: " + level, canvas.width - 100, 30);

    ctx.restore();

    time++;

    // check if wave is over
    const allScored = enemyMissles.every(m => m.scored)
    if(allScored && time % (frameRate * 5) === 0) {
        time=0;
        level++;
        init()
    } else if (gameOver === true) {
        ctx.fillStyle = "red";
        ctx.font = "50px Serif";
        ctx.fillText("Game Over", canvas.width/2 - 100, canvas.height/2);
        gameRunning = false;
    } else {
        requestAnimationFrame(redraw)
    }
}

function checkMissileCollisions(checkMissile) {
    const allMissiles = myMissiles.concat([enemyMissles]);

    allMissiles.forEach(missileList => {
        for (let m of missileList) {
            if(m.exploded) {
                const distX = Math.abs(checkMissile.x - m.x);
                const distY = Math.abs(checkMissile.y - m.y);
                const distance = Math.sqrt(Math.pow(distX, 2) + Math.pow(distY, 2));

                if(distance < m.explodeRadius) {
                    checkMissile.exploded = true;
                    return;
                }
            }
        }
    })

}

addEventListener('mousedown', (e) => {
    bounds = canvas.getBoundingClientRect();
    cssScaling = canvas.width / bounds.width;

    if(e.clientX < bounds.left || e.clientX > bounds.right || e.clientY < bounds.top || e.clientY > bounds.bottom) {
        console.log("out of bounds");
        return;
    }

    const mouseX = (e.clientX - bounds.left) * cssScaling;
    const mouseY = (e.clientY - bounds.top) * cssScaling;

    let missileSet;

    if(mouseX < leftRegion) {
        missileSet = myMissiles[0]
        if(allMissilesLaunched(missileSet)) {
            missileSet = getNonEmptyMissileSet();
        }

    } else if (mouseX > leftRegion && mouseX < rightRegion) {
        missileSet = myMissiles[1];
        if(allMissilesLaunched(missileSet)) {
            missileSet = getNonEmptyMissileSet();
        }

    } else {
        missileSet = myMissiles[2];
        if(allMissilesLaunched(missileSet)) {
            missileSet = getNonEmptyMissileSet();
        }
    }

    for(let m of missileSet) {
        if(!m.launched) {
            m.launch(Math.atan2(mouseY - m.launchPoint.y, mouseX - m.launchPoint.x ), 0.5, {x: mouseX, y: mouseY});
            break;
        }
    }
})

function getNonEmptyMissileSet() {
    myMissiles.forEach(missileSet => {
        if(!allMissilesLaunched(missileSet)) {
            return missileSet;
        }
    })
    return myMissiles[0];
}

function allMissilesLaunched(missileSet) {
    let launched = true;

    for(let m of missileSet) {
        if(!m.launched) {
            launched = false;
        }
    }

    return launched;
}