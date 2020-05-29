const controller = {
    create(data, { uid, pid}) {
        
        return {...data, uid, pid }
        

    },

    noteon(instrument, data) {
        // 
    },

    noteoff(instument, data) {
        // 
    },

    loadpreset(instrument, data) {
        
        instrument.preset = data
    },

    set(instrument, data) {
        
        for(var i in data) {
            instrument[i] = data[i]
        }
            
    }
}

module.exports = controller