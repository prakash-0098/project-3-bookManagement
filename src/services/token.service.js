const jwt = require('jsonwebtoken'); 
require('dotenv').config(); 
const create = (userId)=>{
    return jwt.sign({
        userId: userId
    }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' }); 
}

const verify = (res, token)=>{
    try {
        jwt.verify(token, process.env.JWT_SECRET_KEY, (error, decodedToken)=>{
            if(error){
                return res.status(401).send({
                    status: false,
                    message: error.message
                });
            }
            return decodedToken
        }); 
    } catch (error) {
        return res.status(500).send({
            status: false,
            message: error.message
        });
    }
}

 

module.exports = {
    createToken: create,
    verifyToken: verify
}