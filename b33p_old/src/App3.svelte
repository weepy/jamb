<script>
    import router from "page"

    import Home from './pages/Home.svelte'
    import Project from './pages/Project.svelte'
    import io from 'socket.io-client'

    // Variables
    let page
    let params
    
    let socket = io()

    
    router('/', () => page = Home)
    router('/project/:id', (ctx, next) => {
        params = ctx.params
        next()
    }, () => page = Project)
    
    router.start()


    let user = writable(null)
    let project = writable(null)
    

    const eventActions = {
        "project:open": (p) => {
            project.set(p)
        }
    }


    /// STORE
    const project = writable(null)
    const user = writable(null)

    const store = {
        project, user
    }

    



    const {
        project, user
    } = store


    // const project = {
    //     users: [{id:'j1', nick:'jonah'}],
    //     instruments: [{}]
    // }

    // const user = {
    // }


    const {
        users, 
        timelines,
        instruments
    } = $project


    



    class Networker {
        constructor(context) {
            this.socket = socket
            
            socket.on("project:open", (p) => {
                project.set(p)
            })

            socket.on("project:join", (u) => {
                const us = users.get()
                us[u.id] = u
                us.update(p)
            })


        }   

        send(actionName, data) {
            
            // remote
            this.socket.emit(msg, arg)
            
            // local
            actions[actionName](data)

        }

        
        
        
    }

    const networker = new Networker(socket)


</script>
 
<svelte:component this={page} params={params} networker={networker} />
