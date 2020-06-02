import io from 'socket.io-client'

const socket = io()

const network = {
    emit (event, ...args) {
        socket.emit(event, ...args)
        console.log("emit", ...args)
    },

    on(event, cb) {
        socket.on(event, (...args) => {

            console.log("on", event, ...args)
            cb(...args)
        })
    }
}


export default network
