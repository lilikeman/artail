const express = require('express');
const router = express.Router();
const { postItem, getAuctionItem } = require('../controllers/itemsController');

router.post('/', postItem);
router.get('/', getAuctionItem);

module.exports = router;
