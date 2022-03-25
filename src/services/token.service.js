const jwt = require('jsonwebtoken'); 
require('dotenv').config(); 
const create = (userId)=>{
    return jwt.sign({
        userId: userId
    }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' }); 
}

const verify = ()=>{
    
}

module.exports = {
    createToken: create,
    verifyToken: verify
}