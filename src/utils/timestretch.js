function timestretch(buffer, ratio) {

    const samples = mix(buffer)

    // maybe cache this mofo
    const slices = findslices(samples)

    const destLength = Math.floor(ratio * buffer.length)

    const destslices = slices.map(([s,len]) => [Math.floor(s*ratio), Math.floor(len*ratio)])

    const outputBuffer = [Float32Array(destLength), Float32Array(destLength)]

    if(ratio < 1) {
        let index = 0
        for(let i=0; i<slices;i++) {
    
            const [s,len] = slices[i]
            
            for(var j=0; j<len;j++) {
                let gain = j<100 ? j/100 : (j>len-100?(len-j)/100:1)

                outputBuffer[0][index+j] = buffer[0][s+j] * gain
                outputBuffer[1][index+j] = buffer[1][s+j] * gain
            }
    
            index+=len
        }
    }


}


function mix(buffer) {
    const a= buffer[0]
    const b = buffer[1]
    const ret = new Float32Array(a.length)
    for(let i=0; i<a.length;i++) {
        ret[i] = (a[i] + b[i])*0.5
    }
    return ret
}

function findslices(buffer, options) {
    const slices = [ 0, 0.1 ] /// etc
    return slices
}