function MovingAverage(length) {
    let sum = 0
    const list = []
  
    return {
      push(x) {
        sum += x
        list.push(x)
        
        if(list.length >= length) {
          sum -= list.shift()
        }
        
        return sum / length
      },
      average() {
        return sum / length
      }
    }
}

module.exports = MovingAverage  
