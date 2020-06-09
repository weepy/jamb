
class Master {
    constructor({bpm=120}) {
        
        this.bpm = bpm
        // this.origin = origin

        this.timelines = []

        this.lastTickTime = -1

        // this.synchronize()
        this.origin = 0//window.estimateServerNow()
    }

    now() {
        return this.getTick()
    }

    // synchronize() {
    //     this.origin = window.estimateServerNow()
    // }

    addTimeline(t) {
        this.timelines.push(t)
    }

    getTick() {
        const secs = (window.estimateServerNow()-this.origin)/1000
        const tickDuration = 15/this.bpm
        return secs/tickDuration
    }


    secsToNextTick() {
        const t = this.getTick()
        const nextTime = Math.ceil( t )
        const delta =  nextTime - t
        const tickDuration = 15/bpm

        return tickDuration * delta
    }

    
    update() {
        const tick = Math.floor(this.getTick())
        
        if( tick != this.lastTickTime ) {
        
            const tickDuration = 15/this.bpm

            this.timelines.forEach(timeline => {
                
                if(timeline.playing) {
                    timeline.playNotesForTick(tick, tickDuration)
                }

                
            })
            
            this.lastTickTime = tick
        }
        
    }
}


export default Master