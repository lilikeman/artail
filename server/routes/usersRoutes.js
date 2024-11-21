const express = require('express');
const router = express.Router();
const { searchUsers, deleteUser } = require('../controllers/usersController');

router.get('/search', searchUsers);
router.delete('/:userId', deleteUser);

module.exports = router;
