const mongoose = require('mongoose')
const bcrypt =require('bcryptjs')
const UserSchema = new mongoose.Schema({

  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  cart: {
    items: [{
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        require: true
      },
      quantity: {
        type: Number,
        required: true
      }
    }]
  }

}, {
  timestamps: true
})

UserSchema.methods.addToCart = function (product) {
  const cartProductIndex = this.cart.items.findIndex(cp => {
    return cp.productId.toString() === product._id.toString();
  });
  let newQuantity = 1;
  const updatedCartItems = [...this.cart.items];

  if (cartProductIndex >= 0) {
    newQuantity = this.cart.items[cartProductIndex].quantity + 1;
    updatedCartItems[cartProductIndex].quantity = newQuantity;
  } else {
    updatedCartItems.push({
      productId: product._id,
      quantity: newQuantity
    });
  }
  const updatedCart = {
    items: updatedCartItems
  };
  this.cart = updatedCart;
  return this.save();
};

UserSchema.methods.removeFromCart = function (productId) {
  const updatedCartItems = this.cart.items.filter(item => {
    return item.productId.toString() !== productId.toString()
  })
  this.cart.items = updatedCartItems
  return this.save()
}

UserSchema.methods.clearCart = function () {
  this.cart = {
    items: []
  }
  return this.save()
}


UserSchema.pre('save',function(next){
  let user =this;
    if(user.isModified('password')){
      bcrypt.genSalt(12,(err ,salt)=>{
          bcrypt.hash(user.password ,salt, (err,hash)=>{
            user.password =hash   
            next();   
          })
      })
    }else{
      next();
    }
})

module.exports = mongoose.model('User', UserSchema);