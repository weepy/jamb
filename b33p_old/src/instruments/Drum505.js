class Drum505 {
    constructor() {
        this.output = new Tone.Sampler({

            "C3" : "kick.ogg",
            "D3" : "hh.ogg",
            "E3" : "hho.ogg",
            "F3" : "snare.ogg",
            "G3" : "agogoLow.ogg",
            "A4" : "agogoHigh.ogg",
            
        }, () => {
           console.log("loaded") 
        }, {
            "release" : 1,
            "baseUrl" : "./audio/505/"
        })
    }

    noteon(key, v) {
        this.output.triggerAttack(key, "+0", v)
    }

    noteoff(key) {
        this.output.triggerRelease(key)
    }

}

export default Drum505