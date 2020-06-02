<script>
import network from '../network.js'

export let params
$: projects = params.projects


function createProject() {
    network.emit("project:create", (p) => {
        projects = [...projects, p]
        console.log(p)
    })
}

function deleteProject(_id) {
    network.emit("project:delete", _id, () => {
        projects = projects.filter(p => p._id != _id)
    })
}

</script>

<div>

    <h1>Projects</h1>
    {#each projects as project}
        <p>
            <a href="/p/{project._id}"> {project._id}</a> <button on:click={() => deleteProject(project._id)}>-</button>
        </p>
    {/each}

    <button on:click={createProject}>+</button>
</div>