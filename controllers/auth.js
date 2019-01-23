const User = require('../models/user');
const bcrypt = require('bcryptjs')
const { validationResult} = require('express-validator/check')
const nodemailer = require('nodemailer')
const sendgridTransport = require('nodemailer-sendgrid-transport')
const {keys} =require('../config/keys')
const  transporter = nodemailer.createTransport(sendgridTransport({
  auth:{
    api_key: keys.API_KEY
  }
}))

exports.getLogin = (req, res, next) => {
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    errorMessage: null,
    oldInput:{
      email:'',
      password:''
    }
  });
};

exports.getSignup = (req, res, next) => {
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    errorMessage: null,
    oldInput:{
      email:'',
      password:'',
      confirmPassword:''
    }
  });
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email
  const password = req.body.password

  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    console.log(errors.array());

    return res.status(422).render('auth/signup', {
      path: '/signup',
      pageTitle: 'Signup',
      errorMessage: errors.array(),
      oldInput:{
        email:email,
        password:password,
        confirmPassword:req.body.confirmPassword
      }
    });
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
    return  transporter.sendMail({
        to:email,
        from:'no-reply@ashish.com',
        subject:'Sign up Succeeded',
        html:` <h1> You successfully signed up<h1>`
      })
    })
    .catch(e => console.log(e))

};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password

  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render('auth/login', {
      path: '/login',
      pageTitle: 'Login',
      errorMessage: errors.array(),
      oldInput:{
        email:email,
        password:password
      }
    });
  }
  User.findOne({
      email: email
    })
    .then((user) => {
      if (!user) {
        return res.status(422).render('auth/login', {
          path: '/login',
          pageTitle: 'Login',
          errorMessage: errors.array(),
          oldInput:{
            email:email,
            password:password
          }
        });
      }
      bcrypt.compare(password, user.password).then(result => {
          if (result) {
            req.session.isLoggedIn = true
            req.session.user = user;
            return req.session.save(err => {
              res.status(200).redirect('/')
            })

          }
          return res.status(422).render('auth/login', {
            path: '/login',
            pageTitle: 'Login',
            errorMessage: errors.array(),
            oldInput:{
              email:email,
              password:password
            }
          });
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