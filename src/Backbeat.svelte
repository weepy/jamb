<script>
export let playing = false
export let bpm = 120
import { onMount } from 'svelte'
export let timeNow

let index = "None"
let origin = 0
let lastTickTime = null

import Sampler from './instruments/Sampler.js'
const drumpreset =  {
    name:"Chicago",
    samples: {

        "C3" : "kick.ogg",
        "C#3" : "kick2.ogg",
        "D3" : "hat_c.ogg",
        "D#3" : "hat_o.ogg",
        "E3" : "snare.ogg",
        "F3" : "snare2.ogg",
        "F#3" : "perc1.ogg",
        "G3" : "perc2.ogg",
        "G#3" : "tom1.ogg",
        "A3" : "tom2.ogg",
        "A#3" : "crash.ogg",
        // "B3" : "ride.ogg",
        
    }, 
    options: {
        "release" : 1,
        "baseUrl" : "./audio/drm/chicago/"
    }
}

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

    start(origin) {
        this.origin = origin||this.origin||0
    }
    
    stop() {
        this.origin = null
    }

    findNotes(tickTime) {
        return this.notes.filter( n => {
            return mod(tickTime - this.origin, this.loopLength) == n.time
        })
    }

 
}

const sampler = new Sampler()


onMount(() => {
    
    sampler.load(drumpreset)
    
})

import score from './score.js'

const timeline = new Timeline()


    
const BackBeats = {
    "2Step": "0 . 2 . 4 . 2 . 2 . 0 . 4 . 2 . ",
    "Metronome": "3 . . . 2 . . . 2 . . . 2 . . . ",
    "Houz": "0 . 2 . "
}

$: {
    
    if(index != "None") {
        timeline.setScore( score(BackBeats[index], 'c3')  )
        timeline.start() 
    }
    else {
        timeline.stop()
    }
}


const master = {
    tick() {
        const tickDuration = 15/bpm
        const secs = (window.estimateServerNow()-origin)/1000
        return secs/tickDuration
    },

    secsToNextTick() {
        const t = this.tick()
        const nextTime = Math.ceil( t )
        const delta =  nextTime - t
        const tickDuration = 15/bpm

        return tickDuration * delta
    }
}

window.master = master


setInterval(() => {
    
    const tick = Math.floor(master.tick())

    if( tick != lastTickTime) {
        
        const tickDuration = 15/bpm
        
        if(timeline.origin != null) {
            const notes = timeline.findNotes(tick)
            notes.forEach(n => {
                const duration = tickDuration * n.length
                sampler.noteplay({key: n.key, velocity: n.velocity*0.8, duration})
            })
        }
        
        lastTickTime = tick
    }
}, 16) 


</script>



<div>
<p>Beatbat</p>

<select bind:value={index}>
    <option>None</option>
    <option>Metronome</option>
    <option>2Step</option>
    <option>Houz</option>
</select>

</div>