const Product = require('../models/product');
const Order = require('../models/order');

const PDFDocument = require('pdfkit')
const fs =require('fs')
const path =require('path')

exports.getIndex = (req, res, next) => {
  Product.find({})
    .then(products => {
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/'
      });
    })
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
    });
};


exports.getProducts = (req, res, next) => {
  Product.find({})
    .then(products => {
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'All Products',
        path: '/products'
      });
    })
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
    });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      res.render('shop/product-detail', {
        product: product,
        pageTitle: product.title,
        path: '/products'
      });
    })
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
    });
};

exports.getCart = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
      const products = user.cart.items;
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: products
      });
    })
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
    });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then(product => {
      return req.user.addToCart(product);
    })
    .then(result => {
      res.redirect('/cart');
    })
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
    })
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .removeFromCart(prodId)
    .then(result => {
      res.redirect('/cart');
    })
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
    });
};

exports.postOrder = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
      const products = user.cart.items.map(i => {
        return {
          quantity: i.quantity,
          product: { ...i.productId._doc
          }
        }
      });
      const order = new Order({
        user: {
          email: req.user.email,
          userId: req.user._id
        },
        products: products
      })
      return order.save()
    })
    .then(result => {
      return req.user.clearCart()
    })
    .then(result => {
      res.redirect('/orders');
    })
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
    });
};

exports.getOrders = (req, res, next) => {
  Order.find({
      "user.userId": req.user._id
    })
    .then(orders => {
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders: orders
      });
    })
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
    });
};

exports.getInvoice =(req,res,next)=>{
    const orderId =req.params.orderId;
    Order.findById(orderId).then(order=>{
      if(!order){
        return next(new Error('No order Found'))
      }
      if(order.user.userId.toString() !== req.user._id.toString()){
        return next(new Error('Unauthorized'))
      }

      const invoiceName = `invoice-${orderId}.pdf`;
      const invoicePath = path.join('data','invoices',invoiceName)
      
      const pdfdoc =new PDFDocument();
      res.setHeader('Content-type','application/pdf')
      res.setHeader('Content-Disposition',`inline; filename=${invoiceName}`)
      pdfdoc.pipe(fs.createWriteStream(invoicePath))
      pdfdoc.pipe(res)
      pdfdoc.fontSize(26).text('Invoice',{
        underline:false
      })
      pdfdoc.text('----------------')
      let totalPrice =0
      order.products.forEach((prod)=>{
        totalPrice+=prod.quantity * prod.product.price
        pdfdoc.fontSize(15).text(`${prod.product.title} - ${prod.quantity} X $${prod.product.price}`)
      })
      pdfdoc.text('----------------')
      pdfdoc.fontSize(20).text(`Total Price = $${totalPrice}`)
      pdfdoc.end()
      // preloading file
      // fs.readFile(invoicePath ,(err,data)=>{
      //   if(err){
      //     return next(new Error(err))
      //   }
      //   res.setHeader('Content-type','application/pdf')
      //   res.setHeader('Content-Disposition',`inline; filename=${invoiceName}`)
      //   res.setHeader('Content-Disposition',`attachment; filename=${invoiceName}`)
      //   res.send(data)
  
      // })

      //streaming
      // const file = fs.createReadStream(invoicePath)
      // res.setHeader('Content-type','application/pdf')
      // res.setHeader('Content-Disposition',`inline; filename=${invoiceName}`)
      // file.pipe(res) // response is a writeable stream  

    }).catch(err=>{
      return next(new Error(err))
    })

}