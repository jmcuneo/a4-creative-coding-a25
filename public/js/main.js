const cellSize = 10;
paused = true
alivecolor = ''
deadcolor = '#000000'
speed = 500

const board = []
  for (let i = 0; i < 100; i++){
    board[i] = []
    for (let j = 0; j < 100; j++) {
      board[i][j] = false;
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

  const data = {
    Board: board
  }

  fetch( '/go', {
    method:"POST",
      headers: { 'Content-Type': 'application/json' },
      body:JSON.stringify(data)
  }).then(function(response) {return response.json();}).then(function(json) {

      let row = -1
      json.forEach( item => {
        row++
        for(let j = 0; j < 100; j++){
          board[row][j] = item[j]
        }
      })
      update()
    }
  )

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