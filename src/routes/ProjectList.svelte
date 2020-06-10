<script>
// import network from '../network.js'
import doc from '../doc.js'
import emptyProjectData from '../emptyProjectData.js'

export let params
$: projects = params.projects



function createProject() {
    const data = emptyProjectData(5,5)

    data.loops["a"] = { _id: "a", x: 0, y: 0, url: "/audio/drumloop.ogg", loopLength: 2, gain:0.7 },
    data.loops["c"] = { _id: "c", x: 1, y: 0, url:  "/audio/metro.ogg",loopLength: 2, gain:0.5  },
    data.loops["d"] = { _id: "d", x: 2, y: 0, url:  "/audio/pianoloop.ogg", loopLength: 8, gain:0.7 }


    data._id = Math.random().toString(36).slice(2)
    
    doc.set("projects."+data._id, data, () => {
        projects = [...projects, data]
    })
}

function deleteProject(_id) {
    doc.remove("projects."+_id, () => {
        projects = projects.filter(p => p._id != _id)
    })
}

</script>

<div>

    <h1>Projects</h1>
    {#each projects as project}
        <p>
            <a href="/p/{project._id}"> {project.info ?project.info.name: '?'}</a> <button on:click={() => deleteProject(project._id)}>-</button>
        </p>
    {/each}

    <button on:click={createProject}>+</button>
</div>