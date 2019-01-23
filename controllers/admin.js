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
    .catch(err => { 
      const error =new Error(err)
      error.httpStatusCode = 500
      return next(error)
    });
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
  const image = req.file;
  const price = req.body.price;
  const description = req.body.description;
  const userId = req.user

  if(!image){
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/edit-product',
      editing: false,
      hasError:true,
      product: {title,price,description},
      errorMessage: 'Attached file is not an image'
    });
  }  

  const errors = validationResult(req)
  if(!errors.isEmpty()){
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/edit-product',
      editing: false,
      hasError:true,
      product: {title,price,description},
      errorMessage: `${errors.array()[0].param} has ${errors.array()[0].msg}`
    });
  }

  const imageUrl = `/images/${image.filename}` 
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
      
      const error =new Error(err)
      error.httpStatusCode = 500
      return next(error)
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
    .catch(err => {  
      const error =new Error(err)
      error.httpStatusCode = 500
      return next(error)
     });
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const title = req.body.title;
  const price = req.body.price;
  const image = req.file;
  const description = req.body.description;
  const errors = validationResult(req)


  if(!errors.isEmpty()){
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      editing: true,
      hasError:false,
      product: {title,price,description},
      errorMessage: `${errors.array()[0].param} has ${errors.array()[0].msg}`
    });
  }


  Product.findById(prodId)
    .then(product => {
      if(product.userId.toString() !==req.user._id.toString()){ return res.redirect('/')}
      product.title = req.body.title
      product.price = req.body.price
        if(image){
          product.imageUrl = `/images/${image.filename}`  
        }
      product.description = req.body.description
      return product.save().then(result => {
        console.log('Product edited')
        res.redirect('/admin/products');
      })
    })    
    .catch(err => { 
      const error =new Error(err)
      error.httpStatusCode = 500
      return next(error)
     });
};

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.deleteOne({_id: prodId, userId:req.user._id })
    .then(() => {
      console.log('Product Deleted');
      res.redirect('/admin/products');
    })
    .catch(err => {  
      const error =new Error(err)
      error.httpStatusCode = 500
      return next(error)
    });
};