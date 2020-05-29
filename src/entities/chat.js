const controller = {
    create( {text, nick}, {uid, pid} ) {
        return {
            text, 
            uid,
            nick,
            pid
        }

    }
}

module.exports = controller