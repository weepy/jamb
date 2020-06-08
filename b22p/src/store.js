// const store = {
// 	mouseDownCount: 0,
// 	loopSelection: []
// }


// export default store

import { writable } from 'svelte/store'


const recordState = writable("stopped")
const recorderLoop = writable(null)



export {
	recordState,
	recorderLoop
}