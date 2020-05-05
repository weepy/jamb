<script>
import {onMount} from 'svelte'

let smoothedPingTime = 30
export let socket
export let onchange = () => { }

onMount(() => {
    const timer = setInterval(() => {
        
        if(socket.connected) {

            socket.emit('_ping', Date.now(), (date) => {	
                const pingTime = Date.now() - date
                smoothedPingTime = (smoothedPingTime)*0.7 + pingTime*0.3
                onchange(smoothedPingTime)
            })
        }

    }, 200);

    return () => {
        clearInterval(timer)
    }
})


</script>

<div>Latency: {Math.floor(smoothedPingTime)}ms</div>

<style>
div {
    background:black;
    color: white;
    display: block;
    top: 0;
    right: 0;
    position: fixed;

}
</style>