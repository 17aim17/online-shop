const  getDb = require('../util/db').getDb
const ObjectID =require('mongodb').ObjectID
class Product {
  constructor(title, imageUrl, description, price,id) {
    this.title = title;
    this.imageUrl = imageUrl;
    this.price = price;
    this.description = description;    
    this._id = new ObjectID(id)
  }

  // for save and update
  save() {
    const db = getDb() // database
    let dbOp;
    if(this._id) {
      dbOp = db.collection('products').updateOne({_id: this._id},{$set:this})
    }else{
      dbOp = db.collection('products').insertOne(this)
    }
    return dbOp.then(result => console.log(result)).
          catch(err => console.log(err)) // table
  }

  static findById(prodId) {
    const db = getDb() // database
    return db.collection('products').findOne({_id:new ObjectID(prodId)})
      .then(product => {
        return product
      }).
    catch(err => console.log(err)) // table
  }

  static fetchAll() {
    const db = getDb() // database
    return db.collection('products').find().toArray()
      .then(products => {
        return products
      }).
    catch(err => console.log(err)) // table
  }

  

};

module.exports = Product