<script>

// import Soundfont from 'soundfont-player'
import io from 'socket.io-client'

import Chat from './Chat.svelte'


let started = false 
let keyNodes = {}
let ac
let sf
let instr
let player

let socket = io()




socket.on('keyon', ({key}) => {
	keyNodes[key] = player.queueWaveTable(ac, ac.destination, instr, 0, key, 10.75);
	
	console.log("keyon")
})


function playKey({key}) {
	socket.emit('keyon', {key})
}

socket.on('keyoff', ({key}) => {
    const p = keyNodes[key]
	
	if(p ) {
		p.cancel()
		delete keyNodes[key]
	}
})


function stopKey({key}) {
	socket.emit('keyoff', {key})
}



function start() {

	ac = new (window.AudioContext || window.webkitAudioContext)()
  	
	player =new WebAudioFontPlayer();

	const preset = '0000_FluidR3_GM_sf2_file'
	const name = '_tone_' + preset
	const url = 'https://surikov.github.io/webaudiofontdata/sound/' + preset + '.js'
	player.loader.startLoad(ac, url, name)
	player.loader.waitLoad(function () {
		started = true
		instr = window[name]
	})
	
}

const keys = []

for(let i=50;i<74;i++) {
	keys.push(i)
}

let octave = 3
</script>

{#if !started}
<button on:click={start}>START</button>
{/if}

{#if started}
{#each keys as key} 
	<button class:black={key.toString().match("#")}
		on:mousedown={() => playKey({key:key+octave})}
		on:mouseup={() => stopKey({key:key+octave})}
	>
		{key}
	</button>
{/each}
{/if}

<Chat socket={socket}/>

<style>

button {
	height: 100px;
	display:inline-block;
}
.black {
	background : black;
	color: white;
	transform: translate(0px, -30px);
	height: 40px;
}

</style>