const Filter = require('./filter')
const MovingAverage = require('./movingAverage')


function findMax(samples, lo, hi) {
  const max = {power: 0, time: 0}
  
  let sum = 0;
  for(let i=lo; i<hi; i++) {
    sum += samples[i]
  }
      
  const average =  (sum/(hi-lo))
  
  for(let i=lo; i<hi; i++) {
    const power = Math.abs(samples[i]) - average
    if(power > max.power ) {
      max.power = power
      max.time = i
    }
  }
  return max
}

function rms(buf, lo, hi) {
  let sum = 0;
  for(let i=lo; i<hi; i++)
      sum += buf[i]*buf[i];
  return Math.sqrt(sum/(hi-lo));
}



function getPowers(samples, chunkSize) {

  const powers = []

  for(let i=0; i<samples.length-chunkSize*2; i+=chunkSize) {
    const p = findMax(samples, i, i+chunkSize)

   // const rmsPower = rms(samples, p.time, p.time + chunkSize)
    
    powers.push({
      time: p.time/44100,
      power: p.power
    })
  }

  return powers
}

function getPeaks(powers, chunkSize) {

  const movingAverage = MovingAverage(4)

  const peaks = []
  let lastEmit = -10

  for(let i=0; i<powers.length;i++) {
    const p = powers[i]

    const smoothedPower = movingAverage.average();
    movingAverage.push(p.power)

    const timeNow = i*chunkSize/44100

    // console.log(p.power / smoothedPower)
    if(p.power / smoothedPower > 2 && (timeNow - lastEmit) > 0.1 && p.power > 0.2 ) {
        peaks.push(p)
        lastEmit = timeNow
    }
  }
  return peaks.map(p => Math.floor(p.time*44100))
 
}


module.exports = {
    getPeaks, getPowers
}