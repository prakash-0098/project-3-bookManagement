const bookSchema = require('../model/book.model');
const reviewSchema = require('../model/review.model'); 
const httpService = require('../services/http-errors.service');
const tokenService = require('../services/token.service');
const moment = require('moment');

const createBook = async (req, res) => {
    try {
        const data = req.body;
        const { userId, releasedAt } = data;
        if (!httpService.handleObjectId(userId)) {
            return res.status(400).send({
                status: false,
                message: 'Only Object Id is allowed !'
            });
        }
        if (releasedAt.length != 10) {
            return res.status(400).send({
                status: false,
                message: '[YYYY-MM-DD] format is allowed !'
            });
        }
        /**
         * moment.ISO_8601 is used to remove warning from terminal to prevent valid format of date
         * @isValid method return Boolean value
         */
        const validateDate = moment(moment(releasedAt, moment.ISO_8601).format('YYYY-MM-DD'), 'YYYY-MM-DD', true).isValid();
        if (!validateDate) {
            return res.status(400).send({
                status: false,
                message: '[YYYY-MM-DD] format is allowed !'
            });
        }
        const insertRes = await bookSchema.create(data);
        return res.status(201).send({
            status: true,
            message: 'Book created successfully !',
            data: insertRes
        });

    } catch (error) {
        httpService.handleError(res, error);
    }
}
const getBooks = async (req, res) => {
    try {
        const token = req.headers['access-token'];
        const decodedToken = await tokenService.verifyToken(res, token);

        const filterData = req.query;
        const key = Object.keys(filterData);
        if (key.length > 0) {
            const matchQuaryParams = ['userId', 'category', 'subcategory'];
            let status = false; 
            for(let i = 0; i < key.length; i++){
                if(matchQuaryParams.includes(key[i])){
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
                    message: `Only this query params are allowed ${matchQuaryParams}`
                });
            }
            
            if(filterData.userId){
                if (!httpService.handleObjectId(filterData.userId)) {
                    return res.status(400).send({
                        status: false,
                        message: 'Only Object Id is allowed !'
                    });
                }
            }
            filterData.isDeleted = false,
            filterData.deletedAt = null; 
            const fetchBooks = await bookSchema.find(filterData).select({
                _id: 1,
                title: 1,
                excerpt: 1,
                userId: 1,
                category: 1,
                releasedAt: 1,
                reviews: 1
            }).sort({
                title: 1
            });
            const filterRes = fetchBooks.filter((data) => {
                return data.userId == decodedToken.userId
            });
            if (filterRes.length == 0) {
                return res.status(403).send({
                    status: false,
                    message: 'You are not authorized !'
                });
            }
            return res.status(200).send({
                status: true,
                count: filterRes.length,
                data: filterRes
            });
        }
        else {
            const fetchBooks = await bookSchema.find({
                userId: decodedToken.userId,
                isDeleted: false,
                deletedAt: null
            }).select({
                _id: 1,
                title: 1,
                excerpt: 1,
                userId: 1,
                category: 1,
                releasedAt: 1,
                reviews: 1
            }).sort({
                title: 1
            });
            if (fetchBooks.length == 0) {
                return res.status(404).send({
                    status: false,
                    message: 'Books not found !'
                });
            }
            return res.status(200).send({
                status: true,
                count: fetchBooks.length,
                data: fetchBooks
            });
        }
    } catch (error) {
        return res.status(500).send({
            status: false,
            message: error.message
        });
    }
}

const getBooksByIdWithReviews = async (req, res)=>{
    try {
        const token = req.headers['access-token'];
        const decodedToken = await tokenService.verifyToken(res, token);

        const bookId = req.params.bookId; 
        /**
         * Handle @mongoDb Object Id wheather it in proper format or not with the help @handleObjectId method
         * of cumtom module which is define in @httpService file
         */
         if(!httpService.handleObjectId(bookId)){
            return res.status(400).send({
                status: false,
                message: 'Only Object Id is allowed !'
            });
        }
        const bookRes = await bookSchema.findById(bookId); 
        if(!bookRes){
            return res.status(404).send({
                status: false,
                message: 'Books not found !'
            });
        }
        if (bookRes.userId != decodedToken.userId) {
            return res.status(403).send({
                status: false,
                message: 'You are not authorized !'
            });
        }

        const reviewRes = await reviewSchema.find({
            bookId: bookId,
            isDeleted: false
        }); 

        /**
         * Here we cannot add extra property on bookRes which is return from mongoose, 
         * so we use @toObject method to covert it in a plain javascript Object
         */
         const allData = bookRes.toObject();
         allData.reviewsData = reviewRes;
 
         return res.status(200).send({
             status: true,
             message: 'Book Information',
             data: allData
         });
    } catch (error) {
        return res.status(500).send({
            status: false,
            message: error.message
        });
    } 
}

