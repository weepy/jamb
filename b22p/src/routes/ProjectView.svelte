<script>
// import network from '../network.js'
import { onMount } from 'svelte'
import AudioGraph from '../audio/AudioGraph.js'
import {uploadBlob, partition, now, merge, uuid, isPlaying } from '../utils/utils.js'

import RecordBar from '../components/RecordBar.svelte'
import { convertBufferToOgg } from '../utils/oggUtils.js'

import {recorderLoop, recordState} from '../store.js'

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
     
    
    if(1 && recordingData) {

        	const loopPlayer = graph.loops[$recorderLoop._id]
	
            loopPlayer.set({...recordingData, buffer, startAt: now()})

            $recorderLoop.startAt = now()
            $recorderLoop.url = "recording.ogg"
            

            project = project


            const blob = await convertBufferToOgg(buffer)
            const url = await uploadBlob({blob, projectId: project._id, filename: "recording.ogg"})
            doc.set("projects."+project._id, {"loops": { [$recorderLoop._id]: {url, ...recordingData} }})
            project = project

    }

    if(0 && recordingData) {

        

        const blob = await convertBufferToOgg(buffer)
        const url = URL.createObjectURL(blob)

        const loopPlayer = graph.loops[$recorderLoop._id]
        loopPlayer.set({...recordingData, url, startAt: now()})

        project = project


        $recorderLoop.startAt = now()

        const url2 = await uploadBlob({blob, projectId: project._id, filename: "recording.ogg"})
        doc.set("projects."+project._id, {"loops": { [$recorderLoop._id]: {url:url2, ...recordingData} }})
        
    }

        // const url = URL.createObjectURL(blob)


        // const player = graph.loops[$recorderLoop._id]
        
        // player.set({...recordingData, url, startAt: now()})

        // $recorderLoop.startAt = now()

        // project = project

	    // const url2 = await uploadBlob({blob, projectId: project._id, filename: "recording.ogg"})


        // doc.set("projects."+project._id, {"loops": { [$recorderLoop._id]: {url: url2, ...recordingData} }})
    

}

function selectempty(loop) {
    
    
    // doc.set("projects."+project._id, {"loops": { [loop._id]: recordingData }})
    // recordingData = null
    // killLoopPlayer()


    

}
</script>


<div>

<h1>Project #{project._id}</h1>


<Launcher onselect={handleLauncherSelect} onselectempty={selectempty} loops={project.loops}  />

<RecordBar project={project} graph={graph} handleRecording={handleRecording}></RecordBar>



<br/>
<a href="/projects">&lArr; projects</a>
</div>

<style>

.playing {
    font-weight: bold;
}
</style>