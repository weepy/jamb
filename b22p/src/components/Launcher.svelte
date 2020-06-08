<script>
import LoopButton from './LoopButton.svelte'
import Keyboard from '../utils/Keyboard.js'
import { uploadBlob } from '../utils/utils.js'

import {recordState, recorderLoop} from '../store.js'

export let loops


export let onselect = () => {}
export let onselectempty = () => {}
let touching = 0
export let recorder


let mode = "selecting"

function mousedown() {
    touching = true

    mode = "selecting"
    selectedLoops = []
}

function mouseup() {
    touching = false
    handleSelection()
}


function handleSelection() {
    if(mode == "selected")
        return
    
    if(selectedLoops.length) {
        if(Keyboard.pressed.s) {
            onselect("select", selectedLoops)
            mode = "selected"
            // selectedLoops = []    
        }
        else {
            onselect("launch", selectedLoops)
            selectedLoops = []
        }
        
        
    }
}





let selectedLoops = []
function selectLoop(loop) {
    if(touching && loop.url) {
        selectedLoops = selectedLoops.filter(l => loop != l)
        selectedLoops = [...selectedLoops, loop]
    }
    
    // if(touching && !loop.url && selectedLoops.length == 0 && !recorderLoop) {
    //     onselectempty(loop)
    // }

}

function onclick(loop) {
    if(loop.url == null) {
        // console.log(loop, "click")
        // onselectempty(loop)

        recorderLoop.set(loop)
        recordState.set("primed")

        // recorder.loop = loop

    }
    
}

Keyboard.events.on("keyup:s", () => {
    handleSelection()
})

</script>

<div class="launcher" tabindex="0"
    on:mousedown|preventDefault={mousedown}
	on:mouseup|preventDefault={mouseup}
    
    >
	{#each Object.values(loops) as loop}
		<LoopButton 
            selected={selectedLoops.indexOf(loop) >= 0} 
            onselect={selectLoop}
            onclick={() => onclick(loop)}
            
            loop={loop}  
            />
	{/each}
</div>

<style>

.launcher {
    position: relative;
    height: 400px;
}

</style>