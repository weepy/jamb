import { writable } from 'svelte/store'
import preload from './preload.js'


class Sampler {
    constructor() {
        this.type = "Sampler"
        this.loading = writable(false)
        this.preset = { name: "" }
    }

    connect( downstream ) {
        this.downstream = downstream
        if(this.gen)
            this.gen.connect(downstream)
    }

    async load(preset) {
        
        this.loading.set(true)

        this.preset = preset

        const samples = Object.values(preset.samples).map(p => preset.options.baseUrl+p)
        this.ready = preload(samples)
        await this.ready
        this.loading.set(false)
        
        
        if(this.gen) {
            this.gen.disconnect()
            this.gen.dispose()
        }

        this.gen = new Tone.Sampler(preset.samples, preset.options)
        this.gen.toMaster()
        
        if(this.downstream)
            this.connect(this.downstream)

    }

    noteon({key, velocity}) {
        // const s = window.master.secsToNextTick()
        this.gen.triggerAttack(key, "+0", velocity)
    }

    noteoff({key}) {
        this.gen.triggerRelease(key)
    }

    noteplay({key, velocity=0.7, duration}) {
        this.gen.triggerAttackRelease(key, duration, "+0" , velocity)
    }
}



export default Sampler