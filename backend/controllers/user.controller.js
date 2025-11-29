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
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.availability = req.body.availability || user.availability;
    user.skills = req.body.skills || user.skills;

    if (req.file) {
      user.profilePicture = req.file.path; // Save Cloudinary URL
    }
    
    // You can add password change logic here if you want
    // if (req.body.password) {
    //   user.password = req.body.password;
    // }

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
      token: generateToken(updatedUser._id, updateUser.role), // Re-issue token in case email/name changed
    });
  } else {
    res.status(404).json({ message: 'User not found' });
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

      // (Optional) Send an email to the user
      // try {
      //   await sendEmail({
      //     to: user.email,
      //     subject: 'Your Application Status',
      //     text: `Hi ${user.name}, \n\nYour application has been ${status}.`
      //   });
      // } catch (emailError) {
      //   console.error('Status update email failed:', emailError);
      // }

    } else {
      res.status(440).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { 
    registerUser,
    getUserProfile,
    updateUserProfile,
    getMyRegisteredEvents,
    getAllUsers,
    updateUserStatus,
 };