<script>
import Factory from './instruments/Factory.js'
import Presets from './instruments/Presets.js'
import PresetSelector from './PresetSelector.svelte'

// import Soundfont from 'soundfont-player'
import io from 'socket.io-client'

import Chat from './Chat.svelte'
import PingTime from './PingTime.svelte'
import {onMount} from 'svelte'

import UserAvatar from './UserAvatar.svelte'
import Networker from './Networker.js'

let networker
const instruments = {}

let started = false 


let nick = localStorage.nick
let preset = Presets[0]

Tone.context.lookAhead=0.0
Tone.context.latencyHint='fastest'

onMount(() => {

	const keys = "AWSEDFTGYHUJKOLP"
	const notes = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B","C+","C#+","D+","D#+","E+","F+"]
	let octave = 3

	function getKeyFromChar(s) {
		
		const index = keys.indexOf(s) 
		if(index == -1) {
			return null
		}
		const key = notes[index]

		if(key.slice(-1) == "+") {
			return key.slice(0,-1)+(octave+1)
		}
		return key + octave
	}


	
	let keysPressed = {}
	document.body.addEventListener('keydown', e => {		
		const ch =  String.fromCharCode(e.keyCode)
		if(keysPressed[ch] == null) {
			keysPressed[ch] = true
			const key = getKeyFromChar(ch)
			
			if(key) {
				networker.run('noteon', {key, velocity: 0.7})
				
			}
		}


		
	})

	document.body.addEventListener('keyup', e => {
		const ch =  String.fromCharCode(e.keyCode)

		delete keysPressed[ch]

		const key = getKeyFromChar(ch)


		if(key) {
			networker.run('noteoff', {key})
		}

		if(ch == "Z") {
			octave--
			if(octave < 1) octave = 1
		}
		if(ch == "X") {
			octave++
			if(octave > 5) octave = 5
		}
	})

})


let socket = io()

let thisUser = {
	nick: null,
	channel_id: null
}



const actions = {

	noteon(arg, channel_id) {
		instruments[channel_id].noteon(arg)	
	},

	noteoff(arg, channel_id) {
		instruments[channel_id].noteoff(arg)	
	},

	loadpreset(arg, channel_id) {
		instruments[channel_id].loadpreset(arg)	
	},
	
	enter(_users) {
		users = _users

		users.forEach(u => actions.join(u))

		localStorage.nick = thisUser.nick
		networker.run('join', {nick: thisUser.nick })
	},

	join(user) {
		if( users.findIndex(u => user.channel_id == u.channel_id) < 0) {
			users = [...users, user]
		}

		if(user.nick == thisUser.nick) {
			thisUser.channel_id = user.channel_id
			networker.thisUser.channel_id = user.channel_id
		}

		console.log("addingUser", user)

		const instrument = Factory({type: "Sampler"})
		instrument.connect(reverb)
		

		networker.run("loadpreset", preset )

		// instrument.load(preset)
		
		instruments[user.channel_id] = instrument		


		thisUser = { ...thisUser, instrument}
		users.find(u => u.channel_id == thisUser.channel_id).instrument = instrument

		users = users
		networker.thisUser = thisUser // OOPS
	},


	disconnected(user, channel_id) {
		users = users.filter(u => u.nick != user.nick)
	}
	
}


networker = new Networker(socket, actions, thisUser)



// networker.run("loadpreset", preset )




let midiInput
// START MIDI
{
	WebMidi.enable(function (err) {
    	console.log(WebMidi.inputs);
		console.log(WebMidi.outputs);
		
		midiInput = WebMidi.inputs[0]

		if(midiInput) {
			midiInput.addListener('noteon', "all", (e) => {
				const key = e.note.name + e.note.octave
				networker.run('noteon', {key, velocity: e.velocity*0.85+0.15})
			})

			midiInput.addListener('noteoff', "all", (e) => {
				const key = e.note.name + e.note.octave
				networker.run('noteoff', {key})
			})
		}

	})
}


function enter() {
	if(!nick) {
		return
	}

	Tone.start()

	networker.run('enter')
	thisUser.nick = nick
}


let users = []



var reverb = new Tone.Reverb({wet: 0.2, decay: 7}).toMaster();
reverb.generate().then(() => {
	console.log("Reverb is ready")
});





</script>
<div class='wrapper' on:keyup|stopPropagation on:keydown|stopPropagation>

	{#each users as user}
		<UserAvatar user={user} />
	{/each}
	
	{#if !thisUser.nick}
		<input bind:value={nick} placeholder="nick" />

		<button on:click={enter}>ENTER</button>
	{:else}
	
		<PresetSelector presets={Presets} currentPreset={preset} onchange={(p) => {
			networker.run('loadpreset', p)
		}} />

		<Chat socket={socket}/>
	{/if}


	<PingTime socket={socket} onchange={(s) => networker.pingTime =s} />
</div>

<style>
.wrapper { 
	z-index: 100;
	position: fixed;
}
</style>