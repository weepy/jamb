<script>

// import Soundfont from 'soundfont-player'
import io from 'socket.io-client'

import Chat from './Chat.svelte'
import PingTime from './PingTime.svelte'
import {onMount} from 'svelte'

import UserAvatar from './UserAvatar.svelte'

let instrumentTypes = [
	{text:"Piano"},
	{text:"AMSynth"},
	{text:"Drum505"},
	{text:"None"}
]

let instrumentType = "AMSynth"


let started = false 

let ac
let sf
// let instr
// let player
let nick


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
				userPlayKey({key, velocity: 0.7})
			}
		}


		
	})

	document.body.addEventListener('keyup', e => {
		const ch =  String.fromCharCode(e.keyCode)

		delete keysPressed[ch]

		const key = getKeyFromChar(ch)


		if(key) {
			userStopKey({key})
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


let pingTime = 0

/////// PING
// $: console.log(pingTime)



socket.on('keyon', ({key, channel_id, velocity}) => {
	// console.log("took", Date.now() - window.keyonat)
	if(!localStorage.nolocalSend && channel_id == thisUser.channel_id) {
		return
	}
	instruments[channel_id].noteon(key, velocity)
	
})




socket.on('keyoff', ({key, channel_id}) => {
	if(!localStorage.nolocalSend && channel_id == thisUser.channel_id) {
		return
	}

	instruments[channel_id].noteoff(key)
})

function mockdelay() {
	const d = parseFloat(localStorage.delay)||0
	const j = parseFloat(localStorage.jitter)||0
	return d * (1+j*(Math.random()-0.5))
}
function userStopKey({key}) {
	

	const channel_id = thisUser.channel_id
	socket.emit('keyoff', {key, channel_id }, mockdelay())
	
	if(!localStorage.nolocalSend) {
		setTimeout(() => {
			instruments[channel_id].noteoff(key)
		}, pingTime)
	}
	

}

function userPlayKey({key, velocity}) {

	const channel_id = thisUser.channel_id
	window.keyonat = Date.now()
	socket.emit('keyon', {key, channel_id, velocity}, mockdelay())

	if(!localStorage.nolocalSend) {
		setTimeout(() => {
			instruments[channel_id].noteon(key, velocity)
		}, pingTime)
	}


}

const instruments = {}


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
				userPlayKey({key, velocity: e.velocity*0.85+0.15})
			})

			midiInput.addListener('noteoff', "all", (e) => {
				const key = e.note.name + e.note.octave
				userStopKey({key})
			})
		}

	})
}


function enter() {
	
	
	if(!nick) {
		return
	}

	Tone.start()

	
	socket.emit('enter',  (_users) => {
		users = _users

		users.forEach(u => addNewUser(u))
		
		console.log( instrumentType )
		socket.emit('join', {nick: thisUser.nick, instrumentType })
	})

	thisUser = { ...thisUser, nick} 
	
}


let users = []



var reverb = new Tone.Reverb({wet: 0.2, decay: 7}).toMaster();
reverb.generate().then(() => {
	console.log("Reverb is ready")
});

import Factory from './instruments/Factory.js'

function addNewUser(user) {
	users = users.filter(u => u != user)
	users = [...users, user]

	console.log("addingUser", user)

	const type = user.instrumentType

	if(type != null) {
		const instrument = Factory({type})
		
		instrument.output.connect(reverb)
		
		instruments[user.channel_id] = instrument		
	}


	if(user.nick == thisUser.nick) {
		thisUser.channel_id = user.channel_id
	}
}

function removeUser(user) {
	users = users.filter(u => u.nick != user.nick)
}

socket.on('join', (user) => {
	addNewUser(user)
})

socket.on('disconnected', (user) => {
	removeUser(user)
})


</script>
<div class='wrapper' on:keyup|stopPropagation on:keydown|stopPropagation>

	{#each users as user}
		<UserAvatar user={user} />
	{/each}
	
	{#if !thisUser.nick}
		<input bind:value={nick} placeholder="nick" />
		<select bind:value={instrumentType} placeholder="nick">
			{#each instrumentTypes as instrumentType}
			<option value={instrumentType.text}>
				{instrumentType.text}
			</option>
			{/each}
		</select>
		<button on:click={enter}>ENTER</button>
	{:else}
		<Chat socket={socket}/>
	{/if}




	

	<PingTime socket={socket} onchange={(s) => pingTime =s} />
</div>

<style>
.wrapper { 
	z-index: 100;
	position: fixed;
}
</style>