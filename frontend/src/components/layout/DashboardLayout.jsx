import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, CalendarPlus, Users, Clock, LogOut, 
  Menu, ShieldCheck, HeartHandshake, User, Bell, ChevronRight, 
  Search, Settings, HelpCircle, ChevronDown
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';

const DashboardLayout = () => {
  const { user, logout, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setProfileMenuOpen] = useState(false);

  // Security Check
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!loading && (!user || !token)) {
      navigate('/login', { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading || !user) return null; 

  const adminLinks = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={18} /> },
    { name: 'Create Event', path: '/admin/events/create', icon: <CalendarPlus size={18} /> },
    { name: 'Volunteers', path: '/admin/volunteers', icon: <Users size={18} /> },
    { name: 'Approvals', path: '/admin/approvals', icon: <Clock size={18} /> },
  ];

  const volunteerLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={18} /> },
    { name: 'Events', path: '/events', icon: <CalendarPlus size={18} /> },
    { name: 'My History', path: '/my-hours', icon: <Clock size={18} /> },
  ];

  const links = user?.role === 'admin' ? adminLinks : volunteerLinks;

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const SidebarContent = ({ expanded }) => (
    <div className="flex flex-col h-full">
      {/* 1. Brand Header */}
      <div className={`h-16 flex items-center px-5 border-b border-slate-800 ${expanded ? 'justify-start' : 'justify-center'}`}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-900/20">
            {user?.role === 'admin' ? <ShieldCheck size={18} /> : <HeartHandshake size={18} />}
          </div>
          {expanded && (
            <div className="flex flex-col">
              <span className="font-bold text-lg text-slate-100 tracking-tight leading-tight">RallyPoint</span>
              <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Enterprise</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Main Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        <div className="mb-2 px-3">
          {expanded && <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Platform</p>}
        </div>
        {links.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <Link to={link.path} key={link.path} onClick={() => setMobileMenuOpen(false)}>
              <div className={`
                flex items-center px-3 py-2.5 rounded-md group transition-all duration-200
                ${isActive 
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}
              `}>
                <span className={`${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
                  {link.icon}
                </span>
                {expanded && (
                  <span className="ml-3 text-sm font-medium">
                    {link.name}
                  </span>
                )}
              </div>
            </Link>
          );
        })}

        {/* Secondary Links (Settings, etc.) */}
        <div className="mt-8 px-3">
          {expanded && <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Settings</p>}
          <Link to="/profile">
            <div className="flex items-center px-3 py-2.5 rounded-md text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-all duration-200">
              <Settings size={18} />
              {expanded && <span className="ml-3 text-sm font-medium">Account</span>}
            </div>
          </Link>
          <Link to="/support">
            <div className="flex items-center px-3 py-2.5 rounded-md text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-all duration-200">
              <HelpCircle size={18} />
              {expanded && <span className="ml-3 text-sm font-medium">Support</span>}
            </div>
          </Link>
        </div>
      </nav>

      {/* 3. User Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/50">
        <div className={`flex items-center ${expanded ? 'justify-between' : 'justify-center'}`}>
          {expanded && (
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 overflow-hidden">
                  <img src={user?.profilePicture || "https://github.com/shadcn.png"} alt="User" className="w-full h-full object-cover" />
               </div>
               <div className="flex flex-col overflow-hidden">
                  <span className="text-sm font-medium text-slate-200 truncate w-24">{user?.name}</span>
                  <span className="text-xs text-slate-500 capitalize">{user?.role}</span>
               </div>
            </div>
          )}
          <button 
            onClick={handleLogout} 
            className="p-2 rounded-md text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex font-sans antialiased selection:bg-indigo-500/30">
      
      {/* --- SIDEBAR --- */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 260 : 72 }}
        className="hidden md:flex flex-col border-r border-slate-800 bg-slate-900 z-30 h-screen sticky top-0"
      >
        <SidebarContent expanded={isSidebarOpen} />
      </motion.aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed inset-y-0 left-0 w-72 bg-slate-900 border-r border-slate-800 z-50 md:hidden"
            >
              <div className="absolute top-4 right-4">
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-slate-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>
              <SidebarContent expanded={true} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* --- MAIN CONTENT WRAPPER --- */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-6 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-md hover:bg-slate-800 text-slate-400 md:block hidden transition-colors"
            >
              <Menu size={20} />
            </button>
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-md hover:bg-slate-800 text-slate-400 md:hidden"
            >
              <Menu size={20} />
            </button>

            {/* Breadcrumb / Page Title */}
            <div className="hidden sm:flex items-center text-sm">
               <span className="text-slate-500 font-medium">Application</span>
               <ChevronRight size={14} className="mx-2 text-slate-600" />
               <span className="text-slate-200 font-medium capitalize">
                 {location.pathname.split('/')[1] || 'Dashboard'}
               </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Box */}
            <div className="hidden md:flex items-center bg-slate-950 border border-slate-800 rounded-md px-3 py-1.5 w-64 focus-within:ring-1 focus-within:ring-indigo-500/50 transition-all">
               <Search size={14} className="text-slate-500 mr-2" />
               <input 
                 type="text" 
                 placeholder="Search..." 
                 className="bg-transparent border-none outline-none text-xs text-slate-200 placeholder-slate-600 w-full" 
               />
               <span className="text-[10px] text-slate-600 border border-slate-700 rounded px-1.5 py-0.5">⌘K</span>
            </div>

            <div className="h-6 w-px bg-slate-800 mx-2"></div>

            <button className="relative p-2 rounded-md hover:bg-slate-800 text-slate-400 hover:text-indigo-400 transition-colors">
              <Bell size={18} />
              <span className="absolute top-2 right-2.5 h-1.5 w-1.5 bg-indigo-500 rounded-full"></span>
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-all"
              >
                 <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white">
                    {user?.name.charAt(0)}
                 </div>
                 <ChevronDown size={14} className="text-slate-500 mr-1" />
              </button>
              
              {/* Dropdown Menu */}
              <AnimatePresence>
                {isProfileMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setProfileMenuOpen(false)} />
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.1 }}
                      className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-lg shadow-xl z-40 py-1"
                    >
                      <div className="px-4 py-2 border-b border-slate-800">
                        <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                        <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                      </div>
                      <Link to="/profile" className="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white" onClick={() => setProfileMenuOpen(false)}>
                        Profile Settings
                      </Link>
                      <button 
                        onClick={() => { handleLogout(); setProfileMenuOpen(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        Sign out
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-slate-950 p-6 md:p-8">
           <div className="max-w-7xl mx-auto">
             <Outlet />
           </div>
        </main>

      </div>
    </div>
  );
};

export default DashboardLayout;