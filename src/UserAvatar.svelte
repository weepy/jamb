<script>
export let user


</script>

<div class=user>
    <h2>{user.nick}</h2>
    <p>{user.instrumentType}</p>
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