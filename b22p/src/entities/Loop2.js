class Loop {
    constructor(o) {
        for(var i in o) {
            this[i] = o[i]
        }
    }
}


export default Loop