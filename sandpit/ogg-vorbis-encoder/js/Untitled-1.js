
// OggVorbisEncoderConfig.TOTAL_MEMORY




// save/delete recording
function saveRecording(blob) {
    var time = new Date(),
        url = URL.createObjectURL(blob),
        html = "<p recording='" + url + "'>" +
               "<audio controls src='" + url + "'></audio> " +
               time +
               " <a class='btn btn-default' href='" + url +
                    "' download='recording.wav'>" +
               "Save...</a> " +
               "<button class='btn btn-danger' recording='" +
                        url + "'>Delete</button>" +
               "</p>";
    $recordingList.prepend($(html));
  }
  
  
  
  
  function getAudioBufferFromFile(file) {
      
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const data = e.target.result
            const context = new (window.AudioContext || window.webkitAudioContext)();
            context.decodeAudioData(data, (buffer) => {
                resolve(buffer)
            })
        }
        reader.readAsArrayBuffer(file)
    })
  
  }
  
  var worker = new Worker('js/EncoderWorker.js'),
  
  
  
  
  function convertBufferToOgg(inputBuffer, {sampleRate, numChannels, quality}) {
  
      return new Promise((resolve) => {
        worker.onmessage = (e) => { 
          resolve(e.data.blob) 
        }
  
        worker.postMessage({ command: 'start', process: 'separate' })
    
        var buffers = sliceBuffers([
            inputBuffer.getChannelData(0),
            inputBuffer.getChannelData(1),
          ], 1024);
    
        buffers.forEach(buf => {
          worker.postMessage({ command: 'record', buffers: buf })
        })
  
        worker.postMessage({ command: 'finish'  })
      
      })
  
  }
  
  function sliceBuffers(buffers, pageSize) {
    
    const buf = []
    for(var i=0; i<buffers[0].length;i+=pageSize) {
        const b = [
            buffers[0].slice(i, i+pageSize),
            buffers[1].slice(i, i+pageSize)
        ]
    
        if(b[0].length < pageSize) {
            break
        }
    
        buf.push(b)
    }
  
    return buf
  }
  
  const file = document.querySelector('#audiofile').files[0]
  const inputBuffer = await getAudioBufferFromFile(file)
  const blob = await convertBufferToOgg(inputBuffer)
  