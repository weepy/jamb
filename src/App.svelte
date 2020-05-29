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
import Master from './Master.js'
import Timeline from './Timeline.js'


import Backbeat from './Backbeat.svelte'


let reverb
let master



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


class UserInteractionHandler {

	constructor() {
		this.activeNotes = {}
		this.history = []

	}

	noteon({key, velocity}) {
		if(thisUser.uid==null) {
			return
		}

		networker.run('noteon', { key })


		const time = master.now()

		const note = this.activeNotes[key]
		if(note) {
			console.warn('existing note at key', key)
		}
		console.log({key, time})
		this.activeNotes[key] = {key, time, velocity }
	}

	noteoff({key}) {
		if(thisUser.uid==null) {
			return
		}
		
		const note = this.activeNotes[key]
		if(!note) {
			console.warn('no existing note at key', key)
			return
		}

		const time = master.now()
		note.length = time - note.time
		networker.run('noteoff', { key, time })

		this.history.push(note)
		delete this.activeNotes[key]
	}

	findRecentNotes(length) {

		const time = master.now()

		const recentNotes = this.history.filter((n) => {
			const age = time - n.time
			return age <= length
		}) 

		return {
			notes: recentNotes,
			loopLength: length
		}
		
		
	}
}

let userInteractions = new UserInteractionHandler()


function quantize(s, x=1) {
	s.notes.forEach(n => {
		n.time = Math.round(n.time/x)*x
	})
}

function createLoop(bars) {
	const s = userInteractions.findRecentNotes(16*bars)

	quantize(s, 1)
	console.log(s)

	if(s.notes.length == 0) {
		return
	}

	const timeline = new Timeline()

	timeline.instrument = instruments[thisUser.uid]
	
    timeline.setScore( s  )
    timeline.start() 

    master.addTimeline(timeline)
}

let midiInput
// START MIDI
{
	WebMidi.enable(function (err) {
    	console.log(WebMidi.inputs);
		console.log(WebMidi.outputs);
		
		WebMidi.inputs.forEach(midiInput => {
			midiInput.addListener('noteon', "all", (e) => {
				const key = e.note.name + e.note.octave
				
					userInteractions.noteon( {key, velocity: e.velocity*0.85+0.15})
			})

			midiInput.addListener('noteoff', "all", (e) => {
				const key = e.note.name + e.note.octave
				userInteractions.noteoff({key})
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





const round2 = (x) => Math.pow(2, Math.round(Math.log(x)/Math.log(2)))

onMount(() => {

	networker = new Networker(socket, actions, thisUser)


	reverb = new Tone.Reverb({wet: 0.2, decay: 7}).toMaster();
	reverb.generate().then(() => {
		console.log("Reverb is ready")
	});

	master = new Master({bpm:120})

	setInterval(() => {
		master.update()
	}, 16) 


})


let recordStart

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


		<Backbeat master={master} />

		<!-- <button on:click={()=>createLoop(1)}>1</button>
		<button on:click={()=>createLoop(2)}>2</button>
		<button on:click={()=>createLoop(4)}>4</button>
		<button on:click={()=>createLoop(8)}>8</button> -->
		<Chat socket={socket}/>
	{/if}

	
	<PingTime socket={socket} onchange={(_pingTime) =>  {
		networker.pingTime = _pingTime
		
	}} />

	<Keyboard onkeydown={key => {
			userInteractions.noteon({key, velocity:0.7 })
		}}

		onkeyup={key => {
			userInteractions.noteoff({key})
		}}

		onkey={ (key, code) => {
			
			if(code == 13) {
				if(recordStart) {

					const ticks = master.now() - recordStart
					const bars = Math.max(1, round2(ticks/16))
					
					createLoop(bars)
					recordStart = null


				}
				else {
					recordStart = master.now()
				}

				
			}
			else {
				console.log("unhandled key: ", key, code)
			}
		}}

	}} />

	
</div>

<style>
.wrapper { 
	z-index: 100;
	position: fixed;
}
</style>