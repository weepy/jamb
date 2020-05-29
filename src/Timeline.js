
function mod(a, n) {
    return ((a%n)+n)%n;
}

class Timeline {
    constructor() {
        this.notes = []
        this.loopLength = 0
    }
    
    setScore({notes, loopLength}) {
        this.notes = notes
        this.loopLength = loopLength
    }

    start(origin=this.origin) {
        this.origin = origin||this.origin||0
        this.playing = true
    }
    
    stop() {
        // this.origin = null
        this.playing = false
    }

    findNotes(tickTime) {
        return this.notes.filter( n => {
            return mod(tickTime - this.origin, this.loopLength) == mod(Math.floor(n.time), this.loopLength)
        })
    }


    playNotesForTick(tick, tickDuration) {
        const notes = this.findNotes(tick)
        notes.forEach(n => {
            const duration = tickDuration * n.length
            this.instrument.noteplay({key: n.key, velocity: n.velocity, duration})
        })
    }
 
}

module.exports = Timeline