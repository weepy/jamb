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

let g_user_id = 0

let users = {}

const startedAt = Date.now()

io.on('connection', (socket) => {
    
    console.log("connected!")
  
    let user

    socket.on('enter', (fn) => {
        socket.emit('enter', users)
        console.log(users)
    })

    socket.on('join', ({nick}) => {
        const uid = g_user_id++
        user = {nick, uid}
        
        users[uid] = user

        socket.on('chat', ({text}) => {
      
          io.emit('chat', {text, nick: user.nick}, user.uid)
        })
    
        socket.on('noteon', (x, delay) => {
    
          
          
          setTimeout(() => {
            io.emit('noteon', x, user.uid)
          }, parseInt(delay)||0)
        })
    
        socket.on('noteoff', (x, delay) => {
    
          setTimeout(() => {
            io.emit('noteoff', x, user.uid)
          }, parseInt(delay)||0)
        })
    
        socket.on('loadinstr', (instr, delay) => {
          
          
          user.instr = instr
          setTimeout(() => {
            io.emit('loadinstr', instr, user.uid)
          }, parseInt(delay)||0)
        })



        io.emit('join', user, user.uid)
    })






    socket.on('_ping', (x, fn) => {
      fn( x, Date.now() - startedAt )
    })

    socket.on('disconnect', (x) => {
    
    
      if(user) {
        delete users[user.uid]

        console.log('disconnected: ' + user)
        io.emit('disconnected', user)
      }
    })
})


const cors = require('cors')

app.use(cors())
app.use(express.static(path.join(__dirname, '/public')))
