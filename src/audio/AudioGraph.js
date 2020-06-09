import LoopPlayer from './LoopPlayer.js'
import Channel from './Channel.js'
import { now, isPlaying } from '../utils/utils.js'

/*


startAt = 1, stopAt = 2, time = 1.5 => playing, stopping @2
startAt = 1, stopAt = 3





*/
function mod(a, n) {
    return ((a%n)+n)%n;
}

class AudioGraph {

    constructor(data, context, project) {
        
        context.tuna = new Tuna(context)    
        this.context = context
    
        this.project = project
    
        // this.mix = {}
        this.loops = {}
        this.channels = {}


        // for(var key in data.mix) {
        //     this.mix[key] = new Channel(data.mix[key], this)
        // }
    
        
        for(var key in data.channels) {
            this.channels[key] = new Channel(data.channels[key], this)
        }

        this.channels.mainmix.output.connect(this.context.destination)
        // this.channels.mainmix.output.connect(this.context.destination)
        // this.channels.submix.output.connect(this.channels.mainmix.input)
    
        // this.loopController = new LoopController(this)

        
        for(var key in data.loops) {
            // if(data.loops[key]._deleted) continue
            this.addLoop(key, data.loops[key])
            
        }

        // this.connect()

    }

    addLoop(key, data) {
        if(data._deleted) 
            return

        
        
        
        const loop = new LoopPlayer(data, this)
        this.loops[key] = loop

        loop.output.connect(this.channels.mainmix.input)
        // for(var i in this.loops) {
        //     const loop = this.loops[i]
        //     if(loop._deleted) continue
        //     const channel = mainmix 
        //     loop.output.connect(channel)
           
        // }


    }

    set(o) {

        for(var key in o.loops) {
            const val = o.loops[key]
            this.loops[key].set(val)
        }

    }

    calcStartOffset(loop) {
        
        // let currentTime = now()/1000 //this.context.currentTime

        const origin = this.project.info.origin

        return mod(now() - origin - loop.offset, loop.loopLength)

    }

    calculateOriginTime() {
        const dom = this.findDominantLoop() 
        return dom ? dom.origin : (now() ) //
    }

    findDominantLoop() {
        let dom
        let time = now()
        for(var i in this.loops) {
            
            const loop = this.loops[i]
            if(isPlaying(loop, time) && (dom == null || loop.loopLength > dom.loopLength)) {
                dom = loop
            }
        }

        return dom
    }



    destroy() {
        
    }
}

export default AudioGraph