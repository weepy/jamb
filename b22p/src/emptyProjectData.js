
function emptyProjectData(channelCount, rowCount) {
        
    const data = {
        
        info: {
          name: "Untitled Project",
          bpm: 120,
          origin: 0
        },

        channels: {
            mainmix: { _id:'mainmix', into: "destination" },
            submix: { _id:'submix', into: "mainmix" },
        },

        loops: {

        },

        // effects: {
        //     // "submix.0": { 
        //     //     channel: "submix", position: 0, wet: 0, effect: "reverb"
        //     // }
        // },
        // users:{},
        // chats:{}
    }

    for(var i=0; i<channelCount;i++) {
        data.channels[i] = {_id:i}
    }
    
    for(var i=0; i<channelCount;i++) {
        
        for(var j=0; j<rowCount;j++) {
            const _id = i+":"+j
            data.loops[_id] = {_id, channel:i, row: j}
        }
    }

    return data
}

module.exports = emptyProjectData