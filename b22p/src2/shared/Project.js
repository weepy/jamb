const EntityBase = require("./EntityBase.js")

function BaseFactory(data) {
    return new EntityBase(data)
}

function match(a, b){
    for(var i in b) {
        if(a[i] !== b[i])
            return false
    }
    return true
}

class Project {
    constructor(data={}, factory=BaseFactory) {

        this.id = data.id
        this.factory = factory
        this.set(data)
    }

    set(data) {
        

        for(var key in data) {
            
            const type = key.replace(/s$/,'')

            if( Array.isArray(data[key]) ) {
                this[key] = data[key].map(d => this.createEntity({type, ...d}))

            }
            else {
                this[key] = data[key]
            }
        }
        
    }

    
    destroy({type, ...bits}) {
        const entities = this[type+'s']

        const entity = entities.find(x => match(x, bits))
        entity.destroy()
        
		this[type+'s'] = entities.filter(x => match(x, bits))
    }
    
    createEntity(data) {        

        return this.factory(data, this)
        
        // const list = this[data.type+'s']
   		// list.push(entity)
    }
    
}   

module.exports = Project