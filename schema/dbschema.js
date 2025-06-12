import mongoose from 'mongoose';

const mySchema = new mongoose.Schema({
  clerkUserId: {
    type: String,
    required: true,
    unique: true,
  },
  email: { type: String },
  currency: { type: String },language: { type: String},
  age: { type: Number },
  gender: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Schema = mongoose.model('Budget', mySchema);
export default Schema;
