<script>
import {onMount} from 'svelte'

let smoothedPingTime = 10
export let socket
export let smoothedServerNow = null
export let onchange = () => { }

let smooth = 0.8

let deltaWithServer= 0

function mockdelay() {
	const d = parseFloat(localStorage.delay)||0
	const j = parseFloat(localStorage.jitter)||0
	return d * (1+j*(Math.random()-0.5))
}

$: {
    // console.log("delta servetime", smoothedServerNow - lastSmooth, smoothedPingTime)
}

onMount(() => {
    const timer = setInterval(() => {
        
        if(socket.connected) {

            socket.emit('_ping', Date.now(), (date, serverNow) => {	
                let pingTime = Date.now() - date + mockdelay()
                
                

                smoothedPingTime = (smoothedPingTime)*smooth + Math.min(pingTime,200)*(1-smooth)

                
                const estimateServerNow = serverNow + pingTime/2

                if(smoothedServerNow == null) {
                    smoothedServerNow = estimateServerNow
                }
                else {
                    // smooth = 0.8
                    smoothedServerNow += 1000
                    const s = (smoothedServerNow) * smooth + estimateServerNow*(1-smooth)

                    console.log(s-smoothedServerNow, smoothedPingTime)

                    smoothedServerNow = s
                    
                    deltaWithServer = Date.now() - smoothedServerNow

                }


                onchange(smoothedPingTime, smoothedServerNow)
            })
        }

    }, 1000);

    return () => {
        clearTimeout(timer)
    }
})

window.estimateServerNow = () => {
    return Date.now() - deltaWithServer
}

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