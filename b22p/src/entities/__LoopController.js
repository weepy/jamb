import Loop from './Loop.js'

function mod(n, m) {
    return ((n % m) + m) % m;
}
function twosf(o) {
    for(var i in o ) {
        o[i] = Math.floor(o[i]*10)/10
    }
    return o
}
class LoopController {
    constructor(data = [], context) {
        this.loops = []
        this.context = context
        data.map(d => this.createLoop(d))
    }

    createLoop(d) {
        const loop = new Loop(d, this.context)
        this.loops.push(loop)
        
        loop.connect(this.context.destination)
        return loop
    }
    
    toggleLoop(loop) {
        return loop.ready.then(() => {  
            
            if(loop.playing) {
                loop.stop()    
            }
            else {
                const origin = this.findOrigin()
                const currentTime = this.context.currentTime

                const { loopLength, offset } = loop
                
                const startOffset = mod(currentTime - origin - offset, loopLength)


                console.log("starting loop", twosf({ currentTime, origin,  loopLength, startOffset}))
                loop.start(startOffset)   
            }
            
	
        })
    }

    findOrigin() {
        
        let origin = null
        
        this.loops.forEach(loop => {
            if(loop.origin == 0)
                return

            if (loop.origin < origin || origin == null)
                origin = loop.origin  
        })
        
        if (origin == null )    {
            return this.context.currentTime
        }
        else {
            return origin
        }
        
    }
}

export default LoopController