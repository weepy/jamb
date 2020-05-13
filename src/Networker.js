import _debug from 'debug'

const debug = _debug('networker')

const localActions = {
	noteon:1, noteoff:1, loadinstr:1
}


class Networker {
	
	constructor(socket, actions, thisUser) {

		this.thisUser = thisUser
		this.socket = socket
		this.actions = actions
		for(var action in actions) {
			this.addAction(action)
		}
		this.pingTime = 0
	}

	mockdelay() {
		const d = parseFloat(localStorage.delay)||0
		const j = parseFloat(localStorage.jitter)||0
		return d * (1+j*(Math.random()-0.5))
	}

	addAction(action) {
		
		this.socket.on(action, (arg, uid) => {
			
			debug("receive", action, arg, uid)
			// IGNORE KEY EVENT IF ITS ME
			if(localActions[action] && !localStorage.nolocalSend && uid == this.thisUser.uid) {
				return
			}

			this.actions[action](arg, uid)
		})
	}

	run(action, arg) {
		
		debug("emit", action, arg)
		this.socket.emit(action, arg, this.mockdelay())
		
		const uid = this.thisUser.uid
		
		
		if(localStorage.nolocalSend) {
			return
		}

		// MB RUN LOCALLY
		if(localActions[action]) {
			setTimeout(() => {
				this.actions[action](arg, uid)
			}, this.pingTime)
		}
	}
}

export default Networker