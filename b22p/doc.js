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



function set(collection, _id, data) {
    const {$set} = $.flatten(data)
    return db.collection(collection).updateOne({_id}, {$set}, {upsert: true})
}

function get(collection, _id) {
    return db.collection(collection).findOne({_id})
}

function query(collection, q) {
    return db.collection(collection).find(q).toArray()
}

function remove(collection, _id) {
    return db.collection(collection).removeOne({_id})
}

function disconnect() {
    client.close();
}


module.exports = {
    connect, disconnect, set, get, query, remove
}