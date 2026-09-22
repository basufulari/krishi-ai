import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  pin: { type: String, required: true }, // we will store hashed pin
  role: { type: String, enum: ['farmer', 'admin'], default: 'farmer' },
}, { timestamps: true });

export default mongoose.model('User', userSchema);
