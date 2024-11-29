const express = require('express');
const router = express.Router();
const { purchaseItem } = require('../controllers/purchaseController');

router.post('/', purchaseItem);

module.exports = router;
