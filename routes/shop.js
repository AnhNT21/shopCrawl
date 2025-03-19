const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopController');

router.get('/:shop_id/allProduct', shopController.getAllProducts);
router.get('/:shop_id/allProductCached', shopController.getAllProductsCached);

module.exports = router;
