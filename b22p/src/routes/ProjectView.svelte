<script>
import network from '../network.js'
import { onMount } from 'svelte'

export let params

$: project = params.project

$: loops = Object.values(project.loops||{})

import { mergeObjects } from '../utils/dataUtils.js'

function set(collection, _id, data) {
    network.emit("project:set", {[collection]: { [_id]: data }})
}

onMount(() => {
    network.emit("project:sub", params.project._id)

    network.on("project:set", (data) => {
        
        mergeObjects(project, data)
        project = project
    })
    
    return () => {
        network.emit("project:unsub")
    }
})

function addLoop() {
    const _id = Math.random().toString(36).slice(2,6)
    const loop = { _id, playing: false }
    set("loops", _id, loop)
}

function togglePlaying(loop) {
    const playing = !loop.playing
    set("loops", loop._id, {playing})
}


</script>

<div>

<h1>Project #{project._id}</h1>

<h2>loops #{loops.length}</h2>
{#each loops as loop}
    <div 
        class:playing={loop.playing} 
        on:click={() => togglePlaying(loop)}>loop #{loop._id} </div>
{/each}

<button on:click={addLoop}>+</button>

<a href="/projects">projects</a>
</div>

<style>
.playing {
    font-weight: bold;
}
</style>