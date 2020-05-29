import {loadBuffer,round2,copyBufferWithDuration } from '../utils.js'
function twosf(o) {
    for(var i in o ) {
        o[i] = Math.floor(o[i]*10)/10
    }
    return o
}
class Loop {
    constructor(o, context) {
        this.context = context
        
        
        this.url = o.url
        this.loop = true
        this.trimStart = 0
        this.offset = o.offset || 0

        this.gainNode = context.createGain()
        
        console.log(o)
        // this.load(this.url)
        this.set(o)
    }

    connect(destination) {
        this.gainNode.connect(destination)
    }

    set(o) {
        

        for(var i in o) {
            if(i == 'gain') {
                this.gainNode.gain.value = o.gain
            }              
            else {
                this[i] = o[i]
            }         
        }       
        
        if(o.url) {
            this.ready = loadBuffer(this.url, this.context).then(buffer => {

                this.originalSourceDuration = buffer.duration
    
                if(this.loopLength == null) {
                    this.loopLength = Math.max(1, round2(buffer.duration))
                }
                
                if(this.loopLength +this.trimStart> buffer.duration) {
                    buffer = copyBufferWithDuration(buffer, this.loopLength+this.trimStart)
                }
    
                this.buffer = buffer
                
            })
        }
        
    }

    load() {
        
    }


    start(startOffset) {
        this.source = this.context.createBufferSource()
        this.source.buffer = this.buffer
        this.source.loop = this.loop
        this.source.connect(this.gainNode)
        
        const currentTime = this.context.currentTime
        
        
        
        this.source.loopStart = this.trimStart
        this.source.loopEnd =  this.trimStart + this.loopLength 
        console.log( this.source.loopStart, this.source.loopEnd)
        this.source.start(0, startOffset + this.trimStart)
        this.origin = currentTime - startOffset

        this.playing = true
        // this.startedAt = currentTime

        console.log("loop", twosf({trimStart:this.trimStart}))

        // this.source.addEventListener('ended', () => {
        //     console.log('ended')
        // })
    }

    stop() {
        this.source.stop()
        this.playing = false
        this.origin = 0
    }

   
}

export default Loop