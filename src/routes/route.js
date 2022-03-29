const express = require('express'); 
const router = express.Router(); 

const userController = require('../controller/user.controller');
const bookController = require('../controller/book.controller'); 
const reviewController = require('../controller/review.controller'); 

const authMiddleware = require('../middleware/auth.middleware');

router.post('/register', userController.userRegister); 
router.post('/login', userController.login); 

router.post('/book', authMiddleware.auth, bookController.createBook); 
router.get('/books', authMiddleware.auth, bookController.getBooks);
router.get('/books/:bookId', authMiddleware.auth, bookController.getBooksByIdWithReviews); 

router.put('/books/:bookId', authMiddleware.auth, bookController.updateByBookId); 
router.delete('/books/:bookId', authMiddleware.auth, bookController.deleteBookById); 

// router for review

router.post('/books/:bookId/review', authMiddleware.auth, reviewController.addReview); 
router.put('/books/:bookId/review/:reviewId', authMiddleware.auth, reviewController.updateReview);
router.delete('/books/:bookId/review/:reviewId', authMiddleware.auth, reviewController.deleteReview); 


module.exports = router; 