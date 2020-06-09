<script>
import BaseEntity from './shared/BaseEntity.js'
import Networker from './Networker.js'
import Project from './shared/Project.js'
import ClientFactory from './ClientFactory.js'
import Keyboard from './Keyboard.svelte'



Tone.context.lookAhead=0.0
Tone.context.latencyHint='fastest'

let project

const sendCreate = (data) => {
	const type = data.type
	data.id = Math.random().toString(36).slice(2,4)
	networker.emit("create", data)
}


const networker = new Networker()

networker.on("set", (data) => {
	const type = data.type
	const table = project[type+'s']
	const index = table.findIndex(x => x.id == data.id)
	table[index].set(data)
	project[type+'s'] = table
})


networker.on("create", (data) => {

	project.create(data)

	project[type+'s'] = project[type+'s']

})

networker.on("destroy", (data) => {
	project.destroy(data)
	project[type+'s'] = project[type+'s']

	
})


networker.on("noteon", ([channel, key, velocity]) => {
	const instr = project.instruments.find(i=>i.channel==channel)
	
	
	if(!localStorage.mute)
		instr.noteon({key, velocity})	
})

networker.on("noteoff", ([channel, key, velocity]) => {
	const instr = project.instruments.find(i=>i.channel==channel)
	if(!localStorage.mute)
		instr.noteoff({key})
})

function clickTimeline(timeline) {
	const {id, type} = timeline;
	
	if(timeline.playing) {
		networker.emit("destroy", { id, type })			
	}
	else {
		networker.emit("set", { id,  type, playing:!timeline.playing  })
	}

}

function togglePlaying(timeline) {
	const {id, type} = timeline;
	networker.emit("set", { id, type, playing:!timeline.playing })
}

function loadProject(pid) {

	networker.emit('loadproject', pid, (data) => {
		project = new Project(data, ClientFactory)
		window.project = project
	})
}



function clickInstrument(i) {
	sendCreate({type:"timeline", iid: i.id})
}

loadProject()

let rows = 4
let cols = 4
let cells = []
for(var i=0;i<rows*cols;i++) {
	cells[i] = {channel: i%cols, row: Math.floor(i/cols)}
}


function gridpos(c) {
	return `left: ${c.channel*15}vw; top: ${(c.row||0)*15}vw;`
}

let currentUserId = null
let currentSelection
let currentInstrument
let globalSelected = []

networker.on("select", (oid, type, uid) => {
	const s = globalSelected.filter(s => s.uid != uid)
	
	globalSelected = [...s, {uid, oid, type}]

	project = project
})

function select(obj) {
	if(!currentUserId)
		return
	
	currentSelection = obj
	
	currentInstrument = currentSelection.type == 'instrument' ? currentSelection : null
	networker.emit("select", obj.id, obj.type, currentUserId)
}


function userColor(str) {
	var hash = 0;
    for (var i = 0; i < str.length; i++) {
       hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

	const hue = (hash*125)%360
	
	return `hsl(${hue}, 100%, 80%)`
}


function selectedStyle(obj) {

	const s = globalSelected.filter(x => x.oid == obj.id)
	if(s.length == 0) return ''

	const styles = s.map((s, index) => {
		const col = userColor(s.uid)
		return `0 0 0 ${index+1}vw ${col}`
	})

	return `box-shadow:` + styles.join(',') +";"
	
}

function getCellStyle(obj) {
	return selectedStyle(obj) + gridpos(obj)	
}


function noteon(key, velocity=0.7) {
	if(currentInstrument) {
		networker.emit("noteon", [currentInstrument.channel, key, velocity])
		
	}
}

function noteoff(key) {
	if(currentInstrument) {
		networker.emit("noteoff", [currentInstrument.channel, key])
	}
}
</script>



{#if project }
<h1>Project {project.id}!</h1>


<div class="grid">

	{#each cells as x} 
		<div class="cell" style={getCellStyle(x)}> + </div>
	{/each}

	{#each project.instruments as x}

		<div 
			class="instrument" 
			style={getCellStyle(x)} 
			on:click={() => select(x)}
			>
			{x.channel}
		</div>

	{/each}


	{#each project.timelines as x}

		<div 
			class="timeline" 
			style={getCellStyle(x)}
			on:click={() => select(x)}
			>
		
			{x.id}
		</div>

	{/each}
</div>

<div class=users>
	{#each project.users as user}
		<div class=user 
			on:click={() => currentUserId = user.id}
			style="color: {userColor(user.id)}"
			
		>{user.nick}{user.id == currentUserId ? " <":""}</div>
	{/each}
</div>

{#if currentSelection}
	<div class="context">
		<h2>{currentSelection.type} #{currentSelection.id}</h2>
	</div>
{/if}

<Keyboard onnoteon={noteon} onnoteoff={noteoff} />


{:else} 
<button on:click={() => loadProject()}>Load Project</button>
{/if}

<style>

.grid {
	position: relative;
	width: 50vw;
	height: 60vw;
	cursor: pointer;
}

.cell, .instrument, .timeline {
	border-radius: 50%;
	
}
.context {
	    position: absolute;
    top: 0;
    right: 0;
    border: 1px solid black;
    width: 30vw;
    height: 60vh;
    padding: 5px;
}
.user {
	font-weight: bold;
	cursor: pointer;
}

.currentUser {
	
}

.grid > div {
	position: absolute;
	width: 10vw;
	height: 10vw;
	border: 1px solid #aaa;
	background: white;
	text-align: center;
}


.grid .instrument {
	background: #aaf;
}

.grid .timeline {
	background: #afa;
}


</style>