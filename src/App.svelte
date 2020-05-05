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
let thischannel_id

let pingTime = 0

/////// PING
// $: console.log(pingTime)



socket.on('keyon', ({key, channel_id}) => {

	if(channel_id == thischannel_id) {
		return
	}
	playKey({key, channel_id})
	
})




socket.on('keyoff', ({key, channel_id}) => {
	if(channel_id == thischannel_id) {
		return
	}

	stopKey({key, channel_id})
})


function playKey({key, channel_id}) {
	const ch = channels[channel_id]
	ch.keyNodes[key] = ch.player.queueWaveTable(ac, ac.destination, ch.instr, 0, key, 10.75);
}

function stopKey({key, channel_id}) {
	const ch = channels[channel_id]

    const p = ch.keyNodes[key]
	
	if(p ) {
		p.cancel()
		delete ch.keyNodes[key]
	}
}

function userStopKey({key}) {
	socket.emit('keyoff', {key,channel_id: thischannel_id})
	if(window.muted) {
		return
	}
	
	setTimeout(() => {
		stopKey({key, channel_id: thischannel_id})
	}, pingTime)
}

function userPlayKey({key}) {
	socket.emit('keyon', {key,channel_id: thischannel_id})

	if(window.muted) {
		return
	}
	setTimeout(() => {
		playKey({key, channel_id: thischannel_id})
	}, pingTime)
}

const channels = {}

function loadPlayer(channel_id, preset) {
	console.log("loading player", channel_id, preset)
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

		console.log("loaded player", channel_id, preset)
	})
}

let midiInput
// START MIDI
{
	WebMidi.enable(function (err) {
    	console.log(WebMidi.inputs);
		console.log(WebMidi.outputs);
		
		midiInput = WebMidi.inputs[0]

		if(midiInput) {
			midiInput.addListener('noteon', "all", (e) => {
					userPlayKey({key:e.note.number})
				}
			)

			midiInput.addListener('noteoff', "all", (e) => {
					userStopKey({key:e.note.number})
				}
			)
		}

	})
}


function enter() {
	ac = new (window.AudioContext || window.webkitAudioContext)()
	
	if(!nick) {
		return
	}

	socket.emit('enter',  (_users) => {
		users = _users

		users.forEach(u => addNewUser(u))
			
		socket.emit('join', {nick})
	})

	localStorage.nick = nick
	
}

const presets = [
	{file: '0000_FluidR3_GM_sf2_file', name: 'piano'},
	{file: '0250_Acoustic_Guitar_sf2_file', name: 'guitar'}

]

let users = []



function addNewUser(user) {
	users = users.filter(u => u != user)
	users = [...users, user]

	console.log("addingUser", user)
	

	loadPlayer(user.channel_id, presets[user.channel_id % presets.length].file)

	if(user.nick == nick) {
		thischannel_id = user.channel_id
	}
}

socket.on('join', (user) => {
	addNewUser(user)
})

const keys = []

for(let i=50;i<74;i++) {
	keys.push(i)
}

let octave = 3
</script>

{#if !started}
<input bind:value={nick} placeholder="nick" />
<button on:click={enter}>ENTER</button>
{/if}

{#if started}
{#each keys as key} 
	<button class="key" class:black={key.toString().match("#")}

		on:mousedown|preventDefault={() => userPlayKey({key:key+octave})}
		on:mouseup|preventDefault={() => userStopKey({key:key+octave})}


	>
		{key}
	</button>
{/each}

<!-- <div> muted: <input type="checkbox" bind:value={muted} /> </div> -->

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