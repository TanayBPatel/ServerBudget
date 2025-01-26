const mongoose = require('mongoose');
require('dotenv').config();
const connection = async ()=>{
    try{
        const connect = await mongoose.connect(process.env.CONNECTION_STRING)
        console.log("Connected to Database");
    }
    catch(err){
        console.log(err);
        process.exit(1);
    }
}

module.exports = connection;