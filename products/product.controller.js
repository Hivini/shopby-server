const express = require('express');
const router = express.Router();
const productService = require('./product.service');

// routes
router.get('/getAllProductsByUser', getAllProducts);
router.post('/registerProduct', registerProduct);
router.delete('/deleteProduct', deleteProduct);

module.exports = router;

function getAllProducts(req, res, next) {
    productService.getAllProductsByUser(req.headers['email'])
        .then((products) => {
            console.log(products);
            if (products.length > 0)  res.json({successful: 1, products: products});
            else res.json({successful: 0});
        })
        .catch(err => {
            console.log(err);
            res.json({successful: 0});
        });
}

function registerProduct(req, res, next) {
    productService.registerProduct(req.body)
        .then((status) => res.json(status))
        .catch(err => {
            console.log(err);
            res.json({successful: 0});
        });
}

function deleteProduct(req, res, next) {
    productService.deleteProduct(req.headers['_id'])
        .then((status) => res.json(status))
        .catch(err => {
            console.log(err);
            res.json({successful: 0});
        });
}
