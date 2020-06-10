<script>
let showing
export let style=""
</script>

<div style={style}>

<button on:click={()=>showing=!showing}>Help</button>
{#if showing}

<p>Click / drag to start and stop loops</p>
<p>To edit : hold Command and click</p>
<h3>Recording (Mac Only ATM)</h3>
<h4>Setup</h4>
<p>Install <a href='https://github.com/ExistentialAudio' target="__blackhole">Blackhole</a></p>
<p>Open Audio Midi Setup</p>
<p>Create a `Multi-Output Device` with `Built-in Output` at the top and `BlackHole 16ch` second</p>
<p>Pick `Blackhole 16ch Virtual` in the recorder menu in B33P</p>

<h4>Creating a new loop</h4>
<p>Click and hold in the empty space to prime a new loop</p>
<p>Start playing your instrument</p>
<p>Click done when you're at the end of your loop</p>

<h4>Sharing project</h4>
<p>Just copy and paste the link</p>

{/if}

</div>

<style>
div {
    background: #eee;
    font-size:12px;
    font-family: courier;
    padding: 5px;
    


}

button {
    float: right;
    background: pink
}


</style>