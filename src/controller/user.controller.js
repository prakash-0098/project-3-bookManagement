const userSchema = require('../model/user.model'); 
const httpService = require('../services/http-errors.service');
const tokenService = require('../services/token.service');
const IsEmail = require('isemail'); 
const bcrypt = require('bcrypt'); 

const userRegister = async (req, res)=>{
    try {
        const data = req.body; 
        const dataRes = await userSchema.create(data); 
        return res.status(201).send({
            status: true,
            message: 'Data inserted successfully !',
            data: dataRes
        }); 
    } catch (error) {
        httpService.handleError(res, error); 
    }
}

const login = async (req, res)=>{
    try {
        const { email, password } = req.body; 
        if(!email || !password){
            return res.status(400).send({
                status: false,
                message: 'Email and Pasword both are compulsary !' 
            }); 
        }
        if(!IsEmail.validate(email)){
            return res.status(400).send({
                status: false,
                message: `${email} is not a valid Email Id !`
            });
        }
        const emailRes = await userSchema.findOne({email: email});  
        if(!emailRes){
            return res.status(404).send({
                status: false,
                message: 'Invalid username and password !' //wrong email
            }); 
        }
        bcrypt.compare(password, emailRes.password).then((result)=>{
            if(!result){
                return res.status(404).send({
                    status: false,
                    message: 'Invalid username and password !' //wrong password
                }); 
            }
            const token = tokenService.createToken(emailRes._id); 
            return res.status(200).send({
                status: true,
                message: token
            });
        }).catch((error)=>{
            return res.status(500).send({
                status: false,
                message: error.message
            }); 
        }); 
    } catch (error) {
        return res.status(500).send({
            status: false,
            message: error.message
        }); 
    }
}

module.exports = {
    userRegister,
    login
}

