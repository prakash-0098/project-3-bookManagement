const bookSchema = require('../model/book.model');
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
         * @ isValid() return Boolean value
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
    const token = req.headers['access-token'];
    const decodedToken = await tokenService.verifyToken(res, token);

    const filterData = req.query;
    const key = Object.keys(filterData);
    if (key.length > 0) {
        const matchQuaryParams = ['userId', 'category', 'subcategory'];
        let status = false;
        for (let i = 0; i < matchQuaryParams.length; i++) {
            if (matchQuaryParams.indexOf(key.toString()) != -1) {
                status = true;
            }
            else {
                status = false;
            }
        }
        if (!status) {
            return res.status(400).send({
                status: false,
                message: `Only this query params are allowed ${matchQuaryParams}`
            });
        }
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
}
module.exports = {
    createBook,
    getBooks
}