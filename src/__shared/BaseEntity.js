

class BaseEntity {
    constructor(o, project) {
        this.project = project
        this.set(o)
    }

    set(o) {
        for(var i in o) {
            this[i] = o[i]
        }
    }

    destroy() {
        // 
    }

    toJSON() {
        const o = {}
        
        for(var key in this) {
            const val = this[key]
            if(typeof val != "function")
                o[key] = val
        }

        return o
    }
}



module.exports = BaseEntity