const updateByBookId = async (req, res) => {
    try {
        const token = req.headers['access-token'];
        const decodedToken = await tokenService.verifyToken(res, token);

        const bookId = req.params.bookId; 
        /**
         * Handle @mongoDb Object Id wheather it in proper format or not with the help @handleObjectId method
         * of cumtom module which is define in @httpService file
         */
        if(!httpService.handleObjectId(bookId)){
            return res.status(400).send({
                status: false,
                message: 'Only Object Id is allowed !'
            });
        }

        const data = req.body; 
        const key = Object.keys(data);
        const matchUpdateParams = ['title', 'excerpt', 'releasedAt', 'ISBN'];
            let status = false;
            for (let i = 0; i < matchUpdateParams.length; i++) {
                key.forEach((data)=>{
                        if (matchUpdateParams.indexOf(data.toString()) != -1) {
                        status = true;
                    }
                    else{
                        status = false; 
                    }
                }); 
            }
            if (!status) {
                return res.status(400).send({
                    status: false,
                    message: `Only these body params are allowed ${matchUpdateParams}`
                });
            }

        const bookRes = await bookSchema.findById(bookId); 
        if(!bookRes){
            return res.status(404).send({
                status: false,
                message: 'Books not found !'
            });
        }
        if(bookRes.isDeleted && !bookRes.deletedAt){
            return res.status(404).send({
                status: false,
                message: 'Books not found !'
            });
        }
        if(bookRes.userId != decodedToken.userId){
            return res.status(403).send({
                status: false,
                message: 'You are not authorized !'
            });
        }
        const updateRes = await bookSchema.findByIdAndUpdate(bookId, data); 
        return res.status(200).send({
            status: true,
            message: `${key.length} field updated successfully !`
        });

    } catch (error) {
        /**
         * Handle unique field from the database 
         * @code: 11000 is duplicate data which is return by @mongoose
         */
        if(error.code === 11000){
            const key = Object.keys(error['keyValue'])
            return res.status(400).send({
                status: false,
                message: `The ${key} value is already exist !`
            }); 
        }
        return res.status(500).send({
            status: false,
            message: error.message
        }); 
    }
}

const deleteBookById = async (req, res)=>{
    try {
        const token = req.headers['access-token'];
        const decodedToken = await tokenService.verifyToken(res, token);

        const bookId = req.params.bookId; 
        /**
         * Handle @mongoDb Object Id wheather it in proper format or not with the help @handleObjectId method
         * of cumtom module which is define in @httpService file
         */
        if(!httpService.handleObjectId(bookId)){
            return res.status(400).send({
                status: false,
                message: 'Only Object Id is allowed !'
            });
        }
        const bookRes = await bookSchema.findById(bookId); 
        if(!bookRes){
            return res.status(404).send({
                status: false,
                message: 'Books not found !'
            });
        }
        if(bookRes.userId != decodedToken.userId){
            return res.status(403).send({
                status: false,
                message: 'You are not authorized !'
            });
        }
        if(!bookRes.isDeleted && !bookRes.deletedAt){
            const deleteRes = await bookSchema.findByIdAndUpdate(bookId, {
                isDeleted: true,
                deletedAt: new Date()
            }, {
                new: true
            }); 
            return res.status(200).send({
                status: true,
                message: 'Book deleted successfully !',
                data: deleteRes
            });
        }
        else{
            return res.status(404).send({
                status: false,
                message: 'Book not found !'
            });
        }

    } catch (error) {
        return res.status(500).send({
            status: false,
            message: error.message
        }); 
    }
}

module.exports = {
    createBook,
    getBooks,
    getBooksByIdWithReviews,
    updateByBookId,
    deleteBookById
}