const start = function() {

  const button = document.getElementById("start")
  button.remove()

    const options = {
      weight: 2,
      graphColor: {r: 255, g: 255, b: 255},
      oscillatorColor: {r: 255, g: 255, b: 255},
      upsideDown: 'On',
      toggle: 'On',
      bgColor: {r: 0, g: 0, b: 0}
    }

    const pane = new Tweakpane.Pane();
    const mainVis = pane.addFolder ({
      title: 'visualizer'
    })
    const oscillator = pane.addFolder ({
      title: 'oscillator'
    })

    mainVis.addInput(options, 'weight',
      {min: 1, max: 50}
    )
    mainVis.addInput(options, 'graphColor')
    mainVis.addInput(options, 'bgColor')
    oscillator.addInput(options, 'toggle',{
      options: {
        On: 'On',
        Off: 'Off'
      }}
    )
    oscillator.addInput(options, 'oscillatorColor', {}
    )
    mainVis.addInput(options, 'upsideDown',
      {options: {
        On: 'On',
        Off: 'Off'
      }}
    )

    const userAudioSubmission = document.getElementById('audioFile')

    const visContainer = document.getElementById('visual')
    visContainer.innerHTML = ''
    const canvas = document.createElement( 'canvas' )
    visContainer.appendChild( canvas )
    canvas.width = canvas.height = 512
    const ctx = canvas.getContext( '2d' )

    // audio init
    const audioCtx = new AudioContext()
    const audioElement = document.createElement( 'audio' )
    document.body.appendChild( audioElement )

    // audio graph setup
    const analyser = audioCtx.createAnalyser()
    analyser.fftSize = 1024 // 512 bins
    const player = audioCtx.createMediaElementSource( audioElement )
    player.connect( audioCtx.destination )
    player.connect( analyser )

    // make sure, for this example, that your audiofle is accesssible
    // from your server's root directory... here we assume the file is
    // in the same location as our index.html file
    
      const inputFile = userAudioSubmission.files[0]

      if (inputFile) {
        audioElement.src = URL.createObjectURL(inputFile)
      } else {
        audioElement.src = './media/Over_The_Horizon.mp3'
      }

    audioElement.play()

    userAudioSubmission.addEventListener('change', function() {
    const inputFile = this.files[0]
    if (inputFile) {
      audioElement.src = URL.createObjectURL(inputFile)
      audioElement.load()
      audioElement.play()
    }
  })

    const freqResults = new Uint8Array( analyser.frequencyBinCount )
    const timeResults = new Uint8Array(analyser.fftSize)

    draw = function() {
      // temporal recursion, call the function in the future
      window.requestAnimationFrame( draw )
      
      // fill our canvas with a black box
      // by doing this every frame we 'clear' the canvas
      ctx.fillStyle = "rgba(" + options.bgColor.r + "," + options.bgColor.g + "," + options.bgColor.b + "," + "1)" 
      ctx.fillRect( 0,0,canvas.width,canvas.height )
      
      // set the color to white for drawing our visuaization
      ctx.fillStyle = "rgba(" + options.graphColor.r + "," + options.graphColor.g + "," + options.graphColor.b + "," + "1)"
      ctx.strokeStyle = "rgba(" + options.oscillatorColor.r + "," + options.oscillatorColor.g + "," + options.oscillatorColor.b + "," + "1)"
      
      analyser.getByteFrequencyData( freqResults )
      analyser.getByteTimeDomainData(timeResults)
      
      if (options.upsideDown == "On"){
        for( let i = 0; i < analyser.frequencyBinCount; i++ ) {
          ctx.fillRect( (i * options.weight), 0, options.weight, freqResults[i] ) // upside down!
        }
      } else {
        for( let i = 0; i < analyser.frequencyBinCount; i++ ) {
          ctx.fillRect( (i * options.weight), (canvas.height - freqResults[i]), options.weight, freqResults[i] ) // upside down!
        }
      }


      if (options.toggle == "On") {
        ctx.beginPath()
        for (let j = 0; j < timeResults.length; j++) {
          if (j === 0) {
            ctx.moveTo(((j / timeResults.length) * canvas.width), ((timeResults[j]-128) + canvas.height/2))
          } else {
            ctx.lineTo(((j / timeResults.length) * canvas.width), ((timeResults[j]-128) + canvas.height/2))
          }
          
        }
        ctx.lineTo(canvas.width, canvas.height/2)
        ctx.stroke();
      }
    }
    draw()
  }

  window.onload = ()=> document.querySelector('button').onclick = start
