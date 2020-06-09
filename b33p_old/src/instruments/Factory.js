import AMSynth from './AMSynth.js'
import Piano from './Piano.js'
import Drum505 from './Drum505.js'
import Sampler from './Sampler.js'

const classes = { Sampler, AMSynth, Piano, Drum505 }
function Factory(o) {

    const  {type, ...args} = o

    
    const klass = classes[type]
    const i = new klass(args)



    return i 
}


Factory.load = () => {

    Object.keys(classes).map(klass => {
        new klass()
    })
}

Factory.classes = classes


export default Factory