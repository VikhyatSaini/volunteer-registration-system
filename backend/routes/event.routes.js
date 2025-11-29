const express = require('express');
const router = express.Router();
const {
  createEvent,
  getAllEvents,
  getEventById,
  registerForEvent,
  unregisterForEvent,
  updateEvent, 
  deleteEvent, 
  getVolunteersForEvent,
} = require('../controllers/event.controller');
const { submitHours } = require('../controllers/hourlog.controller');
const { protect } = require('../middleware/auth.middleware');
const { isAdmin } = require('../middleware/admin.middleware');
const upload = require('../config/cloudinary');

// --- Public Routes ---
router.get('/', getAllEvents); // GET /api/events
router.get('/:id', getEventById); // GET /api/events/123

// --- Private Routes (Protected) ---
// We'll let any logged-in user create an event for now
// In Phase 3, we'll add 'admin' middleware here
router.post('/', protect, isAdmin, upload.single('image'), createEvent); // POST /api/events
router.put('/:id', protect, isAdmin, updateEvent);
router.delete('/:id', protect, isAdmin, deleteEvent); 
router.get('/:id/volunteers', protect, isAdmin, getVolunteersForEvent);

router.post('/:id/register', protect, registerForEvent); // POST /api/events/123/register
router.delete('/:id/unregister', protect, unregisterForEvent); // DELETE /api/events/123/unregister

router.post('/:id/loghours', protect, submitHours);

module.exports = router;