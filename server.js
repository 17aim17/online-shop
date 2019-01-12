const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const path = require('path')

const adminData = require('./routes/admin')
const shopRoutes = require('./routes/shop')


app.use(bodyParser.urlencoded({
    extended: false
}))
app.set('view engine', 'ejs')
app.set('views','views')
app.use(express.static(path.join(__dirname, 'public')))
app.use('/admin', adminData.routes)
app.use(shopRoutes)


app.use((req, res, next) => {
    res.status(404).sendFile(path.join(__dirname, 'views', '404.html'))
})

app.listen(3000, () => {
    console.log(`Server Started at port 3000`);
})