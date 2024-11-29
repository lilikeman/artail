const express = require('express');
const router = express.Router();
const { getSalesHistory } = require('../controllers/salesController');

router.get('/:sellerId', getSalesHistory);

module.exports = router;
