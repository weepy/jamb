
projects = {
    pid,
    title,
    bpm,
    swing
}


timelines: [],
instruments: [],
chats: [],
users: []

timelines: {
    pid,
    notes
    loopLength
    playing
    cueing
}

users = {
    uid,
    nick
}

instruments = {
    pid
    iid
    type
}

actions
========


user:create
    uid nick pass





project:chat
    pid nick pass

project:create
    pid title

project:setbpm
    bpm

project:set:reverb
    bpm

project:set:delay
    bpm

project:open
    pid

project:join
    pid

project:leave
    pid


instrument:create
    iid type preset

instrument:note:on 
    iid key velocity

instrument:note:off 
    iid key 

instrument:note:off 
    

instrument:load
    iid data

instrument:set
    iid preset

timeline:create
    tid 

timeline:cue

timeline:uncue

timeline:set:notes
    
timeline:set:loopLength


project
    object
        id
            type


note.on()
note.off()


class object {

}

notes
    nid
    


action
    {
        action, pid, oid, uid, data, at
    }


projects = {

}

project
    instruments
        
    timeline
        loops


id = "213.123."

const tables = {
    users: {},
    projects: {},
    notes: {},


}

class ActionHandler {
    
    // create({type,action,id,uid,data}) {

    // }

    projectAction({pid, type,action,id,uid,data}) {
        const table = tables[type]
        
        if(action == "create") {

            if(type == "project") {
                table.push({
                    id,
                    uid,
                    ...data
                })
            }


        }
        else {

        }

        const object         
    }   

    actionHandler() {

    }

}



