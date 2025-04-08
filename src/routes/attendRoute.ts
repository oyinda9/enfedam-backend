import express from 'express';

const router = express.Router();

// Ensure the callback function is properly defined
router.post('/attendance', (req, res) => {
  res.json({ message: 'Attendance recorded' });
});

export default router;
