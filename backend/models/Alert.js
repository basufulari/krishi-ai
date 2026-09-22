import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema({
  message: { type: String, required: true },
  timestamp: { type: String, required: true }
});

export default mongoose.model('Alert', alertSchema);
