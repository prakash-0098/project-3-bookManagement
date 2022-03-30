const reviewSchema = require('../model/review.model');
const bookSchema = require('../model/book.model');
const httpService = require('../services/http-errors.service');
const tokenService = require('../services/token.service');
const moment = require('moment');

const addReview = async (req, res) => {
    try {
        const bookId = req.params.bookId;
        const data = req.body;
        const { reviewedAt } = data;

        if (!httpService.handleObjectId(bookId)) {
            return res.status(400).send({
                status: false,
                message: 'Only Object Id is allowed !'
            });
        }

        const bookRes = await bookSchema.findById(bookId);
        if (!bookRes) {
            return res.status(404).send({
                status: false,
                message: 'Book not found'
            });
        }
        if (bookRes.isDeleted && !bookRes.deletedAt) {
            return res.status(404).send({
                status: false,
                message: 'Book not found'
            });
        }
        if(reviewedAt != undefined){
            if (reviewedAt.length != 10) {
                return res.status(400).send({
                    status: false,
                    message: '[YYYY-MM-DD] format is allowed !'
                });
            }
            /**
             * moment.ISO_8601 is used to remove warning from terminal to prevent valid format of date
             * @isValid method return Boolean value
             */
            const validateDate = moment(moment(reviewedAt, moment.ISO_8601).format('YYYY-MM-DD'), 'YYYY-MM-DD', true).isValid();
            if (!validateDate) {
                return res.status(400).send({
                    status: false,
                    message: '[YYYY-MM-DD] format is allowed !'
                });
            }
        }
        
        const insertedRes = await reviewSchema.create(data);
        const bookUpdateRes = await bookSchema.findByIdAndUpdate(bookId, {
            $inc: {
                reviews: +1
            }
        }, {
            new: true
        });
        return res.status(201).send({
            status: true,
            message: "Review inserted successfully !",
            data: bookUpdateRes
        });

    } catch (error) {
        httpService.handleError(res, error);
    }
}

const updateReview = async (req, res) => {
    try {
        const token = req.headers['access-token'];
        const decodedToken = await tokenService.verifyToken(res, token);

        const bookId = req.params.bookId;
        const reviewId = req.params.reviewId;
        const data = req.body;

        const key = Object.keys(data);
        const matchUpdateParams = ['review', 'rating', `reviewer's name`];
        let status = false;
        for(let i = 0; i < key.length; i++){
            if(matchUpdateParams.includes(key[i])){
                status = true; 
            } 
            else{
                status = false; 
                break; 
            }
        }
        if (!status) {
            return res.status(400).send({
                status: false,
                message: `Only these body params are allowed ${matchUpdateParams}`
            });
        }
        if(data.rating != undefined){
            if(!(data.rating >= 1 && data.rating <= 5)){
                return res.status(400).send({
                    status: false,
                    message: 'Rating range should be in between 1 to 5'
                }); 
            }
        }
        /**
         * Add the @reviewedBy property instead of @reviewer's name
         * and @delete the @reviewer's name from the object 
         */
        data.reviewedBy = data[`reviewer's name`];
        delete data[`reviewer's name`];

        if (!httpService.handleObjectId(bookId) || !httpService.handleObjectId(reviewId)) {
            return res.status(400).send({
                status: false,
                message: 'Only Object Id is allowed !'
            });
        }

        const bookRes = await bookSchema.findById(bookId);
        if (!bookRes) {
            return res.status(404).send({
                status: false,
                message: 'Book not found'
            });
        }
        if (bookRes.userId != decodedToken.userId) {
            return res.status(403).send({
                status: false,
                message: 'You are not authorized !'
            });
        }
        if (bookRes.isDeleted && !bookRes.deletedAt) {
            return res.status(404).send({
                status: false,
                message: 'Book not found'
            });
        }

        const reviewRes = await reviewSchema.findById(reviewId);
        if (!reviewRes) {
            return res.status(404).send({
                status: false,
                message: 'Review not found'
            });
        }
        if (reviewRes.isDeleted) {
            return res.status(404).send({
                status: false,
                message: 'Review not found'
            });
        }

        // update review document
        const updateRes = await reviewSchema.findByIdAndUpdate(reviewId, data);
        const allReviewsRes = await reviewSchema.find({
            bookId: bookId,
            isDeleted: false
        });
        
        /**
         * Here we cannot add extra property on bookRes which is return from mongoose, 
         * so we use @toObject method to covert it in a plain javascript Object
         */
        const allData = bookRes.toObject();
        allData.reviewsData = allReviewsRes;

        return res.status(200).send({
            status: true,
            message: 'update success',
            data: allData
        });

    } catch (error) {
        return res.status(500).send({
            status: false,
            message: error.message
        });
    }
}

const deleteReview = async (req, res) => {
    try {
        const token = req.headers['access-token'];
        const decodedToken = await tokenService.verifyToken(res, token);

        const bookId = req.params.bookId;
        const reviewId = req.params.reviewId;

        if (!httpService.handleObjectId(bookId) || !httpService.handleObjectId(reviewId)) {
            return res.status(400).send({
                status: false,
                message: 'Only Object Id is allowed !'
            });
        }

        const bookRes = await bookSchema.findById(bookId);
        if (!bookRes) {
            return res.status(404).send({
                status: false,
                message: 'Book not found'
            });
        }
        if (bookRes.userId != decodedToken.userId) {
            return res.status(403).send({
                status: false,
                message: 'You are not authorized !'
            });
        }
        if (bookRes.isDeleted && !bookRes.deletedAt) {
            return res.status(404).send({
                status: false,
                message: 'Book not found'
            });
        }

        const reviewRes = await reviewSchema.findById(reviewId);
        if (!reviewRes) {
            return res.status(404).send({
                status: false,
                message: 'Review not found'
            });
        }
        if (reviewRes.isDeleted) {
            return res.status(404).send({
                status: false,
                message: 'Review not found'
            });
        }
        const deleteRes = await reviewSchema.findByIdAndUpdate(reviewId, {
            isDeleted: true
        });
        const bookUpdateRes = await bookSchema.findByIdAndUpdate(bookId, {
            $inc: {
                reviews: -1
            }
        }, {
            new: true
        });
        return res.status(200).send({
            status: true,
            message: "Review deleted successfully !",
            data: bookUpdateRes
        });
    } catch (error) {
        return res.status(500).send({
            status: false,
            message: error.message
        }); 
    }
}

module.exports = {
    addReview,
    updateReview,
    deleteReview
}