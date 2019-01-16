const mongoose =require('mongoose')
const mongoConnect = (cb) => {
    mongoose.connect('mongodb+srv://penzero:9Ihn71bHqJF0Y3r4@cluster0-ltbmp.mongodb.net/shop?retryWrites=true', {
        useNewUrlParser: true
    })
        .then(result => {
            console.log('Connected to MongoDB')
            cb()
        })
        .catch(err => console.log(err))
}

module.exports = mongoConnect