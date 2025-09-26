// vars
let canvas;
let ctx;
let bounds;
let cssScaling;

const missileWidth = 4;
const missileHeight = 4;

// classes
class Missile {
    constructor(x, y, angle, speed, launchPoint) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.speed = speed;
        this.path = [{x: this.x, y: this.y}];
        this.launchPoint = launchPoint
        this.detonatePoint = null;
        this.launched = false;
    }

    update() {
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;

        if(this.path.length > 10){
            this.path.shift()
        } else if (Math.abs(this.x - this.path[this.path.length-1].x) > 4 ||
                    Math.abs(this.y - this.path[this.path.length-1].y) > 4) {
            this.path.push({x: this.x, y: this.y});
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

let myMissiles = [];
let enemyMissles = [];
let hills = [];
let h1, h2, h3;
let hillWidth, hillRadius, mid, leftRegion, rightRegion;

const m = new Missile(100, 100, 45, 0.1)

// initialize
window.onload = () => {
    init();
}

function init() {
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    bounds = canvas.getBoundingClientRect();

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
            m.update();
            m.draw(ctx);
        })
    })

    ctx.restore();

    requestAnimationFrame(redraw)
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
            m.launch(Math.atan2(mouseY - m.launchPoint.y, mouseX - m.launchPoint.x ), 0.4, {x: mouseX, y: mouseY});
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