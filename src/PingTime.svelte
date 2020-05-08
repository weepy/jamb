<script>
import {onMount} from 'svelte'

let smoothedPingTime = 30
export let socket
export let onchange = () => { }

function mockdelay() {
	const d = parseFloat(localStorage.delay)||0
	const j = parseFloat(localStorage.jitter)||0
	return d * (1+j*(Math.random()-0.5))
}


onMount(() => {
    const timer = setInterval(() => {
        
        if(socket.connected) {

            socket.emit('_ping', Date.now(), (date) => {	
                let pingTime = Date.now() - date + mockdelay()
                
                if(pingTime > 1000) {
                    pingTime = 1000
                }
                smoothedPingTime = (smoothedPingTime)*0.8 + pingTime*0.2

                // console.log(pingTime, Math.floor(smoothedPingTime))

                onchange(smoothedPingTime)
            })
        }

    }, 1000);

    return () => {
        clearTimeout(timer)
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