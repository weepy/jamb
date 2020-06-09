function preload(_samples) {
    const samples = [..._samples]

    function load(res, rej) {
        const sample = samples.shift()
        if(!sample) {
            return res()
        }

        const a = new Audio()
        a.oncanplay = () => load(res, rej)
        a.src = sample
    }

    return new Promise(load)

}

export default preload