import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowRight, Calendar, Users, ShieldCheck, 
  HeartHandshake, Star, Globe, Clock, Sparkles, PlayCircle
} from 'lucide-react';
// Fix imports based on your file structure
import { Button } from '../../components/ui/button'; 

// --- Animated Background Component ---
const AnimatedBackground = () => (
  <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
    {/* Blob 1 - Purple/Pink */}
    <motion.div 
      animate={{ 
        scale: [1, 1.1, 1],
        rotate: [0, 90, 0],
        x: [0, 100, 0],
        y: [0, -50, 0]
      }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      className="absolute top-[-20%] left-[-10%] w-[70vh] h-[70vh] bg-gradient-to-br from-purple-600/30 to-pink-600/30 rounded-full blur-[120px] mix-blend-screen" 
    />
    {/* Blob 2 - Cyan/Blue */}
    <motion.div 
      animate={{ 
        scale: [1.1, 1, 1.1],
        rotate: [0, -90, 0],
        x: [0, -100, 0],
        y: [0, 50, 0]
      }}
      transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      className="absolute bottom-[-20%] right-[-10%] w-[70vh] h-[70vh] bg-gradient-to-br from-cyan-600/30 to-blue-600/30 rounded-full blur-[120px] mix-blend-screen" 
    />
    <div className="absolute inset-0 bg-[#0f172a]/80 backdrop-blur-[1px]"></div>
  </div>
);

const Home = () => {
  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans selection:bg-pink-500/30 overflow-x-hidden relative">
      
      <AnimatedBackground />

      {/* --- NAVBAR --- */}
      <nav className="relative z-50 border-b border-white/10 bg-[#0f172a]/60 backdrop-blur-xl supports-[backdrop-filter]:bg-[#0f172a]/60">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-xl flex items-center justify-center text-white overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500 via-purple-500 to-cyan-500 opacity-80 group-hover:opacity-100 transition-opacity"></div>
              <HeartHandshake size={24} className="relative z-10" />
            </div>
            <span className="font-extrabold text-xl text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tight">RallyPoint</span>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-white transition-colors hover:underline decoration-pink-500/50 underline-offset-4">Features</a>
            <a href="#impact" className="hover:text-white transition-colors hover:underline decoration-purple-500/50 underline-offset-4">Impact</a>
            <a href="#community" className="hover:text-white transition-colors hover:underline decoration-cyan-500/50 underline-offset-4">Community</a>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-white/5 font-semibold">
                Log in
              </Button>
            </Link>
            <Link to="/register">
              <Button className="relative overflow-hidden bg-white text-slate-900 hover:bg-slate-100 font-bold shadow-lg shadow-purple-500/20 rounded-full px-6 group">
                <span className="relative z-10">Get Started</span>
                <div className="absolute inset-0 h-full w-full scale-0 rounded-full transition-all duration-300 group-hover:scale-100 group-hover:bg-white/10"></div>
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
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-pink-300 text-sm font-medium backdrop-blur-md"
            >
              <Sparkles size={14} className="text-pink-400 animate-pulse" />
              <span>Introducing the new volunteer experience</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-[1.1]"
            >
              Make a difference, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 drop-shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                beautifully managed.
              </span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-xl text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed"
            >
              The modern platform for changemakers. Discover opportunities, track impact, and build community with powerful, intuitive tools.
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
              <Link to="/events">
                <Button size="lg" variant="outline" className="h-14 px-10 text-lg border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white hover:border-white/20 rounded-full w-full sm:w-auto backdrop-blur-md font-semibold">
                  Wait, Watch Demo <PlayCircle className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </motion.div>

            {/* Social Proof */}
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.8 }}
              className="pt-12 flex flex-wrap justify-center lg:justify-start gap-8 text-slate-500 font-medium"
            >
               <div className="flex items-center gap-2"><CheckCircle2 size={18} className="text-cyan-500" /> Trusted by 500+ Nonprofits</div>
               <div className="flex items-center gap-2"><CheckCircle2 size={18} className="text-purple-500" /> 120k+ Hours Logged</div>
            </motion.div>
          </div>

          {/* Right Hero Visual (Placeholder for a Dashboard Mockup) */}
          <motion.div
             initial={{ opacity: 0, scale: 0.9, x: 50 }} animate={{ opacity: 1, scale: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.3 }}
             className="hidden lg:block relative z-20"
          >
             <div className="relative rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 shadow-2xl shadow-purple-900/20 transform rotate-2 hover:rotate-0 transition-all duration-500">
                 <div className="aspect-video rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 overflow-hidden relative">
                    {/* Abstract UI Placeholder */}
                    <div className="absolute top-0 left-0 right-0 h-12 bg-white/5 border-b border-white/5 flex items-center px-4 gap-2">
                       <div className="w-3 h-3 rounded-full bg-red-400/50"></div>
                       <div className="w-3 h-3 rounded-full bg-yellow-400/50"></div>
                       <div className="w-3 h-3 rounded-full bg-green-400/50"></div>
                    </div>
                    <div className="mt-16 px-8 space-y-4">
                       <div className="h-8 w-1/3 bg-white/10 rounded-lg animate-pulse"></div>
                       <div className="grid grid-cols-3 gap-4">
                          <div className="h-24 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-xl border border-white/5"></div>
                          <div className="h-24 bg-gradient-to-br from-purple-500/20 to-cyan-500/20 rounded-xl border border-white/5"></div>
                          <div className="h-24 bg-white/5 rounded-xl border border-white/5"></div>
                       </div>
                    </div>
                    {/* Glowing Orb Behind */}
                    <div className="absolute -inset-10 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 blur-3xl opacity-20 -z-10 rounded-full"></div>
                 </div>
             </div>
          </motion.div>
        </div>
      </section>

      {/* --- STATS BANNER --- */}
      <section className="relative z-10 py-16 bg-white/5 backdrop-blur-md border-y border-white/5">
         <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
             <StatBox value="10k+" label="Active Volunteers" color="from-pink-500 to-purple-500" />
             <StatBox value="500+" label="Events Hosted" color="from-purple-500 to-cyan-500" />
             <StatBox value="98%" label="Satisfaction Rate" color="from-cyan-500 to-blue-500" />
             <StatBox value="50+" label="Communities" color="from-blue-500 to-purple-500" />
         </div>
      </section>

      {/* --- FEATURES GRID --- */}
      <section id="features" className="relative z-10 py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="inline-block mb-4"
            >
               <span className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-cyan-400 uppercase tracking-widest">
                  Powerful Platform
               </span>
            </motion.div>
            <motion.h2 
               initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
               className="text-4xl md:text-5xl font-extrabold text-white mb-6"
            >
               Everything you need to <br/> maximize impact.
            </motion.h2>
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
      <section className="relative z-10 py-32 px-6 mt-20">
        <div className="max-w-7xl mx-auto relative z-20 bg-gradient-to-br from-indigo-900/50 to-purple-900/50 rounded-[3rem] p-12 md:p-24 text-center overflow-hidden border border-white/10 backdrop-blur-xl shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay"></div>
          <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-pink-500/30 blur-[150px] rounded-full mix-blend-screen"></div>
          <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-cyan-500/30 blur-[150px] rounded-full mix-blend-screen"></div>
          
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
              <li><a href="#" className="hover:text-pink-400 transition-colors">Browse Events</a></li>
              <li><a href="#" className="hover:text-pink-400 transition-colors">For Nonprofits</a></li>
              <li><a href="#" className="hover:text-pink-400 transition-colors">Pricing Plans</a></li>
              <li><a href="#" className="hover:text-pink-400 transition-colors">Success Stories</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-white mb-6">Resources</h4>
            <ul className="space-y-3 text-sm text-slate-400 font-medium">
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Blog & News</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Guidelines</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">API Docs</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-6">Company</h4>
            <ul className="space-y-3 text-sm text-slate-400 font-medium">
              <li><a href="#" className="hover:text-purple-400 transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">Terms</a></li>
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
const StatBox = ({ value, label, color }) => (
  <div>
    <div className={`text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r ${color} mb-2`}>
      {value}
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
    {/* Hover Gradient Background */}
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

// Minimal CheckCircle Icon helper for social proof area
const CheckCircle2 = ({ size, className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
);

export default Home;