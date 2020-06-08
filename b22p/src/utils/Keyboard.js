import Emitter from './Emitter.js'

const events = Emitter()

const pressed = {}

document.body.onkeyup = function(e) {
    events.emit("keyup:"+e.key)
    pressed[e.key] = false
    
    
}

document.body.onkeydown = function(e) {
    if(!pressed[e.key]) {
        pressed[e.key] = true

        events.emit("keydown:"+e.key)
    }
    
}

const Keyboard = {
    pressed, events
}
export default Keyboard
