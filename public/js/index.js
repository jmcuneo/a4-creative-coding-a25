

window.onload = () => {
    //the minimum and maximum notes
    const minNote = 24;
    const maxNote = 60;
    //the frequency of middle c
    const baseFrequency = 512;
    //Starting wave type
    const startingWaveType = 'sine';
    //Manages all the sounds
    const sound = new Sound([], 1,startingWaveType);
    //keyboard keys that are pressed down
    const downKeys = []
    //Keyboard keys that map to keys on the piano
    const keyMap = ['`','1','2','3','4','5','6','7','8','9','0','-','=','q','w','e','r','t','y','u','i','o','p','[',']','\\','a','s','d','f','g','h','j','k','l',';','\''];
    //types of waves, determines "smoothness"
    const waves = {
        0: 'sawtooth',
        1: 'square',
        2: 'triangle',
        3: 'sine',
    }
    //Sets up the notes
    for(let i = -12; i+12 < Object.keys(keyMap).length; i++) {
        //calculates the frequencies of the tones; using the following equation
        // Half steps from note = baseFrequency * 2^(n/12)
        const frequency = baseFrequency *(Math.pow(2,i/12));
        sound.notes.push(new Note(frequency, startingWaveType));
    }
    //sets event handler for volume slider
    const volume = document.getElementById('volume');
    if(volume){
        volume.addEventListener('change',(v)=>{
            //calculates the new percent of the volume
            const newPercent = v.target.value/100;
            sound.changeVolume(newPercent);
        });
    }
    //sets event handler for smoothness slider
    const smoothness = document.getElementById('smoothness');
    if(smoothness){
        smoothness.addEventListener('change',(v)=>{
            try {
                //sets new wave type (i.e. smoothness)
                console.log(v);
                sound.changeSmoothness(waves[parseInt(v.target.value, 10)]);
            } catch (e) {
                console.log(e)
            }
        });
    }
    //recalculates the frequency for the new octave
    const changeOctave = (newOctave)=>{
        sound.changeOctave(newOctave);
    }
    const lower = document.getElementById('lower');
    const middle = document.getElementById('middle');
    const upper = document.getElementById('upper');
    if(lower && middle && upper){
        lower.addEventListener('change',(v)=>{
            changeOctave(0)
        })
        middle.addEventListener('change',(v)=>{
            changeOctave(1)
        })
        upper.addEventListener('change',(v)=>{
            changeOctave(2)
        })
    }
    const piano = new Nexus.Piano('#piano',{
        'mode': 'button',
        'lowNote':minNote,
        'highNote':maxNote,
        'size':[700,200]
    })

    piano.on('change', (v)=>{
        const state = v.state
        const note = v.note
        if(state){
            sound.playNote(note-minNote);
        }
        else{
            sound.stopNote(note-minNote);
        }
        // console.log(state,note);
    })

    window.addEventListener('keydown', (v)=>{
        //the indices in the array of the pressed key
        const temp1 = downKeys.indexOf(v.key);
        const temp2 = keyMap.indexOf(v.key);
        // console.log(temp1,temp2);
        if(temp1 < 0 && temp2 >= 0) {
            // console.log(v.key);
            downKeys.push(v.key);
            // console.log(v.key, downKeys, v.key in downKeys);
            piano.toggleIndex(temp2, true);

        }
    })

    window.addEventListener('keyup', (v)=>{
        //the indices in the array of the pressed key
        const temp1 = downKeys.indexOf(v.key);
        const temp2 = keyMap.indexOf(v.key);
        if(temp1>=0 && temp2>=0) {
            downKeys.splice(temp1, 1);
            // console.log(downKeys);
            piano.toggleIndex(temp2, false);
        }

    })
}
class Sound{

    constructor(notes, currentOctave, currentWaveType) {
        this.audioCtx = new AudioContext();
        this.gainNode = this.audioCtx.createGain();
        this.gainNode.connect(this.audioCtx.destination);
        this.notes = notes;
        this.currentOctave = currentOctave;
        this.waveType = currentWaveType;
    }

    playNote(index){
        this.notes[index].play(this.audioCtx, this.gainNode);
    }

    stopNote(index){
        this.notes[index].stop();
    }
    //changes the wave type
    changeSmoothness(newType){
        this.waveType = newType;
        this.notes.forEach((note) => {
            note.changeSmoothness(this.waveType, this.audioCtx, this.gainNode);
        })
    }
    //changes the volume
    changeVolume(newVolume){
        this.gainNode.gain.value = newVolume;
    }
    //changes the octave
    changeOctave(newOctave){
        const diff = newOctave - this.currentOctave;
        console.log(diff);
        if(diff>0){
            this.notes.forEach((note) => {
                note.upOctave(diff, this.audioCtx, this.gainNode);
            })
        }
        else{
            this.notes.forEach((note) => {
                note.downOctave(-1*diff, this.audioCtx, this.gainNode);
            })
        }
        this.currentOctave = newOctave;
    }
}

//Represents a note that can be played
class Note{

    constructor(frequency, waveType){
        this.frequency = frequency;
        this.waveType = waveType;
        this.osc = null;
    }
    //plays the given frequency
    play(audioCtx, gainNode){
        if(!this.osc){
            console.log(this.frequency)
            // console.log(this.frequency);
            this.osc = audioCtx.createOscillator();
            this.osc.frequency.value = this.frequency;
            this.osc.type= this.waveType
            this.osc.connect(gainNode);
            this.osc.start();
        }
    }
    //stops playing the given frequency
    stop(){
        if(this.osc){
            this.osc.stop();
            this.osc = null;
        }
    }
    //makes the note numOctaves octave lower
    downOctave(numOctaves, audioCtx, gainNode){
        this.frequency/=(2*numOctaves);
        if(this.osc){
            this.stop();
            this.play(audioCtx, gainNode);
        }
    }
    //makes the note numOctaves octave higher
    upOctave(numOctaves, audioCtx, gainNode){
        this.frequency*=(2*numOctaves);
        if(this.osc){
            this.stop();
            this.play(audioCtx, gainNode);
        }
    }

    //changes the wave type
    changeSmoothness(newType, audioCtx, gainNode){
        //only need to stop and start since smoothness is universal among notes
        this.waveType = newType;
        if(this.osc){
            this.stop();
            this.play(audioCtx, gainNode);
        }
    }

}



/*
//Modify this for metronome code
clearInterval(id);
    id = setInterval(() => {
        try {
            let temp1 = setAxis([xPos, xVel]); //returns new x-position and x-velocity
            let temp2 = setAxis([yPos, yVel]); //returns new y-position and y-velocity
            xPos = temp1[0]; //updates x-position
            yPos = temp2[0]; //updates y-position
            xVel = temp1[1]; //updates x-velocity
            yVel = temp2[1]; //updates y-velocity
            element.style.left = xPos + "%"; //updates position of element on webpage
            element.style.top = yPos + "%"; //updates position of element on webpage
        }
        catch(err){
            console.log(err);
            clearInterval(id); //ends animation if error occurs
        }
    }, 100)

 */

