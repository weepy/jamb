<script>
export let loop
export let onselect = () => {}
import { now, isPlaying } from '../utils/utils.js'
import { recordState, recorderLoop } from '../store.js'


// export let touching = false
// export let recordState = ''
export let selected = false
export let onclick = () => {}


// function click() {
	
// }

$: filename = loop.url ? loop.url.split("/").pop() : '-'
	
// $: name =  loop.url ? "loop" : ""
$: empty = !loop.url && !loop.buffer

$: playing = isPlaying(loop, now())
$: x = 80*loop.channel + 30
$: y = 80*loop.row + 30
// export let touched = false
// $: recording = loop.recording



function contextmenu() {
	console.log("contextmenu")
}

function mouseover() {
	onselect(loop)
}

function mousedown() {
	setTimeout(() => {
		onselect(loop)
	},0)
}

function mouseout() {
	if(store.mouseDownCount) {
		console.log("exit")
	}
}


$: className = $recorderLoop == loop ? $recordState : ""

</script>
<div 
	class:selected
	class={className}
	class:empty
	on:mouseover={mouseover}
	on:mousedown={mousedown}
	class:playing style='left:{x}px;top:{y}px' 
	on:click={onclick}
	

	>
<!-- <a href={loop.sample} download={filename}>&DownArrow;</a> -->
	
</div>



<style>
	div {
		width: 60px;
		height: 60px;
		margin: 10px;
		background: lightgray;
		border:0;
		border-radius:50%;
		position:absolute;
		border: 2px solid black;
		transform: translate(-30px, -30px);
	}
	
	.selected {
		border-color: green;
	}

	.selected.empty {
		border-color: red;
	}


	

	.empty {
		width: 20px;
		height: 20px;
		background: white;
		border-color: lightgrey;
		transform: translate(-10px, -10px);
	}
	
	.recording {
		background: red;
		border-color: black;
	}

	.primed {
		background: orange;
		border-color: black;
	}
	.playing {
		background: cyan;
	}

		
	
</style>