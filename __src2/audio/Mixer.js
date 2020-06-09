import { writable } from 'svelte/store'
import preload from './utils/preload.js'
import Presets from './Presets.js'


class Mixer {
    constructor(o) {
        this.id = o.id
        this.type = "mixer"

        this.node = Tone.Volume()        
    }

    connect( downstream ) {
        this.downstream = downstream
        if(this.node)
            this.node.connect(downstream)
    }

    set(o) {
      
        if('volume' in o) {
            this.node(o.preset)
        }
        
    }

    load(preset) {
       


        this.node = new Tone.Volume(preset.samples, preset.options)
        this.node.toDestination()
 
    }

  
}



export default Sampler