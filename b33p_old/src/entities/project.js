const controller = {
    create( data, {uid} ) {
        const project = {
            ...data, 
            uid
        }
        return project
    },

    set(project, data) {
        
        for(var i in data) {
            project[i] = data[i]
        }
    },

    join(project, { uid }) {
        project.users.push(uid)
    }
}

module.exports = controller