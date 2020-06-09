const vals = "C C# D D# E F F# G# A A# B".split(" ")


function key2num(k) {
	const note = k.slice(0,-1).toUpperCase()
	const octave = parseInt(k.slice(-1))+1
	return vals.indexOf(note) + octave*12
}

function num2key(num) {
	// 60 is middle C 
	const octave = Math.floor(num/12)-1
	const rem = num % 12
	return vals[rem] + octave
}

function Score(string, root=0) {

	if(typeof root == "string") {
		root = key2num(root)
	}

	var notes = []
	var bits = string.split(" ")	

	var time = 0
	var length = 0;

	for(var i=0; i < bits.length; i++) {
		var bit = bits[i]

		// ignore
		if(bit == "|" || bit == "") {
			// ignore	
		}
		else if(bit == ".") {
			length++;
			time++;
		}
		else if(bit.match(/^[0-9-\/]/)) {
			var key = bit.replace(/_/g,'')

            
            
			// if( isNaN(pitch) ) {
			// 	throw new Error("bad pitch", bit)
			// }

			var velocity = 1
			var delta = bit.length - key.length
			var note = { key: num2key((key|0)+root), time, length: delta + 1, velocity }
			
			time+= delta;
			length += delta
			notes.push(note)
			time++;
			length++;
		}
		else {
			debugger
			throw new Error("unknown score part", bit)
		}

		
	}

	return {
		loopLength: length,
		notes
	}
}

export default Score