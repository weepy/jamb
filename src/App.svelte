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

import Keyboard from './Keyboard.svelte'


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
		users = users
	},
	
	enter(_users) {
		//users = _users

		_users.forEach(u => actions.join(u))

		localStorage.nick = thisUser.nick
		networker.run('join', {nick: thisUser.nick })
	},

	join(user) {
		if( users.findIndex(u => user.channel_id == u.channel_id) < 0) {
			users = [...users, user]
		}


		console.log("addingUser", user)

		const instrument = Factory({type: "Sampler"})
		instrument.connect(reverb)
		
		instruments[user.channel_id] = instrument	


		user.instrument = instrument
		if(user.nick == thisUser.nick) {
			thisUser.channel_id = user.channel_id
			networker.thisUser.channel_id = user.channel_id
			networker.run("loadpreset", preset )
			networker.thisUser = thisUser
		}

		users = users
		

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

	<Keyboard onemit={(...args) => {
		if(thisUser.channel_id!=null) {
			networker.run(...args)
		}
	}} />
</div>

<style>
.wrapper { 
	z-index: 100;
	position: fixed;
}
</style>