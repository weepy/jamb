<script>
// import engine from './entities/engine.js'
import io from 'socket.io-client'
import {writable} from 'svelte/store'
let socket = io()



function rndid() {
    return Math.random().toString(36).slice(2,6)
}

localStorage.clientId = localStorage.clientId || rndid()

function login() {
 

    socket.emit('login', {id: localStorage.clientId, nick: 'jonah'}, (userObj) => {
 
        user.set(userObj)
        console.log("OK")
    })

    console.log($users)
}

// function createProject() {
    
//     const userObj = engine.run(state, 'project', 'create',  {id: rndid() } )
    
//     user.set(userObj)
//     users.set(state.users)

    
//     socket.emit('login', {id: rndid(), nick: 'jonah'})

//     console.log(users)
// }

</script>

{#if !$user}
<button on:click={login}>login</button>
{/if}

{#each $users as u} 
<p>{u.nick}</p>
{/each } 