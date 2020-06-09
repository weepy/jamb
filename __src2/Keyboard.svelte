<script>
export let onnoteon= ()=>{}
export let onnoteoff= ()=>{}
export let onkey=()=>{}

import { onMount } from 'svelte'
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
				onnoteon(key)
				
			}
		}
	})

	document.body.addEventListener('keyup', e => {
		const ch =  String.fromCharCode(e.keyCode)

		delete keysPressed[ch]

		const key = getKeyFromChar(ch)
	
		if(key) {
			onnoteoff(key)
			return
		}

		if(ch == "Z") {
			octave--
			if(octave < 1) octave = 1
		}
		if(ch == "X") {
			octave++
			if(octave > 5) octave = 5
		}


		onkey(ch, e.keyCode)
	})

})
</script>