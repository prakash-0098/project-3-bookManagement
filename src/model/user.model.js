const mongoose = require('mongoose'); 
const IsEmail = require('isemail');

const userSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'The title field is required'],
        enum: ["Mr", "Mrs", "Miss"]
    },
    name: {
        type: String,
        required: [true, 'The name field is required']
    },
    phone: {
        type: String,
        required: [true, 'The phone field is required'],
        unique: true,
        match: [/^[6789]\d{9}$/, 'The Phone number must be 10 digits and only Indian numbers are allowed']
    },
    email:{
        type: String,
        required: [true, 'The email field is required'],
        unique: true,
        validate: {
           validator: (data)=>{
               return IsEmail.validate(data); 
           },
           message: 'Enter the valid Email'
        }
    },
    password: {
        type: String,
        required: [true, 'The password field is required'],
        minlength: [8, 'The minimum Password length should be 8'],
        maxlength: [15, 'The minimum Password length should be 15']
    },
    address: {
        street: String,
        city: String,
        pincode: String
    }
},{
    timestamps: true
}); 


module.exports = mongoose.model('User', userSchema); 