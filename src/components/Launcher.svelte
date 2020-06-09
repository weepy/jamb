<script>
import LoopButton from './LoopButton.svelte'
import ContextMenu from './ContextMenu.svelte'
import Keyboard from '../utils/Keyboard.js'
import { uploadBlob } from '../utils/utils.js'

import {recordState, recorderLoop, contextItem} from '../store.js'

export let loops


export let onselect = () => {}
export let onselectempty = () => {}
let touching = 0
export let recorder

function newLoop({x,y}) {
    const postfix = Math.random().toString(36).slice(2,4)
    return {
        _id: Object.keys(loops).length.toString(36)+postfix,
        x,
        y
    }
}

let mode = "selecting"
let launcherElement
let longclicktimer
function mousedown(e) {
    touching = true

    mode = "selecting"
    selectedLoops = []

    const ox = e.pageX-launcherElement.offsetLeft
    const oy = e.pageY-launcherElement.offsetTop

    if((e.target.id == "launcher")) {
        
        const x = Math.floor((ox-30)/80)
        const y = Math.floor((oy-30)/80)

        for(var i in loops) {
            const loop = loops[i]
            if(!loop._deleted && x == loop.x && y == loop.y)
                return
        }

        longclicktimer = setTimeout(() => {
            console.log("longclick")

            const loop = newLoop({x,y})
            recorderLoop.set(loop)
            // const loop = newLoop()
            // recorderLoop.set(loop)
            recordState.set("primed")
        }, 100)
    }

}



function mouseup() {
    touching = false
    handleSelection()
    clearTimeout(longclicktimer)
}


function handleSelection() {
    if(mode == "selected")
        return
    
    if(selectedLoops.length) {
        if(Keyboard.pressed.Meta) {
            const loop = selectedLoops[selectedLoops.length-1]
            onselect("select", loop)
            mode = "selected"
            
            contextItem.set(loop)

            selectedLoops = []
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

// function onclick(loop, e) {
   

//     if(loop.url == null) {
     



//         // recorder.loop = loop

//     }
//     else {
//         if(Keyboard.pressed.Meta) {
//             console.log("open context ?")
//         }
//     }
    
// }

// Keyboard.events.on("keyup:s", () => {
//     handleSelection()
// })

$: visibleLoops = Object.values(loops).filter(loop => !loop._deleted)

</script>

<div id="launcher" bind:this={launcherElement} class="launcher" tabindex="0"
    on:mousedown|preventDefault={mousedown}
	on:mouseup|preventDefault={mouseup}
    
    >
	{#each visibleLoops as loop}
		<LoopButton 
            selected={selectedLoops.indexOf(loop) >= 0} 
            onselect={selectLoop}
            
            
            loop={loop}  
            />
	{/each}

    {#if $recorderLoop}
        <LoopButton loop={$recorderLoop} />
    {/if}
</div>

<ContextMenu />

<style>

.launcher {
    position: relative;
    height: 400px;
        border: 1px solid #ddd;
    border-radius: 10px;
    width:400px;
}

</style>