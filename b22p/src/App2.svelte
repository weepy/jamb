<script>
import { onMount } from 'svelte'

import router from "page"
import ProjectList from './routes/ProjectList.svelte'
import ProjectView from './routes/ProjectView.svelte'
import Home from './routes/Home.svelte'
import ErrorPage from './routes/ErrorPage.svelte'

import network from './network.js'

let page
let params

function setParams(ctx, next) {
    params = ctx.params
  	next()
}

function queryProjects(ctx, next) {
    network.emit("project:query", {}, (projects) => {
        params = { projects }
        next()
    })
}

function loadProject(ctx, next) {
    network.emit("project:find", ctx.params._id,  (project) => {
        params = { project }
        
        next()
    })

}

router('/', () => page = Home)
router('/projects', queryProjects, () => page = ProjectList)
router('/p/:_id', loadProject, () => page = ProjectView)
router('*', () => page = ErrorPage)



router.start()


</script>

<svelte:component this={page} params={params} />
