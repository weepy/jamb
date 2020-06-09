const EntityBase = require("./shared/EntityBase.js")
const Instrument = require("./audio/Sampler.js")
const Timeline = require("./audio/Timeline.js")
function Factory(data) {
    if(data.type == "instrument") {
        return new Instrument(data)
    }
    if(data.type == "iimeline") {
        return new Timeline(data)
    }
    return new EntityBase(data)
}

export default Factory