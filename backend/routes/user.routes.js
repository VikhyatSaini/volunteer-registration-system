const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser, // <--- Added this import
  getUserProfile,
  updateUserProfile,
  getMyRegisteredEvents,
  getAllUsers,
  updateUserStatus,
} = require('../controllers/user.controller');
const { getMyHours } = require('../controllers/hourlog.controller');
const { protect } = require('../middleware/auth.middleware');
const { isAdmin } = require('../middleware/admin.middleware');

// Import Cloudinary/Multer Config
const upload = require('../config/cloudinary'); 

// --- Public Routes ---
router.post('/register', registerUser);
router.post('/login', loginUser); // <--- Added Login Route

// --- Private Routes ---
router.get('/profile', protect, getUserProfile);

// Update Profile: 'image' matches the name used in Frontend formData.append('image', file)
router.put('/profile', protect, upload.single('image'), updateUserProfile);

router.get('/my-events', protect, getMyRegisteredEvents);
router.get('/my-hours', protect, getMyHours);

// --- Admin Routes ---
router.get('/', protect, isAdmin, getAllUsers);
router.put('/:id/status', protect, isAdmin, updateUserStatus);

module.exports = router;