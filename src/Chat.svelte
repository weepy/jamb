<script>

export let socket

let chats = []

let input

function submit(e) {
    socket.emit('chat', {text: input.value})
    input.value = ''
}

socket.on('chat', (chat) => {
    
    while(chats.length > 20)
        chats.shift()

    chats = [...chats, chat]
})

</script>

<ul id="messages">
    {#each chats as chat}
        <li>{chat.text}</li>
    {/each}
</ul>

<form action="" on:submit|preventDefault={submit}>
    <input bind:this={input} id="m" autocomplete="off" /><button>Send</button>
</form>


<style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font: 13px Helvetica, Arial; }
    form { background: #000; padding: 3px; position: fixed; bottom: 0; width: 100%; }
    form input { border: 0; padding: 10px; width: 90%; margin-right: 0.5%; }
    form button { width: 9%; background: rgb(130, 224, 255); border: none; padding: 10px; }
    #messages { list-style-type: none; margin: 0; padding: 0; }
    #messages li { padding: 5px 10px; }
    #messages li:nth-child(odd) { background: #eee; }
</style>