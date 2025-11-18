const Event = require('../models/event.model');
const Registration = require('../models/registration.model');
const mongoose = require('mongoose');

// @desc    Create a new event
// @route   POST /api/events
// @access  Private (will be Admin in Phase 3, but Private for now)
const createEvent = async (req, res) => {
  const { title, description, date, location, slotsAvailable } = req.body;

  try {
    const event = new Event({
      title,
      description,
      date,
      location,
      slotsAvailable,
      createdBy: req.user._id, // req.user comes from our 'protect' middleware
    });

    const createdEvent = await event.save();
    res.status(201).json(createdEvent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all events
// @route   GET /api/events
// @access  Public
const getAllEvents = async (req, res) => {
  try {
    // Find events where the date is in the future
    const events = await Event.find({ date: { $gte: new Date() } }).sort({ date: 1 }); // Sort by date ascending
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a single event by ID
// @route   GET /api/events/:id
// @access  Public
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (event) {
      res.json(event);
    } else {
      res.status(404).json({ message: 'Event not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Register the logged-in user for an event
// @route   POST /api/events/:id/register
// @access  Private
const registerForEvent = async (req, res) => {
  const eventId = req.params.id;
  const volunteerId = req.user._id;

  try {
    if (req.user.status !== 'approved') {
      return res.status(403).json({ message: 'Your account must be approved to register for events.' });
    }
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // --- Core Logic ---
    // 1. Check if slots are available
    const existingRegistrations = await Registration.countDocuments({ event: eventId });
    if (existingRegistrations >= event.slotsAvailable) {
      return res.status(400).json({ message: 'Event is full' });
    }

    // 2. Check if user is already registered (using the unique index)
    // The Registration model already prevents duplicates, but we send a nice message
    const alreadyRegistered = await Registration.findOne({
      event: eventId,
      volunteer: volunteerId,
    });
    if (alreadyRegistered) {
      return res.status(400).json({ message: 'You are already registered for this event' });
    }
    
    // 3. Create the registration
    const registration = new Registration({
      event: eventId,
      volunteer: volunteerId,
    });
    
    await registration.save();
    res.status(201).json({ message: 'Successfully registered for event' });

  } catch (error) {
    // Handle the 'duplicate key' error from the database index
    if (error.code === 11000) {
       return res.status(400).json({ message: 'You are already registered for this event' });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Unregister the logged-in user from an event
// @route   DELETE /api/events/:id/unregister
// @access  Private
const unregisterForEvent = async (req, res) => {
  const eventId = req.params.id;
  const volunteerId = req.user._id;

  try {
    const registration = await Registration.findOneAndDelete({
      event: eventId,
      volunteer: volunteerId,
    });

    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    res.json({ message: 'Successfully unregistered from event' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update an event
// @route   PUT /api/events/:id
// @access  Private/Admin
const updateEvent = async (req, res) => {
  const { title, description, date, location, slotsAvailable } = req.body;

  try {
    const event = await Event.findById(req.params.id);

    if (event) {
      event.title = title || event.title;
      event.description = description || event.description;
      event.date = date || event.date;
      event.location = location || event.location;
      event.slotsAvailable = slotsAvailable || event.slotsAvailable;

      const updatedEvent = await event.save();
      res.json(updatedEvent);
    } else {
      res.status(404).json({ message: 'Event not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Private/Admin
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (event) {
      // Bonus: Also delete all registrations for this event
      await Registration.deleteMany({ event: req.params.id });
      // Now delete the event itself
      await Event.findByIdAndDelete(req.params.id);

      res.json({ message: 'Event and associated registrations removed' });
    } else {
      res.status(404).json({ message: 'Event not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all volunteers registered for an event
// @route   GET /api/events/:id/volunteers
// @access  Private/Admin
const getVolunteersForEvent = async (req, res) => {
  try {
    const registrations = await Registration.find({ event: req.params.id })
                                            .populate('volunteer', 'name email skills'); // <-- 'populate' gets the user details

    if (!registrations || registrations.length === 0) {
      return res.status(404).json({ message: 'No registrations found for this event' });
    }
    
    // Extract just the volunteer details for a cleaner response
    const volunteers = registrations.map(reg => reg.volunteer);
    res.json(volunteers);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports = {
  createEvent,
  getAllEvents,
  getEventById,
  registerForEvent,
  unregisterForEvent,
  updateEvent, 
  deleteEvent, 
  getVolunteersForEvent,
};