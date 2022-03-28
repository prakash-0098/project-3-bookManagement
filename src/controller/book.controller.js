const bookSchema = require('../model/book.model'); 
const httpService = require('../services/http-errors.service'); 
const moment = require('moment'); 

const createBook = async (req, res)=>{
    try{
        const data = req.body; 
        const { userId, releasedAt } = data; 
        if(!httpService.handleObjectId(userId)){
            return res.status(400).send({
                status: false,
                message: 'Only Object Id is allowed !'
            });
        } 
        if(releasedAt.length != 10){
            return res.status(400).send({
                status: false,
                message: '[YYYY-MM-DD] format is allowed !'
            });
        }
        /**
         * moment.ISO_8601 is used to remove warning from terminal to prevent valid format of date
         * @ isValid() return Boolean value
         */
        const validateDate = moment(moment(releasedAt, moment.ISO_8601).format('YYYY-MM-DD'),'YYYY-MM-DD',true).isValid(); 
        if(!validateDate){
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
        
    } catch(error){
        httpService.handleError(res, error); 
    }
}

module.exports = {
    createBook
}