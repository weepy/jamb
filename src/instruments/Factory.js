import AMSynth from './AMSynth.js'
import Piano from './Piano.js'
import Drum505 from './Drum505.js'

const classes = { AMSynth, Piano, Drum505 }
function Factory(o) {

    const  {type, ...args} = o
    const klass = classes[type]
    const i = new klass(args)

    return i 
}

export default Factory