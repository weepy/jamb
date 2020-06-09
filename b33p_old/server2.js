const path = require('path')
const express = require('express')
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);


http.listen(1234, () => {
  console.log('listening on *:1234');
});

const engine = require('./src/entities/engine.js')

const state = engine.defaultState()

const projects = []
const users = []

function rndid() {
  const id = Math.random().toString(16).slice(2)
  return id
}


io.on('connection', (socket) => {
    
    let user = null
    let project = null
    let pid = null

    socket.on('project:create', (id, fn) => {
      project = { id, users: {}, timelines: {}, instruments: {}, bpm: 120 }
      pid = id
      projects.push(project)
      socket.send('project:create', project)
    })

    socket.on('project:list', () => {
      
      socket.send("project:list", projects.map(p=>p.id))
    })


    ////////// 
    socket.on('project:open', (pid) => {
      project = projects.find(p=>p.id == pid)
      socket.emit('project:open', project)
    })

    socket.on('project:join', (pid) => {
      
      project.users[user.id] = {...user}
      
      socket.join(pid)
      socket.to(pid).emit('project:join', user)

    })


    socket.on('project:leave', () => {
      delete project.users[user.id]
      socket.leave(pid)
      socket.to(pid).emit('project:leave', user)
    })

    socket.on('project:set', (data) => {
      for(var i in data) {
        project[i] = data[i]
      }
        
      
      socket.to(pid).emit('project:set', user)
    })

    socket.on('disconnect', () => {
      if(user && project) {
        const u = project.users[user.id]
        u.present = false
        socket.leave(pid)
        io.in(pid).emit('project:leave', user)  
      }
      
    })


    /// INSTRUMENTS
    socket.on('instrument:create', (data) => {
      project.instruments[data.id] = data
      socket.to(pid).emit('instrument:create', user)
    })

    socket.on('instrument:set', (data) => {
      const instr = project.instruments[data.id]
      for(var i in data) {
        instr[i] = data
      }

      socket.to(pid).emit('instrument:set', data)
    })

    socket.on('instrument:key', (data) => {
      io.in(pid).emit('instrument:key', data)
    })

    // TIMELINE
    socket.on('timeline:create', (data) => {
      project.timelines[data.id] = data

      socket.to(pid).emit('timeline:create', data)
    })

    socket.on('timeline:set', (data) => {
      const timeline = project.timelines[data.id] 
      for(var i in data) {
        timeline[i] = data[i]
      }
      socket.to(pid).emit('timeline:set', data)
    })


    // socket.on('timeline:cue', (data) => {
    //   project.timelines[data.id] = data
    //   socket.to(pid).emit('timelines:cue', data)
    // })


    // CHATS
    socket.on('chat:create', ({text}) => {
      const chat = {text, nick: user.nick, uid: user.id}
      project.chats.push(chat)
      if(project.chats.length > 20) {
        project.chats.shift()
      }

      socket.to(pid).emit('chat:create', data)
    })


    socket.on('_ping', (x, fn) => {
      fn( x, Date.now() - startedAt )
    })


})


const cors = require('cors')

app.use(cors())

app.use(express.static(path.join(__dirname, '/public')))

app.get('*', function (request, response) {
  response.sendFile(path.resolve(__dirname, 'index.html'))
})


