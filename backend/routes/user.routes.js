const express = require('express');
const router = express.Router();
const {
  registerUser,
  getUserProfile,
  updateUserProfile,
  getMyRegisteredEvents,
  getAllUsers,
  updateUserStatus,
} = require('../controllers/user.controller');
const { getMyHours } = require('../controllers/hourlog.controller');
const { protect } = require('../middleware/auth.middleware');
const { isAdmin } = require('../middleware/admin.middleware');
const upload = require('../config/cloudinary');

// Public route
router.post('/register', registerUser);

// Private routes (all use the 'protect' middleware)
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, upload.single('image'), updateUserProfile);
router.get('/my-events', protect, getMyRegisteredEvents);
router.get('/', protect, isAdmin, getAllUsers);
router.put('/:id/status', protect, isAdmin, updateUserStatus);

router.get('/my-hours', protect, getMyHours);

module.exports = router;