<script>
import {onMount} from 'svelte'

export let networker

let projects = []

onMount(() => {
    networker("project:list", (p) => {
        projects = p
    })
})


function createProject() {
    networker("project:create", (p) => {
        // projects = p
    })
}

</script>


<div>B33P</div>

<h2>{projects.length} projects</h2>
{#each projects as project}
    <p>{project.id}</p>
{/each}

<button on:click={createProject}>
    create new project
</button>

