<script>

// import Soundfont from 'soundfont-player'
import io from 'socket.io-client'

import Chat from './Chat.svelte'
import PingTime from './PingTime.svelte'
import {onMount} from 'svelte'

let started = false 

let ac
let sf
// let instr
// let player
let nick = localStorage.nick




onMount(() => {
	//attach a listener to the keyboard events
	document.querySelector('tone-keyboard').addEventListener('noteon', e => {
		
		
		userPlayKey({key: e.detail.name, velocity: 0.7})
	})

	document.querySelector('tone-keyboard').addEventListener('noteoff', e => {
		userStopKey({key: e.detail.name})
	})

	// document.querySelector('tone-keyboard').style.display='none'

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
	console.log("took", Date.now() - window.keyonat)
	if(channel_id == thisUser.channel_id) {
		return
	}
	playKey({key, channel_id, velocity})
	
})




socket.on('keyoff', ({key, channel_id}) => {
	if(channel_id == thisUser.channel_id) {
		return
	}

	stopKey({key, channel_id})
})


function playKey({key, channel_id, velocity}) {
	const instrument = channels[channel_id]
	instrument.triggerAttack(key, "+0", velocity)
}

function stopKey({key, channel_id}) {
	const instrument = channels[channel_id]
    instrument.triggerRelease(key)
}

function userStopKey({key}) {
	const delay = parseInt(localStorage.delay)||0

	socket.emit('keyoff', {key,channel_id: thisUser.channel_id}, delay)
	if(localStorage.muted) {
		return
	}
	
	setTimeout(() => {
		stopKey({key, channel_id: thisUser.channel_id})
	}, delay+pingTime)
}

function userPlayKey({key, velocity}) {
	const delay = parseInt(localStorage.delay)||0
	window.keyonat = Date.now()
	socket.emit('keyon', {key,channel_id: thisUser.channel_id, velocity}, delay)

	if(localStorage.muted) {
		return
	}

	setTimeout(() => {
		playKey({key, channel_id: thisUser.channel_id, velocity}) // user delay?
	}, delay+pingTime)
}

const channels = {}

// function loadPlayer(channel_id, preset) {
// 	console.log("loading player", channel_id, preset)
// 	const name = '_tone_' + preset
// 	const url = 'https://surikov.github.io/webaudiofontdata/sound/' + preset + '.js'

	

// 	const ch = channels[channel_id] = {}

// 	ch.player =new WebAudioFontPlayer()
// 	ch.preset = preset	
// 	ch.keyNodes = {}


// 	ch.player.loader.startLoad(ac, url, name)
// 	ch.player.loader.waitLoad(function () {
// 		started = true
// 		ch.instr = window[name]

// 		console.log("loaded player", channel_id, preset)
// 	})
// }

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
				userPlayKey({key, velocity: e.velocity})
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

	document.querySelector('tone-keyboard').style.display = 'block'


	socket.emit('enter',  (_users) => {
		users = _users

		users.forEach(u => addNewUser(u))
			
		socket.emit('join', {nick: thisUser.nick})
	})

	thisUser = { ...thisUser, nick} 
	localStorage.nick = nick
}


let users = []


function Piano() {
	var piano = new Tone.Sampler({
		"A0" : "A0.[mp3|ogg]",
		"C1" : "C1.[mp3|ogg]",
		"D#1" : "Ds1.[mp3|ogg]",
		"F#1" : "Fs1.[mp3|ogg]",
		"A1" : "A1.[mp3|ogg]",
		"C2" : "C2.[mp3|ogg]",
		"D#2" : "Ds2.[mp3|ogg]",
		"F#2" : "Fs2.[mp3|ogg]",
		"A2" : "A2.[mp3|ogg]",
		"C3" : "C3.[mp3|ogg]",
		"D#3" : "Ds3.[mp3|ogg]",
		"F#3" : "Fs3.[mp3|ogg]",
		"A3" : "A3.[mp3|ogg]",
		"C4" : "C4.[mp3|ogg]",
		"D#4" : "Ds4.[mp3|ogg]",
		"F#4" : "Fs4.[mp3|ogg]",
		"A4" : "A4.[mp3|ogg]",
		"C5" : "C5.[mp3|ogg]",
		"D#5" : "Ds5.[mp3|ogg]",
		"F#5" : "Fs5.[mp3|ogg]",
		"A5" : "A5.[mp3|ogg]",
		"C6" : "C6.[mp3|ogg]",
		"D#6" : "Ds6.[mp3|ogg]",
		"F#6" : "Fs6.[mp3|ogg]",
		"A6" : "A6.[mp3|ogg]",
		"C7" : "C7.[mp3|ogg]",
		"D#7" : "Ds7.[mp3|ogg]",
		"F#7" : "Fs7.[mp3|ogg]",
		"A7" : "A7.[mp3|ogg]",
		"C8" : "C8.[mp3|ogg]"
	}, {
		"release" : 1,
		"baseUrl" : "./audio/salamander/"
	})
	// .toMaster();

	return piano
}


var reverb = new Tone.Reverb({wet: 0.2, decay: 7}).toMaster();
reverb.generate().then(() => {
	console.log("Reverb is ready")
});

function addNewUser(user) {
	users = users.filter(u => u != user)
	users = [...users, user]

	console.log("addingUser", user)
	
	// const synth = new Tone.AMSynth().toMaster()

	const instrument = Piano()

	instrument.connect(reverb)
	
	channels[user.channel_id] = instrument

	if(user.nick == thisUser.nick) {
		thisUser.channel_id = user.channel_id
	}
}

socket.on('join', (user) => {
	addNewUser(user)
})



</script>
<div class='wrapper' on:keyup|stopPropagation on:keydown|stopPropagation>
	{#if !thisUser.nick}
		<input bind:value={nick} placeholder="nick" />
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