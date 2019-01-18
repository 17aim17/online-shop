const User = require('../models/user');
const bcrypt = require('bcryptjs')

exports.getLogin = (req, res, next) => {
  let message = req.flash('error')
  if (message.length > 0) {
    message = message[0]
  } else {
    message = null
  }
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    errorMessage: message
  });
};

exports.getSignup = (req, res, next) => {
  let message = req.flash('error')
  if (message.length > 0) {
    message = message[0]
  } else {
    message = null
  }
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    errorMessage:message
  });
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email
  const password = req.body.password
  const confirmPassword = req.body.confirmPassword

  User.findOne({
      email: email
    }).then((doc) => {
      if (doc) {
        req.flash('error', 'User with that email exists already')
        return res.redirect('/signup')
      }
      const user = new User({
        email: email,
        password: password,
        cart: {
          items: []
        }
      })

      user.save().then((result) => {
        res.redirect('/login')
      })

    })
    .catch(e => console.log(e))

};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password
  User.findOne({
      email: email
    })
    .then((user) => {
      if (!user) {
        req.flash('error', 'Invalid email or password')
        return res.redirect('/login')
      }
      bcrypt.compare(password, user.password).then(result => {
          if (result) {
            req.session.isLoggedIn = true
            req.session.user = user;
            return req.session.save(err => {
              res.status(200).redirect('/')
            })

          }
          req.flash('error', 'Invalid email or password')
          return res.redirect('/login')
        })
        .catch(e => console.log(e))

    }).catch(e => console.log(e))
}

exports.postLogout = (req, res, next) => {
  req.session.isLoggedIn = null
  req.session.user = null
  req.session.destroy((err) => {
    res.redirect('/login')
  });
}