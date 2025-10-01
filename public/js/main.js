const cellSize = 10;
paused = true
alivecolor = ''
deadcolor = '#000000'
speed = 500



const board = []
const appdata = []
for (let i = 0; i < 100; i++){
  board[i] = []
  for (let j = 0; j < 100; j++) {
    board[i][j] = false;
  }
}

const generation = async function(){
  for(let i = 0; i < 100; i++){
    appdata[i] = []
    for(let j = 0; j < 100; j++){
      let count = 0
      if(board[i][j]){
        for(let ii = i-1; ii <= i+1; ii++){
          for(let jj = j-1; jj <= j+1; jj++){
            if(((ii !== i || jj !== j) && (ii >= 0 && ii < 100 && jj >= 0 && jj < 100))){
              if(board[ii][jj]){
                count++
              }
            }
          }
        }
        if (count < 2 || count > 3){
          appdata[i][j] = false
        }
        else{
          appdata[i][j] = true
        }
      }
      else{
        for(let ii = i-1; ii <= i+1; ii++){
          for(let jj = j-1; jj <= j+1; jj++){
            if(((ii != i || jj != j) && (ii >= 0 && ii < 100 && jj >= 0 && jj < 100))){
              if(board[ii][jj]){
                count++
              }
            }
          }
        }
        if (count == 3){
          appdata[i][j] = true
        }
        else{
          appdata[i][j] = false
        }

      }
    }
  }
}

const update = async function() {
  let red = document.getElementById("redValue")
  let green = document.getElementById("greenValue")
  let blue = document.getElementById("blueValue")
  alivecolor = `rgb(${red.value}, ${green.value}, ${blue.value}`
  deadcolor = '#000000'
  cells = document.getElementById("cells")
  context = cells.getContext('2d')
  for (let i = 0; i < board.length; i++){
    for (let j = 0; j < board[i].length; j++) {
      
      let x = i*10
      let y = j*10
      if (board[i][j]){
        context.fillStyle = alivecolor;
      }
      else{
        context.fillStyle = deadcolor;
      }
      context.fillRect(x, y, cellSize, cellSize)
    }
  }
}

const unpause = async function() {
  if (paused){
    paused = false
    a = go()
  }
}

const pause = async function() {
  paused = true
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const go = async function() {

  await generation()

  for (let i = 0; i < 100; i++){
    for (let j = 0; j < 100; j++){
      board[i][j] = appdata[i][j]
    }
  }

  await update()

  await delay(speed);

  if(!paused){
    a = go()
  }

  
}

const create = async function(x, y) {
    if (board[x][y]){
      board[x][y] = false
    }
    else {
      board[x][y] = true
    }
  }

window.onload = function() {
  const cells = document.getElementById("cells");
  const context = cells.getContext('2d');

  const rslider = document.getElementById("redValue");
  const gslider = document.getElementById("greenValue");
  const bslider = document.getElementById("blueValue");

  rslider.addEventListener('input', function(event) {update()})
  gslider.addEventListener('input', function(event) {update()})
  bslider.addEventListener('input', function(event) {update()})

  const sslider = document.getElementById("speedValue");
  sslider.addEventListener('input', function(event) {speed = 1100 - sslider.value})
  speed = 1100 - sslider.value

  cells.addEventListener('mousedown', function(event) {
    var x = Math.floor(event.offsetX / 10) * 10
        y = Math.floor(event.offsetY / 10) * 10
    
    create(x/10, y/10)
    update()
  })

  const start = this.document.getElementById("startButton");
  start.onclick = unpause

  const stop = this.document.getElementById("pauseButton");
  stop.onclick = pause

}