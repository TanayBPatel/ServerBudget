const express= require('express');
const app= express();
require('dotenv').config();
const port =  process.env.PORT || 3001;
const dbconnection = require('./model/dbconnection')
const Schema = require("./schema/dbschema.js");
const asyncHandler = require("express-async-handler");
const cors = require('cors');
dbconnection();

app.use(express.json())
app.use(cors({ origin: '*' })); 
app.get('/',asyncHandler(async(req,res)=>{
    const all = await Schema.find();
    res.status(200).json(all);
}))

app.post('/',asyncHandler(async(req,res)=>{
    const { name, latitude, longitude } = req.body;
    const newPost = new Schema({
        name,
        latitude,
        longitude,
    });

    await newPost.save();
    res.status(201).json(newPost);
}))

app.put('/:id',asyncHandler(async(req,res)=>{
    const putContact = await Schema.findById(req.params.id);
    if (!putContact) {
        return res.status(404).json({ message: "No location found" });
    }

    contact.name = req.body.name || contact.name;
    contact.latitude = req.body.latitude || contact.latitude;
    contact.longitude = req.body.longitude || contact.longitude;

    await contact.save();
    res.status(200).json(contact);
}))


// const getContact = asyncHandler ( async(req,res)=>{

//     const contact = await ContactsBackend.find({user_id: req.user.id});
//     res.status(200).json(contact);
// });

// const getAContact = asyncHandler(async (req, res) => {
//     const contact = await ContactsBackend.findById(req.params.id);
//     if (!contact) {
//         return res.status(404).json({ message: "Contact not found" });
//     }
//     res.status(200).json(contact);
// });


// const postContact = asyncHandler(async (req, res) => {
//     const { name, phone, email } = req.body;
//     const newContact = new ContactsBackend({
//         name,
//         phone,
//         email,
//         user_id : req.user.id
//     });

//     await newContact.save();
//     res.status(201).json(newContact);
// });


// const putContact = asyncHandler(async (req, res) => {
//     const contact = await ContactsBackend.findById(req.params.id);
//     if (!contact) {
//         return res.status(404).json({ message: "Contact not found" });
//     }

//     contact.name = req.body.name || contact.name;
//     contact.phone = req.body.phone || contact.phone;
//     contact.email = req.body.email || contact.email;

//     await contact.save();
//     res.status(200).json(contact);
// });


// const deleteContact = asyncHandler(async (req, res) => {
//     const contact = await ContactsBackend.findById(req.params.id);
//     if (!contact) {
//         return res.status(404).json({ message: "Contact not found" });
//     }

//     await ContactsBackend.findByIdAndDelete(req.params.id);
//     res.status(200).json({ message: "Contact deleted" });
// });


// module.exports = {getAContact , getContact , postContact, putContact , deleteContact};

app.listen(port ,()=>{
    console.log(`Server listening at ${port} `)
} )