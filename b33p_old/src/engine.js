
const projects = {}
const users = {}

const MainController = {

    createProject({id}, uid) {

        if(projects[id] || !uid)
            return false

        const project = { id, uid }
        projects[id] = project
        
    },

    createUser({nick}, uid) {

        if(users[id] || !nick || !uid)
            return false

        // THROW IF users already exist
        
        
    },

    handleAction( {type, id, action, uid, ...data} ) {
        if(type == "user") {

            return UserController.handleAction(action, data, uid)
        } 
        
        return ProjectController.handleAction(action, data, uid)
    }

}


const ProjectController = {
    handleAction(action, data, uid) {

    }
}


const users = {}
const projects = {}

const controllers = {}

controllers.project = {
    create({id}, uid, pid ) {
        const project = {
            id, 
            uid,
            instruments: {},
            users: {},
            timelines: {},
            chats: [],
            bpm
        }
        projects[id] = project
    },

    set(data, uid, pid) {
        const project = projects[pid]
        for(var i in data) {
            project[i] = data[i]
        }
    }
}

controllers.user = {
    create({id, nick}, uid, pid) {
        const user = { id, nick }
        users[id] = user
    }
}

controllers.instrument = {
    create({id, ...data}, uid, pid) {

        const project = projects[pid]
        project.instruments[id] = {...data, uid}

    },

    set({id, ...data}, uid, pid) {
        const instrument = projects[pid].instruments[id]
        
        for(var i in data)
            instrument[i] = data[i]
    }
}

controllers.timeline = {
    create({id, ...data}, uid, pid) {

        const project = projects[pid]
        project.instruments[id] = {...data, uid}

    },

    set({id, ...data}, uid, pid) {
        const instrument = projects[pid].instruments[id]
        
        for(var i in data)
            instrument[i] = data[i]
    }
}


controllers.main = {
    
    run({ type, action, pid, uid, ...data}) {

        
        const controller = controllers[type]
        const fn = controller[action]

        if(fn(data, uid, pid) !== false) {
            // OK!
        }
        
    }


}


const user = controllers.main.run({type: "user", action: "create", uid:"jonah-id", nick:"jonah"})

const project = controllers.main.run({type:"project", action: "create", uid: "jonah-id", pid:"projectidxxx"})


controllers.main.run({type:"project", action: "set", uid: "jonah-id", pid:"projectidxxx" })

controllers.main.run({type:"timeline", action: "set", uid: "jonah-id", pid:"projectidxxx", playing: true })


