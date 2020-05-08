class AMSynth {
    constructor() {
        this.output = new Tone.AMSynth().toMaster()
    }

    noteon(key, v) {
        this.output.triggerAttack(key, "+0", v)
    }

    noteoff() {
        this.output.triggerRelease()
    }

}

export default AMSynth
