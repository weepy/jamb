const Emitter = {
	on(e, fn){
		this._events = this._events || {}
		this._events[e] = this._events[e] || []
		this._events[e].push(fn)
	},
	off(e, fn){
		this._events = this._events || {}
		if( e in this._events === false  )	return
		this._events[e].splice(this._events[e].indexOf(fn), 1)
	},
	emit(e, ...args){
		this._events = this._events || {}
		if( e in this._events === false  )	return
		for(var i = 0; i < this._events[e].length; i++){
			const fn = this._events[e][i]
			fn.apply(this, ...args)
		}
	},
	mixin(o) {
		o.on = this.on
		o.off = this.off
		o.emit = this.emit
	}
}

module.exports = Emitter
