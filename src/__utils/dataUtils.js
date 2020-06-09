
function merge(a, b) {

    for(var i in b) {
        if(typeof b[i] == "object") {
            a[i] = a[i] || {}
            merge(a[i], b[i])
        }
        else {
            a[i] = b[i]
        }
    }
    return a
}


////// UNUSED
// function undotField(o, key) {
//     const bits = key.split(".")
//     const val = o[key]
//     delete o[key]

//     let node = o
//     const last = bits.pop()

//     bits.forEach(b => {
//         node[b] = node[b] || {}
//         node = node[b]
//     })
//     node[last] = val
//     return o
// }

// function undot(o) {
//     for(var key in o) {
//         if(key.match(".")) {
//             undotField(o, key)
//         }
//     }
//     return o
// }

// function mergeObjects(a, b) {
//     b = undot(b)
//     return merge(a, b)
// }


export {
    merge
}