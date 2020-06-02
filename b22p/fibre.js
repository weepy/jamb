const MongoClient = require('mongodb').MongoClient;


const url = 'mongodb://localhost:27017';
const dbName = 'b33p-test';
const client = new MongoClient(url, {useUnifiedTopology: true});
const $ = require('mongo-dot-notation')


let db
// Use connect method to connect to the Server
function connect() {
    
    return new Promise((resolve, reject) => {
        client.connect(function(err) {
            // assert.equal(null, err);
            console.log("Connected successfully to mongo server");
    
            db = client.db(dbName)
            
            resolve(db)
        })
    })
}


function collection(name) {
    const col = db.collection(name)

    function set(_id, data) {
        const {$set} = $.flatten(data)
        
        return col.updateOne({_id}, {$set}, {upsert: true})
    }
    
    function get(_id) {
        return col.findOne({_id})
    }
    
    function query(q) {
        console.log("X", q)
        // return Promise.resolve("X")
        return col.find(q).toArray()
        // return col.find(q).then((x,y) => {
        //     console.log(x, y)
        // })
    }

    function remove(_id) {
        return col.removeOne({_id})
    }

    return { set, get, query, remove }
}



function disconnect() {
    client.close();
}


module.exports = {
    connect, disconnect, collection
}