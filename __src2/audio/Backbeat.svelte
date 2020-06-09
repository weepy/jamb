<script>
export let playing = false
export let bpm = 120
import { onMount } from 'svelte'
import Timeline from './Timeline.js'
import Master from './Master.js'
import Sampler from './instruments/Sampler.js'


export let master

let index = "None"
let origin = 0



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


import score from './score.js'

onMount(() => {
    

    const sampler = new Sampler()
    sampler.load(drumpreset)    

    const timeline = new Timeline()

    timeline.instrument = sampler

    const s = score("0 . 2 . 4 . 2 . 2 . 0 . 4 . 2 . ", 'c3')
    timeline.setScore( s  )
    timeline.start() 

    master.addTimeline(timeline)

})







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