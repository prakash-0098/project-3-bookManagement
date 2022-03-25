const express = require('express'); 
require('dotenv').config(); 
const bodyParser = require('body-parser'); 
const mongoose = require('mongoose'); 
const router = require('./routes/route'); 

const app = express(); 

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));  

mongoose.connect(process.env.MONGODB_CLUSTER).then(()=>{
    console.log("Mongodb is connected !"); 
}).catch((error)=>{
    console.log(error)
});

app.use('/', router); 

app.listen(process.env.PORT || 3000, ()=>{
    console.log(`Server is running on Port ${process.env.PORT || 3000}`); 
}); 