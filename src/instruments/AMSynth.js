class AMSynth {

    constructor(o) {
        
        
        this.output =  new Tone.PolySynth(4, Tone.MonoSynth, {
			"oscillator" : {
				"type" : "fm"
			},
			"envelope" : {
				"attack" : 0.01,
				"decay" : 0.1,
				"sustain" : 0.4,
				"release" : 2.,
			},
			"filterEnvelope" : {
				"attack" : 0.001,
				"decay" : 0.7,
				"sustain" : 0.1,
				"release" : 0.8,
				"baseFrequency" : 300,
				"octaves" : 4
			}
		})

    
        
    }
    noteon(key, v) {
        this.output.triggerAttack(key, "+0", v)
    }

    noteoff() {
        this.output.triggerRelease()
    }

}

export default AMSynth
