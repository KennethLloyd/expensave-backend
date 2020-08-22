const express = require('express');
const authenticate = require('../middleware/authenticate');
const { categoryController } = require('../controllers');

const router = new express.Router();

router.post('/categories', authenticate, categoryController.addCategory);
router.get('/categories', authenticate, categoryController.getCategories);

module.exports = router;
