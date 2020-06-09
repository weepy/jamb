import io from 'socket.io-client'

class Networker {
    constructor() {
        this.events = {}

        this.socket = io()
    }
    
    
    // LOCAL
    localemit (event, ...args) {
        for (let i of this.events[event] || []) {
            i(...args)
        }
    }
    
    emit (event, ...args) {
        this.socket.emit(event, ...args)
    }

    localon (event, cb) {
        ;(this.events[event] = this.events[event] || []).push(cb)
        return () => (this.events[event] = this.events[event].filter(i => i !== cb))
    }

    on(event, cb) {
        this.socket.on(event, cb)
    }
}


export default Networker