const User = require('../models/user')

const isAuth = (req, res, next) => {
   if(req.session.isLoggedIn){
        next()
   }else{
       return res.redirect('/login')
   }
  
}

module.exports =isAuth