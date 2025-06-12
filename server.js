import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import asyncHandler from 'express-async-handler';
import cors from 'cors';

// Custom imports
import dbconnection from './model/dbconnection.js';
import Schema from './schema/dbschema.js'; // This is your User model

dotenv.config();

const app = express();
const port = process.env.PORT || 4001;

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: "*",
  })
);

dbconnection();

// Routes
app.get(
  '/',
  asyncHandler(async (req, res) => {
    const all = await Schema.find();
    res.status(200).json(all);
  })
);
app.get(
  '/by-clerk-id',
  asyncHandler(async (req, res) => {
    const { clerkUserId } = req.query;

    if (!clerkUserId) {
      return res.status(400).json({ error: 'clerkUserId is required' });
    }

    const user = await Schema.findOne({ clerkUserId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(user);
  })
);

// POST /users
app.post(
  '/users',
  asyncHandler(async (req, res) => {
    const { clerkUserId } = req.body;

    // Validate input
    if (!clerkUserId) {
      return res.status(400).json({ message: 'clerkUserId is required' });
    }

    // Check if user already exists
    let existingUser = await Schema.findOne({ clerkUserId });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const newUser = new Schema({ clerkUserId });
    await newUser.save();

    res.status(201).json(newUser);
  })
);

// PUT /users/:clerkUserId
app.put(
  '/users/:clerkUserId',
  asyncHandler(async (req, res) => {
    const { clerkUserId } = req.params;
    const updateData = req.body;

    const updatedUser = await Schema.findOneAndUpdate(
      { clerkUserId },
      { ...updateData, updatedAt: Date.now() },
      { new: true, runValidators: true, upsert: false }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(updatedUser);
  })
);

// Server
app.listen(port, () => {
  console.log(`Server listening at ${port}`);
});