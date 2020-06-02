const path = require('path')
const express = require('express')
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
const fileUpload = require('express-fileupload')


app.use(fileUpload({
    // useTempFiles : true,
    // tempFileDir : '/tmp/'
  }));

const mkdirp = require('mkdirp')



http.listen(1234, () => {
  console.log('listening on *:1234');
});


const Project = require("./src/shared/BaseProject.js")
// const projectData = require("./src/shared/defaultProjectData.js")


function uuid(N) {
    const s = []
    for(var i =0; i<N;i++) {
        s[i] = Math.random().toString(36)[2]
    }
    return s.join("")
}


app.post('/upload', function(req, res) {
  if (Object.keys(req.files).length == 0) {
    return res.status(400).send('No files were uploaded.')
  }

  const { ext, projectId } = req.body
  
  const sampleFile = req.files.audioFile

  const fileStem = uuid(6)

  const filename = `${projectId}/${fileStem}.${ext}`

  const uploadFolder = path.resolve(`${__dirname}/uploads/` )
  mkdirp.sync(uploadFolder)
  
  const uploadPath = path.resolve(`${__dirname}/uploads/${filename}` )

  sampleFile.mv( uploadPath, function(err) {
    if (err) {
      console.log({err})
      return res.status(500).send(err)
    }

    res.send({ filename })
    
  })

})


let projectData = {
  id: "myProjectId",
  name: 'myProjectId', 
  bpm: 120,
  loops: {
    "0:0": { id: "0:0", row: 0, channel: 0, url: "/audio/loops/Kit_Drums_MixDown1_C_120BPM.wav", loopLength: 1, gain:0.7 },
    "1:0": { id: "1:0", row: 0, channel: 1, url:  "/audio/loops/Kit_PianoHigh_C_120BPM.wav",loopLength: 1,  },
    "2:0": { id: "2:0", row: 0, channel: 2, url:  "/audio/metro.wav",loopLength: 1,  },
    "3:1": { id: "3:1", row: 1, channel: 3, url:  "/audio/loops/51_XIV 120BPM Csmin Sample.wav", loopLength: 1, gain:0.5 }
  }
}


const fibre = require('./fibre.js')
const db = {
  
}

fibre.connect().then(() => {
  db.projects = fibre.collection("projects")
})



io.on('connection', (socket) => {
    
    console.log("connected!")

    let project_id

    socket.on('project:create', (fn) => {

      const _id = uuid(20)
      db.projects.set(_id, { _id })
      fn({_id})
    })

    socket.on('project:query', (q, fn) => {
      console.log("X", q)
      db.projects.query(q).then(data => {
        fn(data)
      })
    })

    socket.on('project:set', ( data) => {
      db.projects.set(project_id, data)

      // fibre.set("projects", current_project_id, data )
console.log("emit", project_id,data)
      io.to(project_id).emit("project:set", data)
      
    })

    
    socket.on('project:delete', (_id, fn) => {
      db.projects.remove(_id)
      fn({_id})
    })

    socket.on('project:find', (_id, fn) => {      
      db.projects.get(_id).then(data => {
        fn(data)
      })
    })
    
    socket.on('project:sub', (_id) => {
      project_id = _id
      socket.join(_id)
    })

    socket.on('project:unsub', () => {
      socket.leave(project_id)
      project_id = null
    })

    socket.on('disconnect', () => {
      if(project_id) {
        socket.leave(project_id)
        project_id = null
      }
    })



    // socket.on('open', (pid, fn) => {

    //   db.projects[pid] = db.projects[pid] || new Project(projectData)
      
    //   project = db.projects[pid]

    //   fn(project)
    // })

    // socket.on('loadproject', (pid, fn) => {
    //     // console.log(JSON.stringify(project))
    //     fn(project)
    // })

    // socket.on('create', (data) => {
    //     debugger
    //     project.createEntity(data)
    //     io.emit('create', data)
    // })

    // socket.on('set', (data) => {
    //     project.set( data )

        
    //     console.log(JSON.stringify(project,null,2))
    //     io.emit('set', data)
        
    // })

    // socket.on('select', (...args) => {
    //     io.emit('select', ...args)
    // })


})

const cors = require('cors')

app.use(cors())

app.use(express.static(path.join(__dirname, '/public')))
app.use(express.static(path.join(__dirname, '/uploads')))


app.get('*', function(req, res, next) {
  res.sendFile(path.join(__dirname, './public/index.html'))
})

