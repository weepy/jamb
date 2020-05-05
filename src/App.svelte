<script>

// import Soundfont from 'soundfont-player'
import io from 'socket.io-client'

import Chat from './Chat.svelte'
import PingTime from './PingTime.svelte'


let started = false 

let ac
let sf
// let instr
// let player

let socket = io()


let nick = localStorage.nick
let thiscid

let pingTime = 0

/////// PING
// $: console.log(pingTime)



socket.on('keyon', ({key, cid}) => {

	if(cid == thiscid) {
		return
	}
	playKey({key, cid})
	
})




socket.on('keyoff', ({key, cid}) => {
	if(cid == thiscid) {
		return
	}

	playKey({key, cid})
})


function playKey({key, cid}) {
	const ch = channels[cid]
	ch.keyNodes[key] = ch.player.queueWaveTable(ac, ac.destination, ch.instr, 0, key, 10.75);
}

function stopKey({key, cid}) {
	const ch = channels[cid]

    const p = ch.keyNodes[key]
	
	if(p ) {
		p.cancel()
		delete ch.keyNodes[key]
	}
}

function userStopKey({key}) {
	socket.emit('keyoff', {key,cid: thiscid})
	setTimeout(() => {
		stopKey({key, cid: thiscid})
	}, pingTime)
}

function userPlayKey({key}) {
	socket.emit('keyon', {key,cid: thiscid})
	setTimeout(() => {
		playKey({key, cid: thiscid})
	}, pingTime)
}

const channels = {}

function loadPlayer(channel_id, preset) {
	const name = '_tone_' + preset
	const url = 'https://surikov.github.io/webaudiofontdata/sound/' + preset + '.js'

	

	const ch = channels[channel_id] = {}

	ch.player =new WebAudioFontPlayer()
	ch.preset = preset	
	ch.keyNodes = {}


	ch.player.loader.startLoad(ac, url, name)
	ch.player.loader.waitLoad(function () {
		started = true
		ch.instr = window[name]
	})
}

let midiInput
// START MIDI
{
	WebMidi.enable(function (err) {
    	console.log(WebMidi.inputs);
		console.log(WebMidi.outputs);
		
		midiInput = WebMidi.inputs[0]

		midiInput.addListener('noteon', "all", (e) => {
				userPlayKey({key:e.note.number})
			}
		)

		midiInput.addListener('noteoff', "all", (e) => {
				userStopKey({key:e.note.number})
			}
		)
	})
}


function join() {
	ac = new (window.AudioContext || window.webkitAudioContext)()
	
	if(!nick) {
		return
	}

	socket.emit('join', {nick})

	localStorage.nick = nick
	
}

const presets = [
	{file: '0000_FluidR3_GM_sf2_file', name: 'piano'},
	{file: '0250_Acoustic_Guitar_sf2_file', name: 'guitar'},
	{file:'0330_Aspirin_sf2_file', name:'drums'}

]

let users = []

socket.on('join', (user) => {
	users = [...users, user]

	console.log(user, "joined")
	loadPlayer(user.cid, presets[user.cid % presets.length].file)

	if(user.nick == nick) {
		thiscid = user.cid
	}
})

const keys = []

for(let i=50;i<74;i++) {
	keys.push(i)
}

let octave = 3
</script>

{#if !started}
<input bind:value={nick} placeholder="nick" />
<button on:click={join}>JOIN</button>
{/if}

{#if started}
{#each keys as key} 
	<button class="key" class:black={key.toString().match("#")}

		on:mousedown|preventDefault={() => userPlayKey({key:key+octave})}
		on:mouseup|preventDefault={() => userStopKey({key:key+octave})}

		on:touchstart|preventDefault={() => userPlayKey({key:key+octave})}
		on:touchend|preventDefault={() => userStopKey({key:key+octave})}
	>
		{key}
	</button>
{/each}

{/if}

<Chat socket={socket}/>

<PingTime socket={socket} onchange={(s) => pingTime =s} />

<style>

.key {
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