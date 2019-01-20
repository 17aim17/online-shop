const express = require('express');

const {check} = require('express-validator/check')

const authController = require('../controllers/auth');

const isAuth = require('../middleware/is-auth')

const router = express.Router();

const User =require('../models/user')

router.get('/login', authController.getLogin);

router.get('/signup', authController.getSignup);

router.post('/login', [
    check('email').isEmail().normalizeEmail().withMessage('Please Enter a valid Email'),
    check('password','Password has to be valid.').isAlphanumeric().trim().isLength({min:6})
],
 authController.postLogin
);

router.post(
    '/signup',
    [
         check('email').isEmail().withMessage('Please Enter a valid Email').custom((value,{req})=>{
           return User.findOne({
                email: value
              }).then((doc) => {
                if (doc) {
                  return Promise.reject('E-mail Already Exists ,  Please try another')
                }
            })
         }).normalizeEmail() ,
         check('password','Password must be alphanumeric and atleast be 6 characters long').isAlphanumeric().trim().isLength({min:6}),
         check('confirmPassword').trim().custom((value,{req})=>{
             if(value!==req.body.password){
                 throw new Error('Password have to match')
             }
             return true
         })
    ],
     authController.postSignup
);

router.post('/logout', isAuth, authController.postLogout);

module.exports = router;