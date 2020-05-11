<script>
export let user
// export let instrument

</script>

<div class=user>
    <h2>{user.nick}</h2>
   {#if user.instrument && user.instrument.preset }
    <p>{user.instrument.preset.name}</p>
   {/if} 
</div>

<style>
.user {
    width: 100px;
    height: 100px;
    background: cyan;
    border: 2px solid black;
    text-align: center;
    padding: 20px;
    margin: 20px;
    display: inline-block
}
</style>