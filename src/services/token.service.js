const jwt = require('jsonwebtoken');
require('dotenv').config();
const create = (userId) => { 
    return jwt.sign({
        userId: userId
    }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });
}
/**
 * @jwt.verify(token, secretOrPublicKey, callback) callback is an Asynchronous so we use Promiss
 */
const verify = (res, token) => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, process.env.JWT_SECRET_KEY, (error, decodedToken) => {
            if (error) {
                return res.status(401).send({
                    status: false,
                    message: error.message
                });
            }
            else {
                resolve(decodedToken); 
            }
        });
    });
}



module.exports = {
    createToken: create,
    verifyToken: verify
}