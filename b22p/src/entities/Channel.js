// const BaseEntity = require('../shared/EntityBase.js')

const Props = ["id"]

class Channel  {

    constructor(o, project) {
        
        this.project = project

        this.input = project.context.createGain()
        
        
        if(o.id =="submix") {
            const convolver = new project.context.tuna.Convolver({
                highCut: 22050,                         //20 to 22050
                lowCut: 100,                             //20 to 22050
                dryLevel: 1,                            //0 to 1+
                wetLevel: 1,                            //0 to 1+
                level: 1,                               //0 to 1+, adjusts total output of both wet and dry
                impulse: "/impulses/PlateSmall.ogg",    //the path to your impulse response
                bypass: 0
            });

            this.input.connect(convolver)
            this.output = convolver
            
        }
        
        else {
            this.output = this.input
        }

        this.set(o)
    }

    set(o) {

        for(var i in o) {
            
            this[i] = o[i]
        }

        if(o.into) {
            this.project.connect(this.output, this.into)
        }
    }
    
    toJSON() {
        const o = {};
        Props.forEach(p => {
            if(p in this)  
                o[p] = this[p] 
        })
        return o
    }

}

module.exports = Channel