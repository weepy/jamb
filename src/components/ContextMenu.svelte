<script>
import { onMount } from 'svelte'
import { contextItem } from '../store.js'
import doc from '../doc.js'
import Keyboard from '../utils/Keyboard.js'

function close() {
    contextItem.set(null)
}

$: loop = $contextItem || null


function deleteLoop() {
    
    doc.set("projects."+project._id, { loops : {[loop._id]:  {stopAt:0,endAt:0,_deleted:true} }})
    close()
}

Keyboard.events.on("keyup:Escape", () => {
    close()
})

Keyboard.events.on("keyup:Backspace", () => {
    deleteLoop()
    
})

onMount(() => {
    // if(loop) {
    //     playbackRate = parseFloat(loop.playbackRate||1)
    // }
})

function change(e) {
    const value = parseFloat(e.target.value)
    const name = e.target.name

    const data = {[name]: value}

    e.target.blur()

    doc.set("projects."+project._id, { loops : {[loop._id]:  data }})

    
}


</script>


{#if $contextItem}
<div id="contextmenu" on:keypress|stopPropagation on:keyup|stopPropagation>

<ul>
<li>{loop._id}</li>
<li>offset: {loop.offset}</li>
<li>file: {loop.url.split("/").pop()}</li>
<li>loopLength: 
    <input type="text" name="loopLength" value={loop.loopLength} on:change={change} />
</li>
<li>speed: 
    <input type="text" name="playbackRate" value={loop.playbackRate||1} on:change={change} />
</li>
<li>gain: 
    <input type="range" min=0 max=2 step=0.01 name="gain" value={loop.gain||1} on:input={change} />
</li>


</ul>
<button on:click={deleteLoop}>delete</button>

<button id="close" on:click={close}>✕</button>
</div>
{/if}

<style>
#contextmenu {
    border: 1px solid black;
    left: 498px;
    top: 100px;
    position: absolute;
    width: 300px;
    height: 200px;
    padding: 5px;
    font-family: courier;
    font-size: 12px;
}

button#close {
    right: 0;
    top: 0;
    position: absolute;
    padding: 5px;
    border-radius: 50%;
}
</style>