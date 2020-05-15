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
import Keyboard from './Keyboard.svelte'


let timeNow = 0

let networker
const instruments = {}

let nick = localStorage.nick
let preset = Presets[0]

Tone.context.lookAhead=0.0
Tone.context.latencyHint='fastest'


let socket = io()

let users = {}

let thisUser = {
	nick: null,
	uid: null,
	instrument: null
}

const actions = {

	noteon(arg, uid) {
		instruments[uid].noteon(arg)	
	},

	noteoff(arg, uid) {
		instruments[uid].noteoff(arg)	
	},

	loadinstr(arg, uid) {
		instruments[uid].load(arg)	
		users = users
	},
	
	enter(_users) {

		for(var i in _users) {
			const u = _users[i]
			actions.join(u)
		}

		localStorage.nick = thisUser.nick
		networker.run('join', {nick: thisUser.nick })
	},

	join(user) {
	
		users[user.uid] = user
	
		console.log("addingUser", user)

		const instrument = Factory({type: "Sampler"})
		instrument.connect(reverb)
		instruments[user.uid] = instrument
		user.instrument = instrument
		
		
		if(user.nick == thisUser.nick) {
			thisUser.uid = user.uid
			networker.thisUser.uid = user.uid
			networker.run("loadinstr", preset )
			networker.thisUser = thisUser
		}
		else {
			if(user.instr) {
				instrument.load(user.instr)	
			}
				
		}

		users = users
		

	},


	disconnected(user, uid) {
		delete users[uid]
		users = users
	}
	
}


networker = new Networker(socket, actions, thisUser)


	


let midiInput
// START MIDI
{
	WebMidi.enable(function (err) {
    	console.log(WebMidi.inputs);
		console.log(WebMidi.outputs);
		
		WebMidi.inputs.forEach(midiInput => {
			midiInput.addListener('noteon', "all", (e) => {
				const key = e.note.name + e.note.octave
				if(thisUser.uid)
					networker.run('noteon', {key, velocity: e.velocity*0.85+0.15})
			})

			midiInput.addListener('noteoff', "all", (e) => {
				const key = e.note.name + e.note.octave
				if(thisUser.uid)
					networker.run('noteoff', {key})
			})
		})
		

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




import Backbeat from './Backbeat.svelte'


var reverb = new Tone.Reverb({wet: 0.2, decay: 7}).toMaster();
reverb.generate().then(() => {
	console.log("Reverb is ready")
});




</script>
<div class='wrapper' on:keyup|stopPropagation on:keydown|stopPropagation>

	{#each Object.values(users) as user}
		<UserAvatar user={user} />
	{/each}
	
	{#if !thisUser.nick}
		<input bind:value={nick} placeholder="nick" />

		<button on:click={enter}>ENTER</button>
	{:else}
	
		<PresetSelector presets={Presets} currentPreset={preset} onchange={(p) => {
			networker.run('loadinstr', p)
		}} />


		<Backbeat timeNow={timeNow} />

		<Chat socket={socket}/>
	{/if}

	
	<PingTime socket={socket} onchange={(_pingTime, _timeNow) =>  {
		networker.pingTime = _pingTime
		timeNow = _timeNow
	}} />

	<Keyboard onemit={(...args) => {
		if(thisUser.uid!=null) {
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