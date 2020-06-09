<script>
// import network from '../network.js'
import doc from '../doc.js'
import emptyProjectData from '../emptyProjectData.js'

export let params
$: projects = params.projects



function createProject() {
    const data = emptyProjectData(4,4)

    data.loops["a"] = { _id: "a", x: 0, y: 0, url: "/audio/loops/Kit_Drums_MixDown1_C_120BPM.wav", loopLength: 1, gain:0.7 },
    data.loops["b"] = { _id: "b", x: 0, y: 1, url:  "/audio/loops/Kit_PianoHigh_C_120BPM.wav",loopLength: 1,  },
    data.loops["c"] = { _id: "c", x: 0, y: 2, url:  "/audio/metro.wav",loopLength: 1,  },
    data.loops["d"] = { _id: "d", x: 1, y: 3, url:  "/audio/loops/51_XIV 120BPM Csmin Sample.wav", loopLength: 1, gain:0.5 }


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