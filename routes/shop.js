const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopController');

router.get('/:shop_username/allProduct', shopController.getAllProducts);
router.get('/:shop_username/allProductCached', shopController.getAllProductsCached);
router.get('/:shop_username/getItem', shopController.getProductDetail);

module.exports = router;
