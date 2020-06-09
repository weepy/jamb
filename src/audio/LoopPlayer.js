import {now, isPlaying, loadBuffer,round2,copyBufferWithDuration } from '../utils/utils.js'


function twosf(o) {
    for(var i in o ) {
        o[i] = Math.floor(o[i]*10)/10
    }
    return o
}

class LoopPlayer {
    
    constructor(o, graph) {
        this.graph = graph

        // this.data = data
        this.context = graph.context
        
        // set defaults
        this.loop = true
        this.trimStart = 0
        this.offset = 0

        this.playbackRate = 1

        
        this.output = this.context.createGain()
        this.set(o)
    
        
    }

    set(o) {
        
        // const oldUrl = this.url

        for(var key in o) {
            this[key] = o[key]
        }

        if('gain' in o) {        
            this.output.gain.value = o.gain
        }

        if('url' in o) { //} && oldUrl == null) {
            // MAYBE IF WE ALREADY HAVE A BUFFER DO NOTHING
            if( !this.buffer ) {
                this.ready = loadBuffer(o.url, this.context).then(buffer => {
                    this.loadBuffer(buffer)

                    if(isPlaying(this, now()) && !this.sourcePlaying ) {
                        const startOffset = this.graph.calcStartOffset(this)
                        this.start(startOffset)
                    }
                })
            }

        }

        if('buffer' in o) {
            this.ready = Promise.resolve(true)
            this.loadBuffer(this.buffer)

        }
        
        // if(o.buffer) {
        //     if(this.loopLength +this.trimStart > this.buffer.duration) {
        //         this.buffer = copyBufferWithDuration(this.buffer, this.loopLength+this.trimStart)
        //     }
        //     this.ready = Promise.resolve(true)
        // }

        if(o.loopLength) {
            if(this.source) {
                this.source.loopEnd =  this.trimStart + this.loopLength 
            }
        }
        
        if(o.startAt) {
            if(this.isPlaying()) {
                const startOffset = this.graph.calcStartOffset(this)
                this.start(startOffset)
            }
        }
        
        if( o.endAt ) {
            if(!this.isPlaying()) {
                this.stop()
                
            }
        }

        if(o.playbackRate) {
            if(this.source) {
                this.source.playbackRate.value = this.playbackRate
            }
        }

        if(o._deleted) {
            this.stop()
            this.output.disconnect()
        }

        
    }

    isPlaying() {
        return !this._deleted && isPlaying(this, now()) 
    }

    loadBuffer(buffer) {

        

        this.originalSourceDuration = buffer.duration

        if(this.loopLength == null) {
            this.loopLength = Math.max(1, round2(buffer.duration))
        }
        
        if(this.loopLength +this.trimStart > buffer.duration) {
            buffer = copyBufferWithDuration(buffer, this.loopLength+this.trimStart)
        }
        
        this.buffer = buffer

       
        
    }
    start(startOffset) {

        if(!this.buffer || this.sourcePlaying) {
            return
        }

        this.source = this.context.createBufferSource()

        this.source.playbackRate.value = this.playbackRate;
        this.source.buffer = this.buffer
        this.source.loop = this.loop
        this.source.connect(this.output)
        
        // const currentTime = this.context.currentTime
        
        
        this.source.loopStart = this.trimStart
        this.source.loopEnd =  this.trimStart + this.loopLength 
        // console.log( this.source.loopStart, this.source.loopEnd)
        this.source.start(0, startOffset + this.trimStart)
        this.origin = now() - startOffset - this.offset

        // this.playing = true
        // this.startedAt = currentTime

        // console.log("loop", twosf({trimStart:this.trimStart}))

        // this.source.addEventListener('ended', () => {
        //     console.log('ended')
        // })

        this.sourcePlaying = true
    }

    stop() {
        if(this.source)
            this.source.stop()
        // this.playing = false
        this.origin = 0
        this.sourcePlaying = false
    }

}

export default LoopPlayer