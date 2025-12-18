import { Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// --- 1. Public Pages ---
import Home from './pages/public/Home'; // The new Landing Page
import AllEvents from './pages/public/AllEvents';
import EventDetails from './pages/public/EventDetails';

// --- 2. Auth Pages ---
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// --- 3. Admin Pages ---
import AdminDashboard from './pages/admin/AdminDashboard';
import CreateEvent from './pages/admin/CreateEvent';
import ManageVolunteers from './pages/admin/ManageVolunteers';
import ApproveHours from './pages/admin/ApproveHours';

// --- 4. Volunteer Pages ---
import VolunteerDashboard from './pages/volunteer/VolunteerDashboard';
import MyHistory from './pages/volunteer/MyHistory';
import MyRegistrations from './pages/volunteer/MyRegistrations';

// --- 5. Shared Pages ---
import Profile from './pages/Profile';
import Support from './pages/Support';

// --- 6. Layouts ---
import AuthLayout from './components/layout/AuthLayout';
import DashboardLayout from './components/layout/DashboardLayout';

function App() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 antialiased font-sans overflow-x-hidden">
      
      {/* AnimatePresence handles smooth page transitions (optional) */}
      <AnimatePresence mode="wait">
        <Routes>
          
          {/* =========================================
              PUBLIC ROUTES (Accessible by everyone)
          ========================================== */}
          
          {/* Landing Page */}
          <Route path="/" element={<Home />} />
          
          
          {/* =========================================
              AUTH ROUTES (Login / Register)
              Wrapped in AuthLayout for the 3D Flip Animation
          ========================================== */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>
          

          {/* =========================================
              PROTECTED DASHBOARD ROUTES
              Wrapped in DashboardLayout (Sidebar & Navbar)
          ========================================== */}
          <Route element={<DashboardLayout />}>
            
            {/* --- Admin Only Routes --- */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/events/create" element={<CreateEvent />} />
            <Route path="/admin/volunteers" element={<ManageVolunteers />} />
            <Route path="/admin/approvals" element={<ApproveHours />} />

            {/* --- Volunteer Only Routes --- */}
            <Route path="/dashboard" element={<VolunteerDashboard />} />
            <Route path="/my-hours" element={<MyHistory />} />
            <Route path="/my-registrations" element={<MyRegistrations />} />

            {/* --- Public/Shared within Dashboard --- */}
            {/* Volunteers browse events here while logged in */}
            <Route path="/events" element={<AllEvents />} />
            <Route path="/events/:id" element={<EventDetails />} />
            
            {/* --- Common Routes (Accessible by both) --- */}
            <Route path="/profile" element={<Profile />} />
            <Route path="/support" element={<Support />} />

          </Route>
          

          {/* =========================================
              404 NOT FOUND
          ========================================== */}
          <Route path="*" element={
            <div className="flex h-screen items-center justify-center bg-[#0f172a] text-center">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">404</h1>
                <p className="text-slate-400">Page not found</p>
              </div>
            </div>
          } />
        
        </Routes>
      </AnimatePresence>
    </div>
  );
}

export default App;