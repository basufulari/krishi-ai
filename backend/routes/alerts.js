import express from 'express';
import Alert from '../models/Alert.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const alerts = await Alert.find().sort({ _id: -1 });
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

router.post('/', async (req, res) => {
  try {
    const newAlert = new Alert({ 
      message: req.body.message, 
      timestamp: req.body.timestamp || new Date().toLocaleString()
    });
    await newAlert.save();
    res.json({ success: true, alert: newAlert });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save alert' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || !String(message).trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const updated = await Alert.findByIdAndUpdate(
      req.params.id,
      {
        message: String(message).trim(),
        timestamp: req.body.timestamp || new Date().toLocaleString(),
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    res.json({ success: true, alert: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update alert' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Alert.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Alert not found' });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete alert' });
  }
});

export default router;
