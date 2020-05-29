<script>
export let loop
export let onclick = () => {}

function click() {
	onclick(loop)
}
	
$: name = loop.name || "loop"
$: playing = loop.playing
</script>
<button class:playing on:click={click}>{name}</button>

<style>

	.playing {
		font-weight: bold;
	}
</style>