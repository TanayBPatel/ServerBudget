import mongoose from 'mongoose';

const mySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  latitude: {
    type: String,
    required: true,
  },
  longitude: {
    type: String,
    required: true,
  },
});

const Schema = mongoose.model('Models', mySchema);
export default Schema;
