const Product = require('../models/product');
const { validationResult} = require('express-validator/check')

exports.getProducts = (req, res, next) => {
  Product.find({userId:req.user._id}).populate('userId')
    .then(products => {
      res.render('admin/products', {
        prods: products,
        pageTitle: 'Admin Products',
        path: '/admin/products'
      });
    })
    .catch(err => console.log(err));
};


exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
    hasError:false,
    errorMessage: null,
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  const userId = req.user

  const errors = validationResult(req)
  if(!errors.isEmpty()){
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/edit-product',
      editing: false,
      hasError:true,
      product: {title,imageUrl,price,description},
      errorMessage: errors.array()[0].msg
    });
  }
  const product = new Product({
    title,
    price,
    description,
    imageUrl,
    userId
  });
  product
    .save()
    .then(result => {
      console.log('Created Product');
      res.redirect('/admin/products');
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      if (!product) {
        return res.redirect('/');
      }
      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: editMode,
        hasError:false,
        product: product,
        errorMessage: null,
      });
    })
    .catch(err => console.log(err));
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const title = req.body.title;
  const price = req.body.price;
  const imageUrl = req.body.imageUrl;
  const description = req.body.description;
  const errors = validationResult(req)
  if(!errors.isEmpty()){
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      editing: true,
      hasError:false,
      product: {title,imageUrl,price,description},
      errorMessage: errors.array()[0].msg
    });
  }
  Product.findById(prodId)
    .then(product => {
      if(product.userId.toString() !==req.user._id.toString()){ return res.redirect('/')}
      product.title = req.body.title
      product.price = req.body.price
      product.imageUrl = req.body.imageUrl
      product.description = req.body.description
      return product.save().then(result => {
        res.redirect('/admin/products');
      })
    })    
    .catch(err => console.log(err));
};

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.deleteOne({_id: prodId, userId:req.user._id })
    .then(() => {
      console.log('Product Deleted');
      res.redirect('/admin/products');
    })
    .catch(err => console.log(err));
};