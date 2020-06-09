
function mod(a, n) {
    return ((a%n)+n)%n;
}

class Timeline {
    constructor(data) {
        this.notes = []
        this.loopLength = 0
        this.set(data)
    }
    
    set(data) {
        for(var i in data) {
            const old = this[i]
            this[i] = data[i]
            this.emit('change:'+i, data[i], old[i])
        }
    }

    // start(origin=this.origin) {
    //     this.origin = origin||this.origin||0
    //     this.playing = true
    // }
    
    // stop() {
    //     // this.origin = null
    //     this.playing = false
    // }

    findNotes(tickTime) {
        return this.notes.filter( n => {
            return mod(tickTime - this.origin, this.loopLength) == mod(Math.floor(n.time), this.loopLength)
        })
    }


    playNotesForTick(tick, tickDuration, instrument) {
        const notes = this.findNotes(tick)
        notes.forEach(n => {
            const duration = tickDuration * n.length
            
            instrument.noteplay({key: n.key, velocity: n.velocity, duration})
        })
    }
 
}

module.exports = Timeline