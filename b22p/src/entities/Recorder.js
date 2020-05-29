import { barLength2, recordAudio, monitorLevels} from '../utils.js'

function twosf(o) {
    for(var i in o ) {
        o[i] = Math.floor(o[i]*10)/10
    }
    return o
}
class Recorder {

    constructor(context) {
        this.state = "stopped"
        this.context = context
        this.level = 0
        this.onchangelevel=()=>{}
        this.onchangestate=()=>{}
    }
    
    cancel() {
        // this.doneMetering()
        this.level = 0
        this.state = "stopped"
        this.onchangestate(this.state)
        
        if( this.recordPromise )
            this.recordPromise.stop()

    }

    async complete(bpm) {

        
        const { url, blob } = await this.recordPromise.stop()

        // this.doneMetering()

        this.state = "stopped"
        this.onchangestate(this.state)
        
        
        const recStart = this.recordStartedAt
        const sigStart = Math.max(this.recordStartedAt, this.signalStartedAt-0.2)
        const currentTime = this.context.currentTime
        const duration = currentTime - sigStart
        this.recordStartedAt = null
        

        const loopLength = Math.max(1, barLength2( duration*1.125, bpm ))            
        const trimStart = sigStart - recStart//Math.floor(signalStartedAt/loopLength)*loopLength
        
        
        console.log(twosf({recStart, sigStart, currentTime, loopLength, duration, trimStart }))
        return { url, trimStart, sigStart, loopLength, currentTime, duration, loopLength  }
  
    }
    


    async prime() {
        this.state = "primed"
        this.onchangestate(this.state)


        this.primedAt = this.context.currentTime
        this.signalStartedAt = 0
        let smoothedDb = 0

        const handleMetering = (db) => {
            // this.recordLevel = db
            
            smoothedDb = (smoothedDb*0.5+0.5*db)

            if(smoothedDb > 0.05 && !this.signalStartedAt) {
                this.start()
            }
            
            this.level = smoothedDb
            this.onchangelevel(this.level)
        }

        this.recordPromise = await recordAudio(this.device||{}, handleMetering)
        this.recordStartedAt = this.context.currentTime
        this.recordPromise.start()

        
    }
    
    async start() {
        
        this.signalStartedAt = this.context.currentTime
        this.state = "recording"
        this.onchangestate(this.state)
    }

}

export default Recorder