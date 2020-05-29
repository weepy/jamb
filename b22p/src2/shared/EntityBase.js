class EntityBase {
    constructor(o) {
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
}

module.exports = EntityBase