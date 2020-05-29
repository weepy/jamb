const path = require('path')
const express = require('express')
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

const Project = require("./src/shared/Project.js")

http.listen(1234, () => {
  console.log('listening on *:1234');
});

const projectData = require("./src/shared/defaultProjectData.js")

io.on('connection', (socket) => {
    
    console.log("connected!")

    let project = new Project(projectData)
    
    socket.on('createproject', (pid, fn) => {
        project = new Project()
        fn(JSON.stringify(project))
    })

    socket.on('loadproject', (pid, fn) => {
        // console.log(JSON.stringify(project))
        fn(project)
    })

    socket.on('create', (data) => {
        debugger
        project.createEntity(data)
        io.emit('create', data)
    })

    socket.on('set', (data) => {
        io.emit('set', data)
    })

    socket.on('noteon', (data) => {
        io.emit('noteon', data)
    })

    socket.on('noteoff', (data) => {
        io.emit('noteoff', data)
    })

    socket.on('select', (...args) => {

        io.emit('select', ...args)
        
    })


})

const cors = require('cors')

app.use(cors())
app.use(express.static(path.join(__dirname, '/public')))
