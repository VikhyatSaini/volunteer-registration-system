import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, CalendarPlus, Users, Clock, LogOut, 
  Menu, ShieldCheck, HeartHandshake, User 
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';

const DashboardLayout = () => {
  // Destructure loading from useAuth to wait for the check to finish
  const { user, logout, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  // --- SECURITY FIX: Check Auth on Mount ---
  // This prevents the "Back Button" issue. If no user is found, redirect immediately.
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    // If loading is done, and we have no user OR no token, kick them out.
    if (!loading && (!user || !token)) {
      navigate('/login', { replace: true });
    }
  }, [user, loading, navigate]);

  // While checking auth status, render nothing (or a spinner) to protect data
  if (loading || !user) return null; 

  // Define links based on Role
  const adminLinks = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20} /> },
    { name: 'Create Event', path: '/admin/events/create', icon: <CalendarPlus size={20} /> },
    { name: 'Manage Volunteers', path: '/admin/volunteers', icon: <Users size={20} /> },
    { name: 'Approve Hours', path: '/admin/approvals', icon: <Clock size={20} /> },
    { name: 'Profile', path: '/profile', icon: <User size={20} /> }, 
  ];

  const volunteerLinks = [
    { name: 'My Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Browse Events', path: '/events', icon: <CalendarPlus size={20} /> },
    { name: 'My History', path: '/my-hours', icon: <Clock size={20} /> },
    { name: 'Profile', path: '/profile', icon: <User size={20} /> }, 
  ];

  const links = user?.role === 'admin' ? adminLinks : volunteerLinks;

  const handleLogout = () => {
    logout();
    // 'replace: true' clears the history so you can't go back
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex overflow-hidden">
      
      {/* 1. Sidebar (Desktop) */}
      <motion.aside 
        initial={{ width: 260 }}
        animate={{ width: isSidebarOpen ? 260 : 80 }}
        className="hidden md:flex flex-col border-r border-slate-800 bg-slate-900/50 backdrop-blur-xl z-20 h-screen sticky top-0"
      >
        {/* Logo Area */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0">
            {user?.role === 'admin' ? <ShieldCheck size={18} className="text-white" /> : <HeartHandshake size={18} className="text-white" />}
          </div>
          {isSidebarOpen && (
            <motion.span 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="ml-3 font-bold text-lg tracking-wide text-white"
            >
              RallyPoint
            </motion.span>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 py-6 px-3 space-y-1">
          {links.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link to={link.path} key={link.path}>
                <div className={`
                  flex items-center px-3 py-3 rounded-lg transition-all duration-200 group
                  ${isActive 
                    ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-600/20' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
                `}>
                  <span className={isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-white'}>
                    {link.icon}
                  </span>
                  {isSidebarOpen && (
                    <motion.span 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }} 
                      className="ml-3 font-medium text-sm"
                    >
                      {link.name}
                    </motion.span>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User Footer */}
        <div className="p-4 border-t border-slate-800">
          <div className={`flex items-center ${isSidebarOpen ? 'justify-between' : 'justify-center'}`}>
            {isSidebarOpen && (
              <div className="flex flex-col overflow-hidden mr-2">
                <span className="text-sm font-semibold text-white truncate">{user?.name}</span>
                <span className="text-xs text-slate-500 capitalize">{user?.role}</span>
              </div>
            )}
            <button onClick={handleLogout} className="p-2 rounded-md hover:bg-red-500/10 hover:text-red-400 text-slate-500 transition-colors">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </motion.aside>

      {/* 2. Main Content Wrapper */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        
        {/* Top Navbar */}
        <header className="h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md flex items-center justify-between px-6 z-10">
          <button 
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-md hover:bg-slate-800 text-slate-400 md:block hidden"
          >
            <Menu size={20} />
          </button>
          
          {/* Mobile Menu Button */}
          <button className="md:hidden p-2 text-slate-400">
            <Menu size={24} />
          </button>

          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400">
              {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
            {/* Clickable Avatar -> Goes to Profile */}
            <Link to="/profile" className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 overflow-hidden hover:border-indigo-500 transition-colors">
               <img src={user?.profilePicture || "https://github.com/shadcn.png"} alt="Avatar" className="w-full h-full object-cover" />
            </Link>
          </div>
        </header>

        {/* Page Content (Scrollable) */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-950 relative">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>

      </div>
    </div>
  );
};

export default DashboardLayout;