//Notes that can be played
const notes = [];
//current octave
let currentOctave = 0;

window.onload = () => {
    //the minimum and maximum notes
    const minNote = 24;
    const maxNote = 60;
    //the frequency of middle c
    const baseFrequency = 256;
    //keyboard keys that are pressed down
    const downKeys = []
    //Keyboard keys that map to keys on the piano
    const keyMap = ['`','1','2','3','4','5','6','7','8','9','0','-','=','q','w','e','r','t','y','u','i','o','p','[',']','\\','a','s','d','f','g','h','j','k','l',';','\''];


    const volume = document.getElementById('volume');
    if(volume){
        console.log(volume);
        volume.addEventListener('change',(v)=>{
            //calculates the new percent of the volume
            const newPercent = v.target.value/100;
            notes.forEach((note)=>{
                note.changeVolume(newPercent);
            })
        });
    }


    for(let i = -12; i+12 < Object.keys(keyMap).length; i++) {
        //calculates the frequencies of the tones; using the following equation
        // Half steps from note = baseFrequency * 2^(n/12)
        const frequency = baseFrequency *(Math.pow(2,i/12));
        const note = new Note(frequency);
        //console.log(frequency, note.frequency);
        notes.push(note);
    }


    const piano = new Nexus.Piano('#piano',{
        'mode': 'button',
        'lowNote':minNote,
        'highNote':maxNote,
    })

    piano.on('change', (v)=>{
        const state = v.state
        const note = v.note
        if(state){
            notes[note-minNote].play();
        }
        else{
            notes[note-minNote].stop();
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

class Note{
    static audioCtx = new AudioContext();

    constructor(frequency){
        this.frequency = frequency;
        this.osc = null;
        this.gainNode = Note.audioCtx.createGain();
        this.gainNode.connect(Note.audioCtx.destination);
    }
    //plays the given frequency
    play(){
        if(!this.osc){
            // console.log(this.frequency);
            this.osc = Note.audioCtx.createOscillator();
            this.osc.frequency.value = this.frequency;
            this.osc.type='square'
            this.osc.connect(this.gainNode);
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
    downOctave(numOctaves){
        this.frequency/=(2*numOctaves);
        if(this.osc){
            this.stop();
            this.play();
        }
    }
    //makes the note numOctaves octave higher
    upOctave(numOctaves){
        this.frequency*=(2*numOctaves);
        if(this.osc){
            this.stop();
            this.play();
        }
    }
    //changes the volume
    changeVolume(newVolume){
        this.gainNode.gain.value = newVolume;
    }

}

//Raises or lowers the octave depending on the current and new octaves
const changeOctave = (newOctave) => {

    let diff = newOctave - currentOctave;
    console.log(diff);
    if(diff<0){
        diff *= -1;
        notes.forEach(note => {
            note.downOctave(diff)
        })
    }
    else{
        notes.forEach(note => {
            note.upOctave(diff)
        })
    }
    currentOctave = newOctave;
}

