<script>
	let name = 'world';
	import LoopButton from './components/LoopButton.svelte'
	import RecordButton from './components/RecordButton.svelte'
	
	// import Loop from './entities/Loop.js'
	// import LoopController from './entities/LoopController.js'
	import AudioInputSelector from './components/AudioInputSelector.svelte'
	import Recorder from './entities/Recorder.js'
	import Project from './entities/Project.js'
	import Networker from './Networker.js'


	const networker = new Networker()

	let context 
	let project
	let selectedInput

	import {uploadBlob, uuid} from './utils/utils.js'


	context = new (window.AudioContext||window.webkitAudioContext)()
	context.tuna = new Tuna(context)
	
	
	
	networker.emit("open", "myProjectId", (data) => {
		project = new Project(data, context)
		window.project = project
	})

	networker.set = (obj, data) => {

		const { type } = obj

		let o
		if(type!='project') {
			o = {[type+'s']: {[obj.id]: data}}
		} 
		else {
			o = data
		}
	
		networker.emit("set", o)
	}
	
	networker.on("set", (o) => {
		project.set(o)
		project = project
	})


	async function cancelRecording() {
		const loop = recorder.loop
		recorder.state = 'stopped'
		await recorder.complete(project.bpm)
		
		networker.set( loop, {recording: false})

		project = project

	}
	async function completeRecording() {
		const { buffer, loopLength, trimStart, currentTime, sigStart, loop } = await recorder.complete(project.bpm)

		// const url = await uploadBlob({blob, projectId : "myProjectId", filename: "recording.opus"})

//		const url = URL.createObjectURL(blob)

		// console.log(url)
		const origin = project.findOrigin(currentTime)
		const offset = (sigStart - origin)%loopLength

		

		networker.set( loop, { loopLength, trimStart, offset, recording: false, playing: true })

		loop.set({buffer})

	}

	function toggleLoop(loop) {	

		
		if(loop.url) {

			networker.set(loop, {playing: !loop.playing})
			// project.set({
			// 	loops: {[loop.id]: {playing: !loop.playing}}
			// })
			
		}
		else {
			if(loop.recording) {
				if(loop.recording == 'primed') {
					cancelRecording()
				}
				else {
					completeRecording()
				}
			}
			else {
				recorder.prime(loop)
				
				networker.set(loop, {recording: 'primed'})

			}
		
		}

		project = project //.loops[loop.id] = project.loops[loop.id]
	}
	
	// let recorderState = "stopped"
	let recorder = new Recorder(context)

	let recorderLevel = 0

	recorder.onchangestate = (state) => {
		recorder.state = state
		if(recorder.state == 'recording') {
			networker.set(recorder.loop, {recording: true})
			project = project
		}
	}

	recorder.onchangelevel = (level) => {
		recorderLevel = level
	}

	async function clickRecord(command) {

		if(command == "cancel") {
			recorder.cancel()
		}
		else {
			if(recorder.state == "stopped") {
				// recorder.prime()
			}
			else {

				
				// NOW CAN SAVE LOOP
			}
		}
	
	}
</script>

{#if project} 
<div class="launcher">
	{#each Object.values(project.loops) as loop}
		<LoopButton onclick={toggleLoop} loop={loop} />
	{/each}
</div>
	<br/>
	<RecordButton state={recorder.state} level={recorderLevel} onclick={clickRecord}  />
{:else}
	<!-- <button on:click= {initAudio}>START</button> -->
{/if}

<br/>

<AudioInputSelector value={selectedInput} onselect={(d) => {
	
	recorder.device = d
}} />

<style>
.launcher {
	width: 320px;
	height:320px;
	position: relative;
}
</style>