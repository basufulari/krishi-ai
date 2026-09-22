import express from 'express';
import Post from '../models/Post.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

router.post('/', async (req, res) => {
  try {
    const newPost = new Post(req.body);
    await newPost.save();
    res.json({ success: true, post: newPost });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save post' });
  }
});

router.post('/:id/comments', async (req, res) => {
  try {
    const post = await Post.findOne({ id: req.params.id });
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    post.comments.push(req.body);
    await post.save();
    
    res.json({ success: true, post });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

router.post('/:id/like', async (req, res) => {
  try {
    const { phone } = req.body; // use phone or id to know who liked it
    const post = await Post.findOne({ id: req.params.id });
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const likedIndex = post.likedBy.indexOf(phone);
    if (likedIndex > -1) {
      post.likedBy.splice(likedIndex, 1);
      post.likes -= 1;
    } else {
      post.likedBy.push(phone);
      post.likes += 1;
    }
    await post.save();

    res.json({ success: true, post });
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle like' });
  }
});

export default router;
