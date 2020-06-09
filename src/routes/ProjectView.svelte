<script>
// import network from '../network.js'
import { onMount } from 'svelte'
import AudioGraph from '../audio/AudioGraph.js'
import {uploadBlob, partition, now, merge, uuid, isPlaying } from '../utils/utils.js'

import RecordBar from '../components/RecordBar.svelte'
import { convertBufferToOgg } from '../utils/oggUtils.js'

import {metapressed, recorderLoop, recordState} from '../store.js'

export let params

$: project = params.project

window.project = params.project
$: loops = Object.values(project.loops||{})
let graph 

import doc from '../doc.js'


let contextMenuItem 

import Launcher from '../components/Launcher.svelte'


function handleLauncherSelect(mode, loops) {
    if(mode == "select") {
        contextMenuItem = loops
    }
    else {
        // START MULTIPLE LOOPS
        // SPLIT INTO STARTING AND STOPPING
        const time = now()

        const [stopping, starting] = partition(loops, loop => isPlaying(loop, time))
        
        const data = {
            loops: {}
        }


        if(starting.length) {
            const originTime = graph.calculateOriginTime()

            if(project.info.origin != originTime )  {
                data.info = {"origin": originTime }
            }

            starting.forEach(loop => {
                data.loops[loop._id] = { startAt : time }
            })
        }

        stopping.forEach (loop => {
            data.loops[loop._id] = { endAt : time }
        })

        doc.set("projects."+project._id, data)
        
    }
}


    



onMount(() => {



    const context = new (window.AudioContext||window.webkitAudioContext)()
    graph = new AudioGraph(project, context, project)



    const path = "projects." + project._id
    const fn = (data) => {    
        if(data == null) {
            console.log("DELETED!")
        }
        else {
            // console.log("data")

            project = merge(project, data)

            graph.set(data)
        }
    }

    doc.sub(path, fn)

    return () => {
        doc.unsub(path, fn)
        context.close()
    }
})


async function handleRecording(recordingData, buffer) {
     
 

        graph.addLoop(recordingData._id,
                {...recordingData, buffer, startAt: now()})

        // doc.setlocal("projects."+project._id, {"loops": { [recordingData._id]: {...recordingData} }})

        
        project = project


        const blob = await convertBufferToOgg(buffer)
        const url = await uploadBlob({blob, projectId: project._id, filename: "recording.ogg"})
        doc.set("projects."+project._id, {"loops": { [recordingData._id]: {url, ...recordingData} }})
        recorderLoop.set(null)
        project = project



}


</script>


<div class:meta={$metapressed}>

<h1>Project #{project._id}</h1>


<Launcher onselect={handleLauncherSelect} loops={project.loops}  />

<RecordBar project={project} graph={graph} handleRecording={handleRecording}></RecordBar>



<br/>
<a href="/projects">&lArr; projects</a>
</div>

<style>

.playing {
    font-weight: bold;
}

.meta {
    cursor: cell
}
</style>