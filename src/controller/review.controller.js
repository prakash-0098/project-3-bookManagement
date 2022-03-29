const reviewSchema = require('../model/review.model'); 
const bookSchema = require('../model/book.model'); 
const httpService = require('../services/http-errors.service');
const moment = require('moment');

const addReview = async (req, res)=>{
    try {
        const bookId = req.params.bookId; 
        const data = req.body; 
        const { reviewedAt } = data;
        
        if (!httpService.handleObjectId(bookId) || !httpService.handleObjectId(data.bookId)) {
            return res.status(400).send({
                status: false,
                message: 'Only Object Id is allowed !'
            });
        }
        
        const bookRes = await bookSchema.findById(bookId); 
        if(!bookRes){
            return res.status(404).send({
                status: false,
                message: 'Book not found'
            }); 
        }
        if(bookRes.isDeleted && !bookRes.deletedAt){
            return res.status(404).send({
                status: false,
                message: 'Book not found'
            }); 
        }
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
        const insertedRes = await reviewSchema.create(data); 
        const bookUpdateRes = await bookSchema.findByIdAndUpdate(bookId, {
           $inc:{
               reviews: +1
           }
        }, {
            new: true
        }); 
        return res.status(201).send({
            status: true,
            message: "Review inserted successfully !",
            data : bookUpdateRes
        });

    } catch (error) {
        httpService.handleError(res, error); 
    }
}

module.exports = {
    addReview
}