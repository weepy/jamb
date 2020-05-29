<script>
// export let state
export let onclick = () => {}
export let state = "stopped"
export let level = 0.3

</script>
<button class={state} on:click={() => onclick()}>Record</button>

{#if  state != "stopped"}
	
	<button class="cancel" on:click={() => onclick("cancel")}>Cancel</button>
	<br/>
	<div class="monitor">
		<div style="width: {level*100}%"></div>
	</div>
	<br/>
{/if}



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
	.recording {
		color: red;
	}
	.primed {
		color: orange
	}
</style>