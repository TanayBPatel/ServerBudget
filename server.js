import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import asyncHandler from 'express-async-handler';
import cors from 'cors';

// Custom imports
import dbconnection from './model/dbconnection.js';
import Schema from './schema/dbschema.js';

dotenv.config();

const app = express();
const port = process.env.PORT ||  4001;

// Middleware
app.use(express.json());
app.use(
    cors({
      origin: "http://localhost:3000",
      credentials: true,
    })
  );

// const __dirname = path.resolve();

// // Serve static files in production
// if (process.env.NODE_ENV === 'production') {
//   app.use(express.static(path.join(__dirname, '../frontend/build')));

//   app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname, '../frontend', 'build', 'index.html'));
//   });
// }

// Database connection
dbconnection();

// Routes
app.get(
  '/',
  asyncHandler(async (req, res) => {
    const all = await Schema.find();
    res.status(200).json(all);
  })
);

app.post(
  '/',
  asyncHandler(async (req, res) => {
    const { name, latitude, longitude } = req.body;
    const newPost = new Schema({
      name,
      latitude,
      longitude,
    });

    await newPost.save();
    res.status(201).json(newPost);
  })
);

app.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const contact = await Schema.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ message: 'No location found' });
    }

    contact.name = req.body.name || contact.name;
    contact.latitude = req.body.latitude || contact.latitude;
    contact.longitude = req.body.longitude || contact.longitude;

    await contact.save();
    res.status(200).json(contact);
  })
);

// Server
app.listen(port, () => {
  console.log(`Server listening at ${port}`);
});
