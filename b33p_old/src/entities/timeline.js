const controller = {
    
    create(data, { uid, pid }) {       
        
        return {...data, uid, pid}

    },

    set(timeline, data) {
        
        for(var i in data)
            timeline[i] = data[i]
    }
}


module.exports = controller