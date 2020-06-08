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
    
        // this.loopController = new LoopController(this)

        
        for(var key in data.loops) {
            this.loops[key] = new LoopPlayer(data.loops[key], this)
        }

        this.connect()

    }

    set(o) {

        for(var key in o.loops) {
            const val = o.loops[key]
            this.loops[key].set(val)
        }

    }


    connect() {

       
        const mainmix = this.channels.mainmix.input

        for(var i in this.channels) {

            const channel = this.channels[i]
            if(i == "mainmix") {
                channel.output.connect(this.context.destination)
            }
            else if(i == "submix") {
            //    channel.output.connect(mainmix)
            }
            else {
                channel.output.connect(mainmix)
//                channel.suboutput.connect(this.channels.submix.input)
            }

        }


        for(var i in this.loops) {
            const loop = this.loops[i]
            const channel = mainmix //this.channels[0]
            loop.output.connect(channel)
           
        }

    }
    
   

    calcStartOffset(loop) {
        
        // let currentTime = now()/1000 //this.context.currentTime

        const origin = this.project.info.origin

        return mod(now() - origin - loop.offset, loop.loopLength)

    }

    calculateOriginTime() {
        const dom = this.findDominantLoop() 
        return dom ? dom.origin : now()
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

    findOrigin( time ) {
        return this.project.info.origin

        
        let origin = time

        for(var i in this.loops) {
            const loop = this.loops[i]
            if(loop.origin > 0) {
                if (loop.origin < origin)
                    origin = loop.origin
            }

        }


        return origin
        
    }

    destroy() {
        
    }
}

export default AudioGraph