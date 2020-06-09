


import { writable } from 'svelte/store'
import Keyboard from './utils/Keyboard.js'


const recordState = writable("stopped")
const recorderLoop = writable(null)
const contextItem = writable(null)

const metapressed = writable(false)

Keyboard.events.on("keydown:Meta", () => {
	metapressed.set(true)
})

Keyboard.events.on("keyup:Meta", () => {
	metapressed.set(false)
})

export {
	recordState,
	recorderLoop,
	contextItem,
	metapressed
}