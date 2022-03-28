const tokenService = require('../services/token.service'); 
const userSchema = require('../model/user.model'); 

const auth = async (req, res, next)=>{
    try {
        const token = req.headers['access-token']; 
        if(!token){
            return res.status(400).send({
                status: false,
                message: 'Token must be required !'
            }); 
        }
        const decodedToken = tokenService.verifyToken(res, token); 
        if(decodedToken != undefined){
            const userRes = await userSchema.findById(decodedToken.userId); 
            if(!userRes){
                return res.status(401).send({
                    status: false,
                    message: 'Unauthenticated !'
                });
            }
            next(); 
        }
    } catch (error) {
        return res.status(500).send({
            status: false,
            message: error.message
        });
    }
}

module.exports = {
    auth
}