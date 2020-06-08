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

  const filename = `/${projectId}/${fileStem}.${ext}`

  const uploadFolder = path.resolve(`${__dirname}/uploads/${projectId}` )
  mkdirp.sync(uploadFolder)
  
  const uploadPath = path.resolve(`${__dirname}/uploads${filename}` )

  sampleFile.mv( uploadPath, function(err) {
    if (err) {
      console.log({err})
      return res.status(500).send(err)
    }

    res.send({ filename })
    
  })

})


// let projectData = {
//   id: "myProjectId",
//   name: 'myProjectId', 
//   bpm: 120,
//   loops: {
//     "0:0": { id: "0:0", row: 0, channel: 0, url: "/audio/loops/Kit_Drums_MixDown1_C_120BPM.wav", loopLength: 1, gain:0.7 },
//     "1:0": { id: "1:0", row: 0, channel: 1, url:  "/audio/loops/Kit_PianoHigh_C_120BPM.wav",loopLength: 1,  },
//     "2:0": { id: "2:0", row: 0, channel: 2, url:  "/audio/metro.wav",loopLength: 1,  },
//     "3:1": { id: "3:1", row: 1, channel: 3, url:  "/audio/loops/51_XIV 120BPM Csmin Sample.wav", loopLength: 1, gain:0.5 }
//   }
// }


// const emptyProjectData = require("./emptyProjectData.js")

const doc = require('./doc.js')

doc.connect()


io.on('connection', (socket) => {
    
    console.log("connected!")

    // socket.on('doc:create', (collection, data, fn) => {
    //   doc.set(collection, data._id, data)
    //   fn(data)
    // })

    socket.on('doc:query', (collection, q, fn) => {
      
      doc.query(collection, q).then(data => {
        fn(data)
      })
    })

    
    // 0 && doc.set("projects.1", {"loops.1.playing": false})
    // 0 && doc.set("projects.1", {"loops.1.playing": false})
    
    socket.on('doc:set', (path, data, fn) => {
      
      const [collection, doc_id] = path.split(".") 
      
      

      doc.set(collection, doc_id, data)

      
      io.to(path).emit("doc "+path, data)
      
      if(fn) {
        fn()
      }
      
    })

    
    socket.on('doc:remove', (path, fn) => {

      const [collection, doc_id] = path.split(".") 

      doc.remove(collection, doc_id)

      io.to(path).emit("doc "+path, null) // deleted

      if(fn) {
        fn()
      }

    })

    socket.on('doc:get', (path, fn) => {      
      const [collection, doc_id] = path.split(".") 
      doc.get(collection, doc_id).then(fn)
    })
    
    socket.on('doc:sub', (path) => {
      socket.join(path)
    })

    socket.on('doc:unsub', (path, _id) => {
      socket.leave(path)
    })

    socket.on('disconnect', () => {
      
      //   socket.leave(project_id)
      //   project_id = null
      // }
    })


    socket.on("get_time", (time, fn) => {
        fn(time, Date.now())  
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

