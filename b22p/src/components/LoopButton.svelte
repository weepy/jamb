<script>
export let loop
export let onclick = () => {}

function click() {
	onclick(loop)
}

$: filename = loop.url ? loop.url.split("/").pop() : '-'
	
$: name =  loop.url ? "loop" : ""
$: empty = !loop.url

$: playing = loop.playing
$: x = 80*loop.channel + 30
$: y = 80*loop.row + 30
let touched = false
$: recording = loop.recording

function mousedown(e) {
	touched = true
}

function mouseup(e) {
	touched = false
}

</script>
<div 
	class:touched
	class:recording={recording == true}
	class:primed={recording == 'primed'}
	class:empty
	class:playing style='left:{x}px;top:{y}px' 
	on:click={click}
	on:mousedown={mousedown}
	on:mouseup={mouseup}

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
	
	.touched {
		border-color: green;
	}

	.touched.empty {
		border-color: red;
	}


	

	.empty {
		width: 40px;
		height: 40px;
		background: white;
		transform: translate(-20px, -20px);
	}
	
	.recording {
		background: red;
	}

	.primed {
		background: orange
	}
	.playing {
		background: cyan;
	}

		
	
</style>