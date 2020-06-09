function Filter(type, f, q, sampleRate) {
    
    const o = 2*Math.PI* f / sampleRate;
    
    const s = Math.sin(o)
    const c = Math.cos(o)

    const a = s/(2*q)
    const a0 = 1./(1. + a)
    
    const a1 = (-2. * c) * a0
    const a2 = (1. - a) * a0


    let b0, b1, b2
    

    if(type=="lowpass") {
        b0 = ((1. - c)/2) * a0
        b1 = (1. - c) * a0
        b2 = ((1. - c)/2) * a0
    }
    else if(type=="highpass") {
        b0 = ((1. + c)/2) * a0
        b1 = (-1. - c) * a0
        b2 = ((1. + c)/2) * a0
    }
    
    
    let x1 = 0
    let x2 = 0
    let y2 = 0
    let y1 = 0

    return function(samples) {
        
        for(let i=0; i<samples.length;i++) {
            const input = samples[i]
            const output = b0*input + b1*x1 + b2*x2 - a1*y1 - a2*y2
            x2 = x1
            x1 = input
            y2 = y1
            y1 = output
            samples[i] = output

        }
    }
}

module.exports = Filter

     