const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const objectID = require('mongodb').ObjectID
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf')
const flash = require('connect-flash')
const {keys} =require('./config/keys')

const errorController = require('./controllers/error');
const mongoConnect = require('./util/db')
const User = require('./models/user');
const app = express();
const csrfProtection = csrf()

const store = new MongoDBStore({
    uri: keys.MONGODB_URI,
    collection: 'sessions'
})

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({
    extended: false
}));
// configure mongodb store for session here as well
app.use(session({
    secret:  keys.SECERET,
    resave: false,
    saveUninitialized: false,
    store: store
}))

app.use(csrfProtection)

app.use(flash())
// so i get complete user model as session.user gives us only data
app.use((req, res, next) => {
    if (!req.session.user) {
        return next();
    }
    User.findById(req.session.user._id)
        .then(user => {
            req.user = user;
            next();
        })
        .catch(err => console.log(err));
});

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn
    res.locals.csrfToken = req.csrfToken()
    next()
})

// Routes start here

app.use('/admin', adminRoutes);

app.use(shopRoutes);

app.use(authRoutes);

app.use(errorController.get404);


mongoConnect(() => {

    app.listen(3000, () => {
        console.log('Server started');
    });

})