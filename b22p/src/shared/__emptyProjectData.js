function emptyProjectData(channelCount, rowCount) {
        
    const data = {
        
        info: [{   
            name: "Untitled Project",
            bpm: 120
        }],

        mix: {
            main:{},
            sub:{},
        },
        channels: {
            
        },
        loops: {

        },
        users:{},
        chats:{}
    }

    for(var i=0; i<channelCount;i++) {
        data.channels[i] = {}
    }

    for(var i=0; i<channelCount;i++) {
        
        for(var j=0; j<rowCount;j++) {
            const id = i+":"+j
            data.loops[id] = {id, channel:i, row: j}
        }
    }

    return data
}

module.exports = emptyProjectData