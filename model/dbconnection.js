import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connection = async () => {
  try {
    await mongoose.connect(process.env.CONNECTION_STRING);
    console.log('Connected to Database');
  } catch (err) {
    console.error('Database connection failed:', err);
    process.exit(1);
  }
};

export default connection;
