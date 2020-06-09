let fs = require('fs');
let wav = require('node-wav');

let buffer = fs.readFileSync('piano.wav');
let input = wav.decode(buffer);
console.log(input.sampleRate);
// console.log(result.channelData); // array of n

const  { getPowers, getPeaks } = require('./utils.js')

const length = input.channelData[0].length
const powers = getPowers(input.channelData[0], 512)
const peaks = getPeaks(powers, 512)
const slices = peaks.slice(0,-1).map( (time, index) =>  {
    return {offset: time, length: peaks[index+1]-time}
})


console.log(slices.map(s => [s.offset/44100, s.length/44100]))
const ratio = 0.8

const output = {
    sampleRate: input.sampleRate,
    channelData: [
        new Float32Array(ratio*length),
        new Float32Array(ratio*length)
    ]
}

slices.forEach(slice => {
    const outputoffset = (slice.offset * ratio)|0

    const fadein = 200

    for(var i=0; i<slice.length;i++) {
        const t = outputoffset + i
        const s = slice.offset + i
        const gain = i<fadein?i/fadein:i>(slice.length-fadein)?((slice.length-i)/fadein):1
        output.channelData[0][t] = input.channelData[0][s] * gain
        output.channelData[1][t] = input.channelData[1][s] * gain
    }


})


const audio = wav.encode(output.channelData, { sampleRate: output.sampleRate, float: true, bitDepth: 32 })
// const audio = wav.encode(input.channelData, { sampleRate: input.sampleRate, float: true, bitDepth: 32 })
fs.writeFileSync("output.wav", Buffer.from(audio))

