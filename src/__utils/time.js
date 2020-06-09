import io from 'socket.io-client'


// let error = Math.random()*100

function now() {
    return (Date.now()) / 1000
}




const socket = io()

setInterval(()=> {
    socket.emit("get_time", Date.now(), (sentAt, serverTime) => {
        const now = Date.now()
        
        const roundTrip = now - sentAt
        const serverTimeGuess = serverTime + roundTrip/2
        const offset = serverTimeGuess - now
        
        // console.log(offset)
    })
}, 1000)



export {
    now
}