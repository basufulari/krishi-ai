import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  id: { type: String, required: true },
  authorName: { type: String, required: true },
  content: { type: String, required: true },
  timestamp: { type: String, required: true }
});

const postSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  authorName: { type: String, required: true },
  location: { type: String, default: 'Current Location' },
  content: { type: String, required: true },
  timestamp: { type: String, required: true },
  likes: { type: Number, default: 0 },
  likedBy: [{ type: String }], // Array of user phones/ids who liked
  comments: [commentSchema]
}, { timestamps: true });

export default mongoose.model('Post', postSchema);
