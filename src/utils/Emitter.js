function Emitter(o={}) {
	o.on = Emitter.on
	o.off = Emitter.off
	o.emit = Emitter.emit
	return o
}

Emitter.on = function(e, fn) {
	this._events = this._events || {}
	this._events[e] = this._events[e] || []
	this._events[e].push(fn)
}
	
Emitter.off = function(e, fn) {
	this._events = this._events || {}
	if( e in this._events === false  )	return
	this._events[e].splice(this._events[e].indexOf(fn), 1)
}

Emitter.emit = function(e, ...args){
	this._events = this._events || {}
	if( e in this._events === false  )	return
	for(var i = 0; i < this._events[e].length; i++){
		const fn = this._events[e][i]
		fn.apply(this, ...args)
	}
}

module.exports = Emitter
