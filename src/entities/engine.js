const project = require('./project.js')
const user = require('./user.js')
const timeline = require('./timeline.js')
const instrument = require('./instrument.js')
const chat = require('./chat.js')
// import _debug = require('debug'

// // import { empty } = require('svelte/internal'

const debug = require('debug')('main')

const controllers = {
    project, user, timeline, instrument, chat
}

const engine = {

    defaultState() {
        return { 
            users: [], 
            projects: [],
            timelines: [],
            instruments: [],
            chats: []
        }
    },


    // SERVER
    query(state, type, q) {
        const table = state[type]
        return table.filter( o => {

            for(var key in q) {
                if(o[key] != q[key])
                    return false
            }

            return true
        })
    },

    getProject(state, pid) {
        const project = state.projects[pid]
        
        const users = project.users.map(uid => state.users[uid]) 
        const timelines = this.query(state, "timelines", { pid })
        const chats = this.query(state, "chats", { pid })
        const instruments = this.query(state, "instruments", { pid })
        
        return {
            project, users, timelines, chats, instruments
        }

    },


    
    run(state, type, action, data, uid, pid) {

        const table = state[type+'s']
        const object = table.find(x => x.id == data.id)
        
        const controller = controllers[type]
        const fn = controller[action]
        
        
        const o = action == "create" ? fn(data, { uid, pid }) : fn(object, data, { uid, pid })

        if( o == false) {
            // BAD
            debug(type, action, pid, uid, data)
        }
        else {
            // GOOD
            if(action == "create" ) {
                // SAVE   
                
                table.push(o)
            }
            
        }

        return o
    }
}

module.exports = engine
// export default engine