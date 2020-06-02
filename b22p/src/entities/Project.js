import Loop from './Loop.js'
import Channel from './Channel.js'

const BaseProject = require('../shared/BaseProject.js')
const BaseEntity = require('../shared/BaseEntity.js')

function mod(a, n) {
    return ((a%n)+n)%n;
}



const Klasses = {
    loops: Loop,
    channels: Channel,
    mix: Channel,
    /////////
    // meta: BaseEntity,
    users: BaseEntity,
    effects: BaseEntity,
    chats: BaseEntity
}

// const KEYS = ["meta", "mix", "channels", "loops", "users", "chats"]


class Project extends BaseProject {


    _createEntity(key, data) {
        return new Klasses[key](data, this)
    }


    calcStartOffset(loop) {
        
        let currentTime = this.context.currentTime

        const origin = this.findOrigin(currentTime)

        return mod(currentTime - origin - loop.offset, loop.loopLength)

    }


    connect( node , s ) {
        let dest
        
        if(s == "destination")   
            dest = this.context.destination
        else if(s.match(/mix$/))
            dest = this.mix[s].input
        else 
            dest = this.channels[s].input
       
        node.connect(dest)
    }

    findOrigin( currentTime ) {
        
        
        let origin = currentTime

        for(var i in this.loops) {
            const loop = this.loops[i]
            if(loop.origin > 0) {
                if (loop.origin < origin)
                    origin = loop.origin
            }

        }


        return origin
        
    }

    // set(...args, val) {
    //     if(args.length == 1)
    //         return super(args[0])

    //     const o = {}
    //     let node = o
    //     while(args.length) {
    //         const newNode = {}
    //         node[args.shift()] = newNode
    //         node = newNode
    //     }



        



    // }
}

export default Project
