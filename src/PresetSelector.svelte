<script>
export let presets = []
export let currentPreset = { name: "none"}
export let onchange = () => {}

function prev(e) {
    const index = presets.findIndex(p => p.name == currentPreset.name)
    
    const nindex = (index-1+presets.length)%presets.length
    currentPreset = presets[nindex]
    onchange(currentPreset)
    e.target.blur()
}

function next(e) {
    const index = presets.findIndex(p => p.name == currentPreset.name)
    const nindex = (index+1)%presets.length
    currentPreset = presets[nindex]
    onchange(currentPreset)
    e.target.blur()
}

</script>

<div>
    <button on:click={prev}>◀</button><button on:click={next}>▶</button>
</div>