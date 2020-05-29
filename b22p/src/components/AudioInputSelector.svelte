<script>
import { onMount } from 'svelte'
let devices = []

export let selectedInput
export let onselect=()=>{}

onMount(async () => {
    devices = (await navigator.mediaDevices.enumerateDevices())
    console.log(devices)
    devices = devices.filter((d) => d.kind === 'audioinput')// || d.kind == "audiooutput")
})


function change(e) {
    const d = devices[e.srcElement.value]
    selectedInput = d
    console.log(d)
    onselect(d)
}

</script>

<select on:change={change}>
{#each devices as x, index}
<option value={index}>{x.label}</option>
{/each}
</select>