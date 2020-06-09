import {loadBuffer,round2,copyBufferWithDuration } from '../utils/utils.js'
function twosf(o) {
    for(var i in o ) {
        o[i] = Math.floor(o[i]*10)/10
    }
    return o
}

const Props = ["id", 
    "row" , "column", "loopLength", "url", "playing", "recording", "trimStart", "offset", 
    "loop", "gain", "subgain"]

class Loop {
    constructor(o, project) {
        this.project = project
        
        this.context = project.context
        
        // set defaults
        this.loop = true
        this.trimStart = 0
        this.offset = 0

        this.output = this.context.createGain()
        this.project.connect(this.output, "mainmix")

        this.suboutput = this.context.createGain()
        this.output.connect(this.suboutput)

        this.project.connect(this.suboutput, "submix")
        
        this.set(o)
    }


    set(o) {
        

        for(var key in o) {
            this[key] = o[key]
        }       

        if('gain' in o) {        
            this.output.gain.value = this.gain
        }              

        if('subgain' in o) {
            this.suboutput.gain.value = this.subgain
        }
        
        if('url' in o) {
            this.ready = loadBuffer(this.url, this.context).then(buffer => {

                this.originalSourceDuration = buffer.duration
    
                if(this.loopLength == null) {
                    this.loopLength = Math.max(1, round2(buffer.duration))
                }
                
                if(this.loopLength +this.trimStart > buffer.duration) {
                    buffer = copyBufferWithDuration(buffer, this.loopLength+this.trimStart)
                }
                
                this.buffer = buffer

                if(this.playing) {
                    const startOffset = this.project.calcStartOffset(this)
                    this.start(startOffset)
                }
                
            })
        }

        if(o.buffer) {
            if(this.loopLength +this.trimStart > this.buffer.duration) {
                this.buffer = copyBufferWithDuration(this.buffer, this.loopLength+this.trimStart)
            }
            this.ready = Promise.resolve(true)
        }
        
        if(o.playing) {
            const startOffset = this.project.calcStartOffset(this)
            this.start(startOffset)
        }
        
        if(o.playing == false) {
            this.stop()
        }
        
    }

    toJSON() {
        const o = {}
        
        Props.forEach(p  => {
            if(p in this)  
                o[p] = this[p]
        })

        return o
    }

    start(startOffset) {

        
        this.source = this.context.createBufferSource()
        this.source.buffer = this.buffer
        this.source.loop = this.loop
        this.source.connect(this.output)
        
        
        this.source.loopStart = this.trimStart
        this.source.loopEnd =  this.trimStart + this.loopLength 
        // console.log( this.source.loopStart, this.source.loopEnd)
        this.source.start(0, startOffset + this.trimStart)
        
        
        this.origin = Date.now()/1000 - startOffset // NOT ACTUALLY SET

        // this.playing = true
        // this.startedAt = currentTime

        console.log("loop", twosf({trimStart:this.trimStart}))

        // this.source.addEventListener('ended', () => {
        //     console.log('ended')
        // })
    }

    stop() {
        if(this.source)
            this.source.stop()
        this.playing = false
        
        
        this.origin = 0
    }

   
}

export default Loop