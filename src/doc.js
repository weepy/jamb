import io from 'socket.io-client'

const socket = io()

const doc = {
    
    get (path, fn) {
        socket.emit("doc:get", path, fn)
    },

    sub(path, fn) {
        socket.emit("doc:sub", path)
        socket.on("doc "+path, fn)
    },

    unsub(path, fn) {
        socket.emit("doc:unsub", path)
        socket.off("doc "+path, fn)
    },

    query(collection, q, fn) {
        socket.emit("doc:query", collection, q, fn)
    },

    set(path, data, fn) {
        setTimeout(() => {
            socket.emit("doc:set", path, data, fn)
        },100)
        
    },

    remove(path, fn) {
        socket.emit("doc:remove", path, fn)
    }

    // emit (event, ...args) {
    //     socket.emit(event, ...args)
    //     console.log("emit", ...args)
    // },

    // on(event, cb) {
    //     socket.on("doc:"+event, (...args) => {

    //         console.log("on", event, ...args)
    //         cb(...args)
    //     })
    // }
}


export default doc