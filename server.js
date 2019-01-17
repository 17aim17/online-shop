const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const objectID = require('mongodb').ObjectID
const errorController = require('./controllers/error');
const mongoConnect = require('./util/db')
const User = require('./models/user');
const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

app.use(bodyParser.urlencoded({
    extended: false
}));

app.use((req, res, next) => {
    const id =new objectID('5c3ef27b9cd4e61a00d00569')
    User.findById('5c3ef27b9cd4e61a00d00569').then((user) => {
        req.user = user 
        next()
    }).catch((e) => {
        console.log(e)
    })
})

app.use(express.static(path.join(__dirname, 'public')));

app.use('/admin', adminRoutes);

app.use(shopRoutes);

app.use(authRoutes);

app.use(errorController.get404);


mongoConnect(() => {
            const user = new User({
                name: 'Ashish',
                email: 'waesfdg',
                cart: {
                    items: []
                }
            })
            user.save().then(()=>{
                app.listen(3000, () => {
                    console.log('Server started');
                });
            })

})