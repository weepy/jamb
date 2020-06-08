<script>
import { onMount } from 'svelte'

import router from "page"
import ProjectList from './routes/ProjectList.svelte'
import ProjectView from './routes/ProjectView.svelte'
import Home from './routes/Home.svelte'
import ErrorPage from './routes/ErrorPage.svelte'



import doc from './doc.js'

let page
let params

function setParams(ctx, next) {
    params = ctx.params
  	next()
}

function queryProjects(ctx, next) {
    doc.query("projects", {}, (docs) => {
        params = { projects: docs }
        next()
    })
}

function loadProject(ctx, next) {
    const path = "projects." + ctx.params._id
    doc.get(path, (data) => {
        if(data == null) {
            router.redirect('/')
        }
        else {
            params = { project: data }        
            next()
        }
    })

}

router('/', () => page = Home)
router('/projects', queryProjects, () => page = ProjectList)
router('/p/:_id', loadProject, () => page = ProjectView)
router('*', () => page = ErrorPage)



router.start()


</script>

<svelte:component this={page} params={params} />
