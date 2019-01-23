const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const objectID = require('mongodb').ObjectID
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf')
const flash = require('connect-flash')
const multer = require('multer')


const {
    keys
} = require('./config/keys')

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
app.use('/images',express.static(path.join(__dirname, 'images')));

app.use(bodyParser.urlencoded({
    extended: false
}));

// Multer setup
const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images')
    },
    filename: (req, file, cb) => {
        const type = file.mimetype.split('/')[1]      
        cb(null, `${file.fieldname}-${Date.now()}.${type}`)
    }
})

const fileFilter =(req,file,cb)=>{
    if(file.mimetype=== 'image/png' || file.mimetype=== 'image/jpg' ||file.mimetype=== 'image/jpeg'){
        cb(null,true)
    }else{
        cb(null,false)
    }
}
app.use(multer({
    storage: fileStorage,
    fileFilter: fileFilter
}).single('image')) // 'image' the name of the form input field

// configure mongodb store for session here as well
app.use(session({
    secret: keys.SECERET,
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
            if (!user) {
                next()
            }
            req.user = user;
            next();
        })
        .catch(err => {
            next(new Error(err))
        });
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

app.get('/500', errorController.get500)

app.use(errorController.get404);

app.use((error, req, res, next) => {
    // res.status(500).render('500', {
    //     pageTitle: 'Error!',
    //     path: '/500',
    //     isAuthenticated: req.session.isLoggedIn
    // });
    res.redirect('/500')
})

mongoConnect(() => {

    app.listen(3000, () => {
        console.log('Server started');
    });

})