<script>
export let loop
export let onclick = () => {}

function click() {
	onclick(loop)
}

$: filename = loop.url.split("/").pop()
	
$: name = loop.name || "loop"
$: playing = loop.playing
</script>
<button class:playing on:click={click}>{name}</button>
<a href={loop.url} download={filename}>&DownArrow;</a>


<style>

	.playing {
		font-weight: bold;
	}
</style>