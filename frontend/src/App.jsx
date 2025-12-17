import { Routes, Route, Link } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Layouts
import AuthLayout from './components/layout/AuthLayout';
import DashboardLayout from './components/layout/DashboardLayout';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import CreateEvent from './pages/admin/CreateEvent';
import ManageVolunteers from './pages/admin/ManageVolunteers';
import ApproveHours from './pages/admin/ApproveHours';

// Volunteer Pages
import VolunteerDashboard from './pages/volunteer/VolunteerDashboard';
import AllEvents from './pages/public/AllEvents';
import MyHistory from './pages/volunteer/MyHistory';
import EventDetails from './pages/public/EventDetails';
import Profile from './pages/Profile'; // <--- Added Import

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased font-sans overflow-x-hidden">
      <AnimatePresence mode="wait">
        <Routes>
          
          {/* Public Landing Page */}
          <Route path="/" element={
            <div className="flex h-screen items-center justify-center flex-col">
              <div className="text-center">
                <h1 className="text-5xl font-bold text-primary animate-pulse mb-4">
                  RallyPoint
                </h1>
                <p className="text-xl text-muted-foreground mb-8">
                  Volunteer Registration System
                </p>
                
                <div className="flex gap-4 justify-center">
                  <Link to="/login">
                    <button className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition">
                      Login
                    </button>
                  </Link>
                  <Link to="/register">
                    <button className="px-6 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md transition">
                      Register
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          } />
          
          {/* AUTH ROUTES - Wrapped in AuthLayout for the 3D Flip Animation */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>
          
          {/* PROTECTED ROUTES - Wrapped in DashboardLayout (Sidebar & Navbar) */}
          <Route element={<DashboardLayout />}>
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/events/create" element={<CreateEvent />} />
            <Route path="/admin/volunteers" element={<ManageVolunteers />} />
            <Route path="/admin/approvals" element={<ApproveHours />} />

            {/* Volunteer Routes */}
            <Route path="/dashboard" element={<VolunteerDashboard />} />
            <Route path="/events" element={<AllEvents />} />
            <Route path="/events/:id" element={<EventDetails />} />
            <Route path="/my-hours" element={<MyHistory />} />
            
            {/* Shared Route (Admin & Volunteer) */}
            <Route path="/profile" element={<Profile />} /> {/* <--- Added Route */}

          </Route>
          
          {/* 404 Page */}
          <Route path="*" element={<div className="p-10 text-red-500 text-center">404 Not Found</div>} />
        
        </Routes>
      </AnimatePresence>
    </div>
  )
}

export default App;