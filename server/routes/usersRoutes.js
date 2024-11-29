const express = require('express');
const router = express.Router();
const { searchUsers, deleteUser ,searchAuctionHistory} = require('../controllers/usersController');

router.get('/search', searchUsers);
router.get('/auction', searchAuctionHistory);
router.delete('/:userId', deleteUser);

module.exports = router;
