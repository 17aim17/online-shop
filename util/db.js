const mongoose =require('mongoose')
const {keys} =require('../config/keys')
const mongoConnect = (cb) => {
    mongoose.connect(`${keys.MONGODB_URI}?retryWrites=true`, {
        useNewUrlParser: true
    })
        .then(result => {
            console.log('Connected to MongoDB')
            cb()
        })
        .catch(err => console.log(err))
}

module.exports = mongoConnect