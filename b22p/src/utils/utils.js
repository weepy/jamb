import axios from 'axios'
import WavEncoder from '../utils/WavEncoder.js'

function uuid(N) {
    const s = []
    for(var i =0; i<N;i++) {
        s[i] = Math.random().toString(36)[2]
    }
    return s.join("")
}

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


function AudioBufferFromBufferList(buffers) {


    const sampleRate = 44100
    const numberOfChannels = 2
    let length = 0

    for (let i = 0; i < buffers.length; i++) {
        length += buffers[i].length
    }

    const out = new AudioBuffer({length, numberOfChannels, sampleRate })

    let offset = 0
    for (let i = 0; i < buffers.length; i++) {
        
    
        const b = buffers[i]
        
        out.copyToChannel(b[0], 0, offset)
        out.copyToChannel(b[1], 1, offset)

        offset += b.length
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
                const processor = context.createScriptProcessor(1024, 2, 2)
                
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
                const processor = context.createScriptProcessor(1024, 2,2)
                
                // const encoder = new WavEncoder(44100, 2)    
                // const encoder = new OggVorbisEncoder(44100, 2, 0.9)

                source.connect(processor)
                processor.connect(context.destination)
    
                processor.onaudioprocess = function(e) {
                    const db = rmsBuffer(e.inputBuffer, 10)
                    meteringCallback(db)

                    audioChunks.push([
                        e.inputBuffer.getChannelData(0).slice(),
                        e.inputBuffer.getChannelData(1).slice()
                    ])


                    // const b = [e.inputBuffer.getChannelData(0),e.inputBuffer.getChannelData(1)]
                    // encoder.encode(b)
                    // audioChunks.push()
                }


                const stop = () => {

                    return new Promise(resolve => {
                        

                        // audioChunks.forEach( b => encoder.encode(b))
                        
                        // const audioBuffer 
                        // const blob = encoder.finish()
                        
                        const buffer = AudioBufferFromBufferList(audioChinks)
                        context.close()


                        resolve({ buffer })
                     
                    })
                }

                const start = () => Promise.resolve()

                resolve({ start, stop })
            })
    })  
}

// let recordAudio = recordAudio1


function uploadBlob({blob, projectId, filename}, uploadProgress=(x)=>{ console.log(x)}) {
    var data = new FormData()
	data.append('audioFile', blob, filename)

	const re = /(?:\.([^.]+))?$/;
    data.append('ext', re.exec(filename)[1])
    
    data.append('projectId', projectId)

    return axios({
		url: '/upload', 
		method: 'post',
		data: data,
		onUploadProgress: function(e) {
			uploadProgress(Math.min(99, Math.floor(e.loaded / e.total * 100)))
		}
	})
	.then((e) => {
        uploadProgress(100)
        return e.data.filename
	})
	.catch(e => {

		alert(e.toString())
	})
}

export {
    round2,
    copyBufferWithDuration,
    barLength2,
    loadBuffer,
    recordAudio1,
    recordAudio2,
    monitorLevels,
    uploadBlob,
    uuid
}