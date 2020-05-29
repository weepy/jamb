<script>
	let name = 'world';
	import LoopButton from './components/LoopButton.svelte'
	import RecordButton from './components/RecordButton.svelte'
	
	import Loop from './entities/Loop.js'
	import LoopController from './entities/LoopController.js'
	import AudioInputSelector from './components/AudioInputSelector.svelte'
	import Recorder from './entities/Recorder.js'

	let context 
	let loopController
	let selectedInput


	const loopData =  [
        {url: "/audio/loops/Kit_Drums_MixDown1_C_120BPM.wav", gain:0.7},
        {url:  "/audio/loops/Kit_PianoHigh_C_120BPM.wav"},
        {url:  "/audio/metro.wav"},
        {url:  "/audio/loops/51_XIV 120BPM Csmin Sample.wav",gain:0.5},
	]
	

	let bpm = 120

	function initAudio() {
		context = new AudioContext()
		loopController = new LoopController(loopData, context)
	}
	initAudio()

	function toggleLoop(loop) {	

		loopController.toggleLoop(loop).then(() => {
			loopController.loops = loopController.loops
		})

		
		// loop.playing = !loop.playing
		
	}
	
	// let recorderState = "stopped"
	let recorder = new Recorder(context)

	let recorderLevel = 0

	recorder.onchangestate = (state) => {
		recorder.state = state
	}
	recorder.onchangelevel = (level) => {
		recorderLevel = level

	}

	async function clickRecord(command) {

		if(command == "cancel") {
			recorder.cancel()
			// do nothing with it
		}
		else {
			if(recorder.state == "stopped") {
				recorder.prime()
			}
			else {
				const { url, loopLength, trimStart, currentTime, sigStart } = await recorder.complete(bpm)
				const origin = loopController.findOrigin()
				const offset = (sigStart - origin)%loopLength

				const loop = loopController.createLoop({ url, loopLength, trimStart, offset })
				await loopController.toggleLoop(loop)
				loopController.loops = loopController.loops
			}
		}
	
	}
</script>

{#if context} 
	{#each loopController.loops as loop}
		<LoopButton onclick={toggleLoop} loop={loop} />
	{/each}

	<br/>
	<RecordButton state={recorder.state} level={recorderLevel} onclick={clickRecord}  />
{:else}
	<button on:click= {initAudio}>START</button>
{/if}

<br/>

<AudioInputSelector value={selectedInput} onselect={(d) => {
	
	recorder.device = d
}} />