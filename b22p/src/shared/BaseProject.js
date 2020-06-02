



function emptyProjectData(channelCount, rowCount) {
        
    const data = {
        
        // meta: [{   
        name: "Untitled Project",
        bpm: 120,
        // }],


        mix: {
            mainmix: { into: "destination" },
            submix: { into: "mainmix" },
        },

        channels: {

        },

        loops: {

        },

        effects: {
            "submix.0": { 
                channel: "submix", position: 0, wet: 0, effect: "reverb"
            }
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

const BaseEntity = require('./BaseEntity.js')

const CollectionProps = ["mix", "channels", "loops", "users", "chats", "effects"]

class BaseProject {

    constructor(data={}, audioContext) {

        this.id = data.id
        this.type = "project"
        this.context = audioContext


        const emptyData = emptyProjectData(4,4)
        this.set(emptyData)
        this.set(data)

    }

    _createEntity(key, data) {
        return new BaseEntity(data)
    }

    create( c, data) {
        console.log("create", c , data)
        const collection = this[c] = this[c] || {}
        const e = this._createEntity(c, data )
        collection[data.id] = e
        return e
    }

    toJSON() {
        const o = {};
        
        ["id", "name", "bpm"].forEach( key => {
            o[key] = this[key]
        })

        CollectionProps.forEach(key => {
            o[key] = {}
            const collection = this[key]
            for(var id in collection) {
                o[key][id] = collection[id].toJSON()
            }
        })

        return o
    }

    set(o) {

        ["name", "bpm"].forEach( key => {

            if(key in o) {
                this[key] = o[key]
            }

        });
        
        CollectionProps.forEach((key) => {

            const data = o[key]

            if(!data) return

            const collection = this[key] = this[key] || {}
            
            for(var id in data) {

                const obj = collection[id]
                const d = data[id]

                if(obj) {
                    if(d.$destroy) {
                        obj.destroy()
                        delete collection[i]
                    }
                    else {
                        obj.set( d )
                    }
                }
                else {
                    const type = key.replace(/s$/,'')
                    this.create(key, {id, type, ...d})
                }

            }


        })

    }
    
}   


module.exports = BaseProject