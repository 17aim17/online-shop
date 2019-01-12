const express = require('express')
const router = express.Router()
const path = require('path')

const adminData =require('./admin')
const rootDir = require('../helpers/path')
router.get('/', (req, res) => {
    console.log(adminData.products);
    res.sendFile(path.join(rootDir, 'views', 'shop.html'))
})

module.exports = router