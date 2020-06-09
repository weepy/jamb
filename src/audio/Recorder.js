import {  now, audioBufferFromBufferList } from '../utils/utils.js'
import { convertBuffersListToOgg } from '../utils/oggUtils.js'

function twosf(o) {
    for(var i in o ) {
        o[i] = Math.floor(o[i]*10)/10
    }
    return o
}


const CHUNK_SIZE = 1024
const RECORD_THRESHOLD = 0.02
const RECORD_LEADIN = 0.1


function rmsBuffer(buffer, stride=1) {
    let denom = 0
    let sum = 0
    for(let ch=0; ch < buffer.numberOfChannels;ch++) {
        const data = buffer.getChannelData(ch)
        
        for(let i=0; i<data.length;i+=stride) {
            denom+=1
            let x = data[i]
            sum += x*x
        }
        
    }

    return Math.sqrt(sum/denom)
}

function recordAudio2({deviceId}, chunkSize, meteringCallback) {
    
    const constraints = { audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
        deviceId: {exact: deviceId}
    }}

    return new Promise(resolve => {
        
        navigator.mediaDevices.getUserMedia(constraints)
            .then(stream => {

                //// SETUP MONITORING
                let context = new AudioContext()
                const source = context.createMediaStreamSource(stream)
                const processor = context.createScriptProcessor(chunkSize, 2,2)
                
                
                let audioChunks = []
                source.connect(processor)
                processor.connect(context.destination)
                
                let started = false
                processor.onaudioprocess = function(e) {
                    const db = rmsBuffer(e.inputBuffer, 10)
                    
                    meteringCallback(db) 

           
                    audioChunks.push([
                        e.inputBuffer.getChannelData(0).slice(),
                        e.inputBuffer.getChannelData(1).slice()
                    ])

                }


                const stop = () => {

                    return new Promise(async resolve => {
                        
                        context.close()
                        resolve({ audioChunks })
                     
                    })
                }

                const start = () => Promise.resolve()

                resolve({ start, stop })
            })
    })  
}

class Recorder {

    constructor() {
        // this.state = "stopped"
        // this.context = context
        // this.level = 0
        this.onchangelevel=()=>{}
        // this.onchangestate=()=>{}
    }
    
    cancel() {
        // this.doneMetering()
        // this.level = 0
        // this.state = "stopped"
        // this.onchangestate(this.state)
        
        if( this.recordPromise )
            this.recordPromise.stop()

    }

    async complete() {

        
        let { audioChunks } = await this.recordPromise.stop()
        
        

        // this.doneMetering()

        // this.state = "stopped"
        // this.onchangestate(this.state)
        
        
        const recStart = this.recordStartedAt
        const sigStart = Math.max(this.recordStartedAt, this.signalStartedAt-RECORD_LEADIN)

        // remove some off ?
        const currentTime = now() //this.context.currentTime
        const duration = currentTime - sigStart
        this.recordStartedAt = null
        
        
        const trimStart = sigStart - recStart

        const chunkDuration = CHUNK_SIZE/44100
        const numchunkstoremove = Math.floor(trimStart/(chunkDuration))
        
        audioChunks = audioChunks.slice(numchunkstoremove)
        
        // const blob = await convertBuffersListToOgg(audioChunks)
        const buffer = audioBufferFromBufferList(audioChunks)
        return { buffer, trimStart: trimStart-numchunkstoremove*chunkDuration, sigStart,  duration }
  
    }
    
    async getDevice(id) {
        const devices = (await navigator.mediaDevices.enumerateDevices()).filter((d) => d.kind === 'audioinput')
        let device = devices.find(d => d.deviceId == id) || devices[0]

        return device
    }

    async prime(  ) {

        const device = await this.getDevice(localStorage.recorderDeviceId)
        
        

        // this.loop_id = loop_id
        
        // this.state = "primed"
        // this.onchangestate(this.state)


        this.primedAt = now()//this.context.currentTime
        this.signalStartedAt = null


        this.recordPromise = await recordAudio2(device||{}, CHUNK_SIZE, (p) => {
            this.onchangelevel(p)

            

            if(p > RECORD_THRESHOLD && this.signalStartedAt == null) {
                this.signalStartedAt = now()
            //     const chunkDuration = chunkSize/44100
            //     const numChunks = Math.floor(0.1/chunkDuration) // 100ms
            //     this.signalStartedAt = now() - numChunks*chunkDuration //~0.093ms
            //     return numChunks
            }
        })
        this.recordStartedAt = now()//this.context.currentTime
        this.recordPromise.start()


        
    }
    
    async record() {
        
        this.signalStartedAt = now() //this.context.currentTime
        // this.state = "recording"
        // this.onchangestate(this.state)
    }

}

export default Recorder