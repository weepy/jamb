<script>
import { onMount } from 'svelte'
let devices = []

export let selectedIndex
// export let onselect=()=>{}

onMount(async () => {
    

    const stream = await navigator.mediaDevices.getUserMedia({audio:true})

    devices = (await navigator.mediaDevices.enumerateDevices()).filter((d) => d.kind === 'audioinput')// || d.kind == "audiooutput")
    
    selectedIndex = devices.findIndex(d => d.deviceId == localStorage.recorderDeviceId) 

    if(selectedIndex < 0) 
        selectedIndex = 0

})


function change(e) {
    localStorage.recorderDeviceId = devices[e.srcElement.value].deviceId
}

</script>

<select on:change={change} value={selectedIndex}>
{#each devices as device, index}
<option value={index}>{device.label}</option>
{/each}
</select>