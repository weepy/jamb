import { writable } from 'svelte/store'
import preload from './utils/preload.js'
import Presets from './Presets.js'


class Sampler {
    constructor(o) {
        this.id = o.id
        this.type = o.type
        this.loading = writable(false)
        this.channel = o.channel

        this.loaded = false
        
        if(o.preset == null) {
            o.preset = Presets.find(p => p.name == "Rhodes")            
        }
        if('preset' in o) {
            this.load(o.preset)
        }


        
    }

    connect( downstream ) {
        this.downstream = downstream
        if(this.gen)
            this.gen.connect(downstream)
    }

    set(o) {
      
        if('preset' in o) {
            this.load(o.preset)
        }
        
    }

    load(preset) {
        
        this.loading.set(true)
        this.loaded = false

        this.preset = preset

        const samples = Object.values(preset.samples).map(p => preset.options.baseUrl+p)
        this.ready = preload(samples)
        
        return this.ready.then(() => {

            this.loaded = true

            this.loading.set(false)
        
        
            if(this.gen) {
                this.gen.disconnect()
                this.gen.dispose()
            }
    
            this.gen = new Tone.Sampler(preset.samples, preset.options)
            this.gen.toDestination()
            
            if(this.downstream)
                this.connect(this.downstream)
    
        })

    }

    noteon({key, velocity=0.7}) {
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