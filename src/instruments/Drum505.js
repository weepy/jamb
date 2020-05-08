class Drum505 {
    constructor() {
        this.output = new Tone.Sampler({

            "C3" : "kick.[mp3|ogg]",
            "D3" : "hh.[mp3|ogg]",
            "E3" : "hho.[mp3|ogg]",
            "F3" : "snare.[mp3|ogg]",
            "G3" : "agogoLow.[mp3|ogg]",
            "A4" : "agogoHigh.[mp3|ogg]",
            
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