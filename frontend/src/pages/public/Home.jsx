import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowRight, Calendar, Users, ShieldCheck, 
  HeartHandshake, Star, Globe, Clock, Sparkles, 
  MapPin, CheckCircle2, Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import api from '../../lib/axios';
import { Button } from '../../components/ui/button'; 

// --- Animated Background ---
const AnimatedBackground = () => (
  <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
    <motion.div 
      animate={{ scale: [1, 1.1, 1], rotate: [0, 90, 0], x: [0, 100, 0], y: [0, -50, 0] }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      className="absolute top-[-20%] left-[-10%] w-[70vh] h-[70vh] bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-full blur-[120px] mix-blend-screen" 
    />
    <motion.div 
      animate={{ scale: [1.1, 1, 1.1], rotate: [0, -90, 0], x: [0, -100, 0], y: [0, 50, 0] }}
      transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      className="absolute bottom-[-20%] right-[-10%] w-[70vh] h-[70vh] bg-gradient-to-br from-cyan-600/20 to-blue-600/20 rounded-full blur-[120px] mix-blend-screen" 
    />
    <div className="absolute inset-0 bg-[#0f172a]/90 backdrop-blur-[1px]"></div>
  </div>
);

const Home = () => {
  // --- FETCH REAL DATA ---
  const { data: landingData, isLoading } = useQuery({
    queryKey: ['landingPageData'],
    queryFn: async () => {
      // Fetch all public events to calculate stats
      const response = await api.get('/events');
      const allEvents = Array.isArray(response.data) ? response.data : [];

      // Calculate stats based on real data
      const totalEvents = allEvents.length;
      // Sum of all people currently registered for events
      const activeVolunteers = allEvents.reduce((acc, curr) => acc + (curr.registrationCount || 0), 0);
      // Sort by date to get upcoming features
      const sortedEvents = allEvents
        .filter(e => new Date(e.date) > new Date())
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      return {
        featuredEvents: sortedEvents.slice(0, 3), // Top 3 Upcoming
        stats: {
          events: totalEvents,
          volunteers: activeVolunteers,
          // Estimate: Avg 4 hours per slot filled
          hours: activeVolunteers * 4 
        }
      };
    },
    // Default values while loading
    placeholderData: {
      featuredEvents: [],
      stats: { events: 0, volunteers: 0, hours: 0 }
    }
  });

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans selection:bg-pink-500/30 overflow-x-hidden relative">
      
      <AnimatedBackground />

      {/* --- NAVBAR --- */}
      <nav className="relative z-50 border-b border-white/5 bg-[#0f172a]/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-xl flex items-center justify-center text-white overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500 via-purple-500 to-cyan-500 opacity-80 group-hover:opacity-100 transition-opacity"></div>
              <HeartHandshake size={24} className="relative z-10" />
            </div>
            <span className="font-extrabold text-xl text-white tracking-tight">RallyPoint</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#events" className="hover:text-white transition-colors">Opportunities</a>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#impact" className="hover:text-white transition-colors">Impact</a>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-white/5 font-semibold">Log in</Button>
            </Link>
            <Link to="/register">
              <Button className="bg-white text-slate-900 hover:bg-indigo-50 font-bold rounded-full px-6">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative z-10 pt-24 pb-32 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Content */}
          <div className="space-y-8 text-center lg:text-left">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-300 text-sm font-medium backdrop-blur-md"
            >
              <Sparkles size={14} className="text-pink-400" />
              <span>The future of community service</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-[1.1]"
            >
              Real impact, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500">
                real time.
              </span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-xl text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed"
            >
              Join a growing community making a difference. Discover local events, track your service hours, and verify your impact instantly.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4"
            >
              <Link to="/register">
                <Button size="lg" className="h-14 px-10 text-lg bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white rounded-full font-bold shadow-xl shadow-purple-900/30 w-full sm:w-auto transition-all hover:scale-105">
                  Start Volunteering
                </Button>
              </Link>
              {/* 👇 This link now works publicly because we updated App.jsx */}
              <Link to="/events">
                <Button size="lg" variant="outline" className="h-14 px-10 text-lg border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white hover:border-white/20 rounded-full w-full sm:w-auto backdrop-blur-md font-semibold">
                  Browse Events <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.8 }}
              className="pt-8 flex flex-wrap justify-center lg:justify-start gap-6 text-slate-500 font-medium text-sm"
            >
               <div className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> Verified 501(c)(3) Partners</div>
               <div className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> Automated Certificates</div>
            </motion.div>
          </div>

          {/* Right Hero Visual - Abstract Data Visualization */}
          <motion.div
             initial={{ opacity: 0, scale: 0.9, x: 50 }} animate={{ opacity: 1, scale: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.3 }}
             className="hidden lg:block relative z-20"
          >
             <div className="relative rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-xl p-6 shadow-2xl shadow-purple-900/20 transform rotate-3 hover:rotate-0 transition-all duration-500">
                <div className="space-y-6">
                   <div className="flex items-center justify-between border-b border-white/5 pb-4">
                      <div className="flex gap-3">
                         <div className="h-3 w-3 rounded-full bg-red-500/50"></div>
                         <div className="h-3 w-3 rounded-full bg-yellow-500/50"></div>
                         <div className="h-3 w-3 rounded-full bg-green-500/50"></div>
                      </div>
                      <div className="h-2 w-20 bg-white/10 rounded-full"></div>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                         <p className="text-xs text-slate-400 uppercase font-bold">Estimated Impact</p>
                         <p className="text-3xl font-black text-white mt-1">{landingData?.stats?.hours} hrs</p>
                      </div>
                      <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                         <p className="text-xs text-slate-400 uppercase font-bold">Total Events</p>
                         <p className="text-3xl font-black text-cyan-400 mt-1">{landingData?.stats?.events}</p>
                      </div>
                   </div>

                   <div className="space-y-3">
                      <div className="h-12 bg-gradient-to-r from-pink-500/20 to-transparent rounded-lg border-l-4 border-pink-500 flex items-center px-4 text-sm text-pink-200">
                         {landingData?.stats?.volunteers} Volunteers Active
                      </div>
                      <div className="h-12 bg-gradient-to-r from-purple-500/20 to-transparent rounded-lg border-l-4 border-purple-500 flex items-center px-4 text-sm text-purple-200">
                         Food Drive event created
                      </div>
                      <div className="h-12 bg-gradient-to-r from-cyan-500/20 to-transparent rounded-lg border-l-4 border-cyan-500 flex items-center px-4 text-sm text-cyan-200">
                         Hours Verified Instantly
                      </div>
                   </div>
                </div>
                <div className="absolute -inset-10 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 blur-3xl opacity-10 -z-10 rounded-full"></div>
             </div>
          </motion.div>
        </div>
      </section>

      {/* --- REAL DATA STATS BANNER --- */}
      <section className="relative z-10 py-16 bg-slate-900/50 backdrop-blur-md border-y border-white/5">
         <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
             <StatBox value={landingData?.stats?.volunteers || 0} label="Active Volunteers" color="from-pink-500 to-purple-500" />
             <StatBox value={landingData?.stats?.events || 0} label="Events Hosted" color="from-purple-500 to-cyan-500" />
             <StatBox value={landingData?.stats?.hours || 0} label="Est. Hours" color="from-cyan-500 to-blue-500" suffix="+" />
             <StatBox value="100%" label="Commitment" color="from-blue-500 to-purple-500" />
         </div>
      </section>

      {/* --- FEATURED OPPORTUNITIES (REAL DATA) --- */}
      {/* Only show this section if we actually have events */}
      {landingData?.featuredEvents?.length > 0 && (
        <section id="events" className="relative z-10 py-32 bg-gradient-to-b from-transparent to-slate-900/50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
              <div>
                <span className="text-pink-400 font-bold uppercase tracking-widest text-sm">Get Involved</span>
                <h2 className="text-4xl font-extrabold text-white mt-2">Featured Opportunities</h2>
              </div>
              <Link to="/events">
                <Button variant="ghost" className="text-slate-300 hover:text-white group">
                  View All Events <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform"/>
                </Button>
              </Link>
            </div>

            {isLoading ? (
               <div className="flex justify-center py-20"><Loader2 className="animate-spin text-pink-500 h-10 w-10"/></div>
            ) : (
              <div className="grid md:grid-cols-3 gap-8">
                {landingData.featuredEvents.map((event) => (
                  <Link to={`/events/${event._id}`} key={event._id} className="group h-full">
                    <div className="h-full bg-slate-800/50 border border-white/10 rounded-2xl overflow-hidden hover:border-pink-500/50 hover:shadow-2xl hover:shadow-pink-900/20 transition-all duration-300 flex flex-col">
                      <div className="h-48 bg-slate-700 relative overflow-hidden">
                        {event.bannerImage ? (
                          <img src={event.bannerImage} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-800">
                            <Calendar className="text-slate-500 w-12 h-12" />
                          </div>
                        )}
                        <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white border border-white/10">
                          {event.category || 'General'}
                        </div>
                      </div>
                      <div className="p-6 flex-1 flex flex-col">
                        <div className="text-xs text-pink-400 font-bold mb-2 uppercase tracking-wider">
                          {format(new Date(event.date), 'MMM d, yyyy')}
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2 line-clamp-1 group-hover:text-pink-300 transition-colors">
                          {event.title}
                        </h3>
                        <p className="text-slate-400 text-sm mb-4 line-clamp-2 flex-1">
                          {event.description}
                        </p>
                        
                        <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
                          <div className="flex items-center gap-1.5 text-xs text-slate-300">
                            <MapPin size={14} className="text-slate-500" />
                            <span className="truncate max-w-[120px]">{event.location}</span>
                          </div>
                          <span className="text-xs font-medium text-white bg-white/10 px-2 py-1 rounded-md">
                            {event.slotsAvailable - (event.registrationCount || 0)} spots left
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* --- FEATURES GRID --- */}
      <section id="features" className="relative z-10 py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <span className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-cyan-400 uppercase tracking-widest">
               Powerful Platform
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mt-4 mb-6">
               Everything you need to <br/> maximize impact.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            <FeatureCard 
              icon={<Calendar size={32} />} color="pink"
              title="Smart Scheduling"
              desc="Browse opportunities and sign up for shifts that perfectly fit your life with one click."
            />
            <FeatureCard 
              icon={<Clock size={32} />} color="purple"
              title="Automated Tracking"
              desc="Forget paper logs. Your volunteer hours are automatically recorded and verified instantly."
            />
            <FeatureCard 
              icon={<ShieldCheck size={32} />} color="cyan"
              title="Verified Certificates"
              desc="Generate official, shareable volunteer certificates for school, work, or LinkedIn."
            />
            <FeatureCard 
              icon={<Users size={32} />} color="blue"
              title="Community Hub"
              desc="Connect with like-minded individuals and coordinate group efforts effortlessly."
            />
            <FeatureCard 
              icon={<Globe size={32} />} color="indigo"
              title="Remote Options"
              desc="Find virtual volunteering opportunities you can do from anywhere in the world."
            />
            <FeatureCard 
              icon={<Star size={32} />} color="yellow"
              title="Rewards & Badges"
              desc="Earn recognition for your contributions and level up your volunteer profile."
            />
          </div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="relative z-10 py-32 px-6">
        <div className="max-w-7xl mx-auto relative z-20 bg-gradient-to-br from-indigo-900/50 to-purple-900/50 rounded-[3rem] p-12 md:p-24 text-center overflow-hidden border border-white/10 backdrop-blur-xl shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay"></div>
          
          <div className="relative z-10">
             <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-8 tracking-tight">
               Ready to join the movement?
             </h2>
             <p className="text-xl text-indigo-200 mb-12 max-w-2xl mx-auto">
               Create your account today. It's free, takes 2 minutes, and opens the door to meaningful change.
             </p>
             <Link to="/register">
               <Button size="lg" className="h-16 px-12 text-xl bg-white text-indigo-950 hover:bg-indigo-50 hover:scale-105 transition-all rounded-full font-bold shadow-2xl shadow-white/20">
                  Create Free Account
               </Button>
             </Link>
             <p className="mt-8 text-sm text-indigo-300/70 font-medium">No credit card required • Join as Organization or Individual</p>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="relative z-10 bg-[#060913] pt-20 pb-10 px-6 mt-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-10 mb-16">
          <div className="col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
                <HeartHandshake size={22} />
              </div>
              <span className="font-extrabold text-2xl text-white">RallyPoint</span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed max-w-xs mb-8">
              Empowering communities through modern, seamless volunteer management technology.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold text-white mb-6">Platform</h4>
            <ul className="space-y-3 text-sm text-slate-400 font-medium">
              <li><Link to="/events" className="hover:text-pink-400 transition-colors">Browse Events</Link></li>
              <li><Link to="#" className="hover:text-pink-400 transition-colors">For Nonprofits</Link></li>
              <li><Link to="#" className="hover:text-pink-400 transition-colors">Pricing</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-white mb-6">Support</h4>
            <ul className="space-y-3 text-sm text-slate-400 font-medium">
              <li><Link to="/support" className="hover:text-cyan-400 transition-colors">Help Center</Link></li>
              <li><Link to="#" className="hover:text-cyan-400 transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-6">Legal</h4>
            <ul className="space-y-3 text-sm text-slate-400 font-medium">
              <li><Link to="#" className="hover:text-purple-400 transition-colors">Privacy Policy</Link></li>
              <li><Link to="#" className="hover:text-purple-400 transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-600 text-sm font-medium">© 2024 RallyPoint Inc. Made with <HeartHandshake size={14} className="inline text-pink-500 mx-1" /> globally.</p>
        </div>
      </footer>

    </div>
  );
};

// --- Helper Components ---
const StatBox = ({ value, label, color, suffix = "" }) => (
  <div>
    <div className={`text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r ${color} mb-2`}>
      {value}{suffix}
    </div>
    <div className="text-sm text-slate-400 uppercase tracking-wider font-bold">{label}</div>
  </div>
);

const FeatureCard = ({ icon, title, desc, color }) => {
  const colorMap = {
    pink: "text-pink-400 group-hover:text-pink-300 from-pink-500/20 to-pink-500/0",
    purple: "text-purple-400 group-hover:text-purple-300 from-purple-500/20 to-purple-500/0",
    cyan: "text-cyan-400 group-hover:text-cyan-300 from-cyan-500/20 to-cyan-500/0",
    blue: "text-blue-400 group-hover:text-blue-300 from-blue-500/20 to-blue-500/0",
    indigo: "text-indigo-400 group-hover:text-indigo-300 from-indigo-500/20 to-indigo-500/0",
    yellow: "text-yellow-400 group-hover:text-yellow-300 from-yellow-500/20 to-yellow-500/0",
  };
  
  return (
  <motion.div 
    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }}
    className="relative p-8 rounded-3xl bg-white/5 border border-white/10 overflow-hidden group hover:border-white/20 transition-all duration-500 hover:-translate-y-2"
  >
    <div className={`absolute inset-0 bg-gradient-to-br ${colorMap[color]} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
    
    <div className="relative z-10">
      <div className={`w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 ${colorMap[color].split(' ')[0]} group-hover:scale-110 transition-transform duration-500 shadow-lg`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed font-medium">{desc}</p>
    </div>
  </motion.div>
)};

export default Home;