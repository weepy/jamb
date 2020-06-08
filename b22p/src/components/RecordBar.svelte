<script>
import AudioInputSelector from '../components/AudioInputSelector.svelte'
import Recorder from '../audio/Recorder.js'

import doc from '../doc.js'

import { barLength2, now, uploadBlob } from '../utils/utils.js'
import LoopPlayer from '../audio/LoopPlayer.js'
import { convertBufferToOgg } from '../utils/oggUtils.js'

import { recordState, recorderLoop } from '../store.js'

// export let state
// export let onclick = () => {}

let recorderLevel = 0 
export let project
export let graph

let loopPlayer



export let handleRecording = () => {}


let recorder = new Recorder()


$: dbRecordingLevel = Math.max(0,100 + Math.log(recorderLevel)*20)

// let state = "stopped"



$ : {

	const state = $recordState

	if(state == "primed") {
		recorder.prime()
	}
	if(state == "recording") {
		recorder.record()
	}
	if(state == "stopped") {
		if(loopPlayer) {
			loopPlayer.stop()
			loopPlayer.output.disconnect()
			loopPlayer = null
		}
	}
	
}

async function complete() {

    
    const { buffer, trimStart, sigStart, duration } = await recorder.complete()

	console.log({trimStart, sigStart, duration})

	// console.log("choose slot")

	recordState.set("stopped") 

    const loopLength = Math.max(1, barLength2( duration*1.125, project.info.bpm ))            


	const currentTime = now()

	const origin = project.info.origin ||  currentTime

    const offset = (sigStart - origin)%loopLength



	const recordingData = { loopLength, trimStart, offset, startAt: currentTime }


	handleRecording(recordingData, buffer)







	
}



async function undo() {
	await recorder.cancel()
	
	// await recorder.prime()
	recordState.set(  "primed" )
}



recorder.onchangelevel = (l) => {
	recorderLevel = l
	if($recordState == "primed" && l > 0.01) {
		
		recordState.set(  "recording" )
	} 
}



async function forceStart() {
	
	
	recordState.set( "recording")
}

function killLoopPlayer() {
	if(loopPlayer) {
		
		
		recordState.set( "stopped")

	}
}
function cancel() {
	
	if($recordState== "recording" || $recordState=="primed") {
		recorder.cancel()
	}

	if(loopPlayer) {
		
		// killLoopPlayer()
		// handleRecording()

	}
	
	recordState.set("stopped")
}



</script>

<div class={$recordState}>

{#if $recordState=="stopped"}
	
	<!-- <button on:click={prime}>Record</button> -->
	<br/>
	<AudioInputSelector 
		selectedInput={recorder.device}
		onselect={d => recorder.device = d} 
	/>

{:else if $recordState == "primed"}
	<span>Primed</span>
	<button on:click={cancel}>Cancel</button>
	<br/>
	<div class="monitor"><div style="width: {dbRecordingLevel}%"></div></div>

{:else if $recordState == "recording"}
	<span>Recording</span>
	<button on:click={complete}>Complete</button>
	<button on:click={undo}>Undo</button>
	<button on:click={cancel}>Cancel</button>
	<br/>
	<div class="monitor"><div style="width: {dbRecordingLevel}%"></div></div>

<!-- {:else if $recordState == "playing"} 
	<span>Choose slot for loop</span>
	<button on:click={cancel}>Cancel</button> -->
{/if}

</div>

<style>

.monitor {
	border: 1px solid black;
	width: 200px;
	height: 20px;
	
}
.monitor div {
	background: black;
	height: 100%;
}
.stopped {
	color: black;
}
.recording span {
	color: red;
}
.primed span {
	color: orange
}
</style>