const mongodb = require('mongodb')
const MongoClient = mongodb.MongoClient;
let _db;
const mongoConnect = (cb) => {
    MongoClient.connect('mongodb+srv://penzero:9Ihn71bHqJF0Y3r4@cluster0-ltbmp.mongodb.net/shop?retryWrites=true', {
            useNewUrlParser: true
        })
        .then(client => {
            console.log('Connected to MongoDB')
            _db = client.db()
            cb()
        })
        .catch(err => console.log(err))
}

const getDb =()=>{
    if(_db) {
        return _db
    }
    throw  'No database found'
}
module.exports ={
    mongoConnect,
    getDb
}
