const express = require('express');
const router = express.Router();
const { getRankings } = require('../controllers/rankingsController');

router.get('/', getRankings);

module.exports = router;
