
class Channel  {

    constructor(o, graph) {
        
        this.graph = graph

        this.input = graph.context.createGain()

        this.output = graph.context.createGain()
        
        
        if(o._id =="submix") {
            const convolver = new graph.context.tuna.Convolver({
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

            this.suboutput = graph.context.createGain()
            this.output.connect(this.suboutput)
            this.output = this.input
        }

        this.set(o)
    }

    set(o) {

        for(var i in o) {
            
            this[i] = o[i]
        }

        // if(o.into) {
        //     this.graph.connect(this.output, this.into)
        // }
    }


}

module.exports = Channel