<script>
import engine from './engine/engine.js'
import expect from 'expect.js'

// import {strict as } from 'assert'

let errors = []
let passes = 0
let count = 0


function OK(x, msg) {
    if(!x) {
        errors.push("Failed test#"+count + msg)
    }
    else {
        passes += 1
    }
    count+=1
}

function EQL(x, y) {
    OK(x===y, x + "===" + y)
}

////////////

const state = engine.defaultState()

engine.run(state, 'user','create', {id: "j1", nick: 'jonah' })
EQL(state.users.j1.nick, 'jonah')

engine.run(state, 'project' ,'create', { id:'p1'} ,'j1' )
OK(state.projects.p1)
EQL(state.projects.p1.uid, 'j1')
EQL(Object.keys(state.instruments).length, 0)

engine.run(state, 'instrument', 'create', { id:'i1'},'j1', "p1" )
EQL(Object.keys(state.instruments).length, 1)


</script>

<p>{count} tests {errors.length} errors<p>
<div>
    {#each errors as err}
        <p>{err}</p>
    {/each}
</div>
