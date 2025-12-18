const User = require('../models/user.model');
const Registration = require('../models/registration.model');
const Event = require('../models/event.model');
const generateToken = require('../utils/generateToken');
const { sendEmail } = require('../utils/mail');

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role),
      });

      // Send welcome email (fire and forget)
      try {
        await sendEmail({
          to: user.email,
          subject: 'Welcome to the Volunteer Registration System!',
          text: `Hi ${user.name}, \n\nThank you for registering. We're excited to have you on board. \n\n- The Team`,
        });
      } catch (emailError) {
        console.error('Email failed to send:', emailError);
      }
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture, 
        token: generateToken(user._id, user.role),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged-in user's profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  // req.user is attached by the 'protect' middleware
  const user = await User.findById(req.user._id).select('-password');
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Update logged-in user's profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;

      // --- FIX: Handle Image Upload ---
      if (req.file) {
        user.profilePicture = req.file.path; // Save Cloudinary URL
      }

      // --- FIX: Handle Arrays (Skills/Availability) ---
      // Frontend FormData sends these as strings (e.g. "Coding, Driving")
      // We must split them back into arrays for the Database
      if (req.body.skills) {
        user.skills = Array.isArray(req.body.skills) 
          ? req.body.skills 
          : req.body.skills.split(',').map(s => s.trim()).filter(Boolean);
      }

      if (req.body.availability) {
        user.availability = Array.isArray(req.body.availability) 
          ? req.body.availability 
          : req.body.availability.split(',').map(s => s.trim()).filter(Boolean);
      }

      // --- SECURE PASSWORD UPDATE LOGIC ---
      // If user wants to change password, they must provide the new one AND current one
      if (req.body.newPassword) {
         if (!req.body.currentPassword) {
             return res.status(400).json({ message: 'Please provide your current password to make changes.' });
         }
         
         // Verify current password
         if (await user.matchPassword(req.body.currentPassword)) {
             user.password = req.body.newPassword;
         } else {
             return res.status(401).json({ message: 'Incorrect current password.' });
         }
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        status: updatedUser.status,
        availability: updatedUser.availability,
        skills: updatedUser.skills,
        profilePicture: updatedUser.profilePicture,
        token: generateToken(updatedUser._id, updatedUser.role),
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get events a user is registered for
// @route   GET /api/users/my-events
// @access  Private
const getMyRegisteredEvents = async (req, res) => {
  try {
    // 1. Find all registrations for the current user
    const registrations = await Registration.find({ volunteer: req.user._id });

    // 2. Get all the event IDs from those registrations
    const eventIds = registrations.map(reg => reg.event);

    // 3. Find all events that match those IDs
    const events = await Event.find({ _id: { $in: eventIds } }).sort({ date: 1 });

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users (Volunteers)
// @route   GET /api/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'volunteer' }).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a user's status (approve/reject)
// @route   PUT /api/users/:id/status
// @access  Private/Admin
const updateUserStatus = async (req, res) => {
  const { status } = req.body; // status should be 'approved' or 'rejected'

  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    const user = await User.findById(req.params.id);

    if (user) {
      user.status = status;
      await user.save();
      res.json({ message: `User status updated to ${status}` });
    } else {
      res.status(440).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { 
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getMyRegisteredEvents,
  getAllUsers,
  updateUserStatus,
};