const path = require('path')
const express = require('express')
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  })
})

http.listen(1234, () => {
  console.log('listening on *:1234');
});

let g_channel_id = 0

let users = []

io.on('connection', (socket) => {
    
    console.log("connected")

    socket.on('enter', (fn) => {
        
        fn( users )
    })

    socket.on('join', ({nick}) => {
        const channel_id = g_channel_id++
        const user = {nick,channel_id}
        socket.user = user
        users.push(user)
        
        
        io.emit('join', socket.user)
    })


    socket.on('chat', (msg) => {
      
      io.emit('chat', msg)
    })

    socket.on('keyoff', (x) => {
        io.emit('keyoff', x)
    })

    socket.on('keyon', (x) => {
        
        io.emit('keyon', x)
    })

    socket.on('_ping', (x, fn) => {
      fn(x)
    })

    socket.on('disconnect', (x) => {
      console.log('disconnected: ' + socket.user)

      users = users.filter(u => socket.user != u)

      io.emit('disconnected', socket.user)
    })
})


const cors = require('cors')

app.use(cors())
app.use(express.static(path.join(__dirname, '/public')))
