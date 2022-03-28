const express = require('express'); 
const router = express.Router(); 

const userController = require('../controller/user.controller');
const bookController = require('../controller/book.controller'); 

const authMiddleware = require('../middleware/auth.middleware');

router.post('/register', userController.userRegister); 
router.post('/login', userController.login); 

router.post('/book', authMiddleware.auth, bookController.createBook); 


module.exports = router; 