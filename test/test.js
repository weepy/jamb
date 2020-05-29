import engine from '../src/engine/engine.js'



const state = { users: {}, projects: {} }

engine.runAction(state, 'user:create', "j1", { nick: 'jonah' })
const ok = state.users.j1.nick == "jonah"

console.log(ok)

// 