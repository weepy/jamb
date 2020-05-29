function copyBufferWithDuration(buf, dur) {

    const sampleRate = buf.sampleRate
    const numberOfChannels = buf.numberOfChannels
    const length = dur * sampleRate
    // const offsetIndex = buf.sampleRate*offset

    const buf2 = new AudioBuffer({length, numberOfChannels, sampleRate })
    
    for (var ch = 0; ch < numberOfChannels; ch++) {
        buf2.copyToChannel(buf.getChannelData(ch), ch, 0)
    }

    return buf2
}

function round2(x) {
    return Math.pow(2, Math.round(Math.log(x)/Math.log(2)))
}

function barLength2( secs, bpm ) {
    const secsPerBar = 240/bpm
    return round2( secs / secsPerBar ) * secsPerBar
}


const audioBuffers = {}
const loadBuffer = (url,audioCtx) => {

    if(audioBuffers[url]) {
        return Promise.resolve(audioBuffers[url])
    }

    return fetch(url)
      .then(function(response) {
        if (!response.ok) {
          throw new Error("HTTP error, status = " + response.status)
        }
        return response.arrayBuffer()
      })
      .then(function(data) {

        
        return new Promise((res, rej) => {
            audioCtx.decodeAudioData(data, (buffer) => {
                audioBuffers[url] = buffer
                res(buffer)
            }, () => {
                audioBuffers[url] = false
                rej()   
            })
        })
      })
}

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

function  linearToDecibel(linear)
{
    return linear != 0 ? 20.0 * Math.log(linear) : -144.0
}

function monitorLevels({deviceId}, meteringCallback) {
    //// SETUP MONITORING
    let context

    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {

            context = new AudioContext();
            const source = context.createMediaStreamSource(stream);
            const processor = context.createScriptProcessor(1024, 1, 1);

            source.connect(processor);
            processor.connect(context.destination);

            processor.onaudioprocess = function(e) {
                const db = rmsBuffer(e.inputBuffer, 10)
                
                meteringCallback(db)

                
            }
            
        })

    return () => {
        if(context)
            context.close()
    }
}


function concatBuffers(buffers) {

    const buf = buffers[0]
    const sampleRate = buf.sampleRate
    const numberOfChannels = buf.numberOfChannels
    let length = 0

    for (let i = 0; i < buffers.length; i++) {
        length += buffers[i].length
    }


    const out = new AudioBuffer({length, numberOfChannels, sampleRate })

    let offset = 0
    for (let i = 0; i < buffers.length; i++) {
        
    
        const buf = buffers[i]
        for (var ch = 0; ch < numberOfChannels; ch++) {
            out.copyToChannel(buf.getChannelData(ch), ch, offset)
        }

        offset += buf.length
    }

    return out
  }


function recordAudio1({deviceId}, meteringCallback) {
    

    const constraints = { audio: {
        deviceId: {exact: deviceId}
    }}

    return new Promise(resolve => {
        
        navigator.mediaDevices.getUserMedia(constraints)
            .then(stream => {

                
                //// SETUP MONITORING
                let context = new AudioContext()
                const source = context.createMediaStreamSource(stream)
                const processor = context.createScriptProcessor(1024, 1, 1)
                
                source.connect(processor)
                processor.connect(context.destination)
    
                processor.onaudioprocess = function(e) {
                    const db = rmsBuffer(e.inputBuffer, 10)
                    meteringCallback(db)
                }


                //// SETUP RECORDING
                const mediaRecorder = new MediaRecorder(stream, {
                    audioBitsPerSecond : 256000,
                    mimeType : 'audio/webm'
                })
                const audioChunks = []

                mediaRecorder.addEventListener("dataavailable", event => {    
                    audioChunks.push(event.data)
                })

                let recordStartedAt
                const start = () => {
                    mediaRecorder.start()
                }

                const stop = () => {

                    return new Promise(resolve => {

                        mediaRecorder.addEventListener("stop", () => {
                            const blob = new Blob(audioChunks)
                            const url = URL.createObjectURL(blob)
                            
                            resolve({ blob, url })
                        })

                        mediaRecorder.stop()

                        context.close()

                    })
                }

                resolve({ start, stop })
            })
    })  
}

function recordAudio2({deviceId}, meteringCallback) {
    
    const constraints = { audio: {
        deviceId: {exact: deviceId}
    }}

    return new Promise(resolve => {
      
        let audioChunks = []
        navigator.mediaDevices.getUserMedia(constraints)
            .then(stream => {

                
                //// SETUP MONITORING
                let context = new AudioContext()
                const source = context.createMediaStreamSource(stream)
                const processor = context.createScriptProcessor(1024, 1, 1)
                
                source.connect(processor)
                processor.connect(context.destination)
    
                processor.onaudioprocess = function(e) {
                    const db = rmsBuffer(e.inputBuffer, 10)
                    meteringCallback(db)
                    audioChunks.push(e.inputBuffer)
                }


                const stop = () => {

                    return new Promise(resolve => {

                     
                        const blob = new Blob(audioChunks)
                        const url = URL.createObjectURL(blob)
                        
                        context.close()


                        resolve({ blob, url })
                     
                    })
                }

                const start = () => Promise.resolve()

                resolve({ start, stop })
            })
    })  
}

let recordAudio = recordAudio1

export {
    round2,
    copyBufferWithDuration,
    barLength2,
    loadBuffer,
    recordAudio,
    monitorLevels
}