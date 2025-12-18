import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  Clock, Calendar, Award, TrendingUp, MapPin, 
  CheckCircle2, Hourglass, XCircle, AlertCircle, 
  CalendarDays, ArrowUpRight, Zap, Star
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { motion } from 'framer-motion';

import api from '../../lib/axios';
import useAuth from '../../hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';

// Animation variants for staggered entrance
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

const VolunteerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // 1. Fetch & Calculate All Data
  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['volunteer-dashboard'],
    queryFn: async () => {
      const [eventsRes, logsRes] = await Promise.all([
        api.get('/users/my-events'),
        api.get('/users/my-hours')
      ]);

      const events = eventsRes.data || [];
      const logs = logsRes.data || [];

      // --- CALCULATIONS ---
      
      // 1. Hours Stats
      const approvedHours = logs
        .filter(l => l.status === 'approved')
        .reduce((sum, l) => sum + (l.hours || 0), 0);
        
      const pendingHours = logs
        .filter(l => l.status === 'pending')
        .reduce((sum, l) => sum + (l.hours || 0), 0);

      // 2. Upcoming Schedule (Sorted by soonest)
      const now = new Date();
      const upcomingEvents = events
        .filter(e => new Date(e.date) > now)
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      // 3. Past Events (for calculating reliability/impact)
      const pastEventsCount = events.filter(e => new Date(e.date) < now).length;
      const avgHoursPerEvent = pastEventsCount > 0 ? (approvedHours / pastEventsCount).toFixed(1) : "0";

      // 4. Level Calculation (Gamification)
      let level = "Novice";
      let nextLevel = "Bronze";
      let progress = 0;
      let target = 10;
      let color = "text-slate-400";

      if (approvedHours >= 100) { 
        level = "Gold Master"; nextLevel = "Legend"; progress = 100; target = 100; color = "text-yellow-400";
      } else if (approvedHours >= 50) { 
        level = "Silver Elite"; nextLevel = "Gold"; progress = ((approvedHours - 50) / 50) * 100; target = 100; color = "text-slate-300";
      } else if (approvedHours >= 10) { 
        level = "Bronze Star"; nextLevel = "Silver"; progress = ((approvedHours - 10) / 40) * 100; target = 50; color = "text-amber-600";
      } else { 
        progress = (approvedHours / 10) * 100; 
      }

      return {
        stats: { approvedHours, pendingHours, eventsCount: events.length, avgHoursPerEvent },
        upcomingEvents,
        recentLogs: logs.slice(0, 5), // Top 5 recent logs
        levelData: { level, nextLevel, progress, target, color }
      };
    },
  });

  if (isLoading) return (
    <div className="flex items-center justify-center h-96">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
    </div>
  );

  const { stats, upcomingEvents, recentLogs, levelData } = dashboard;

  return (
    <motion.div 
      className="space-y-8 pb-10"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      
      {/* 1. Welcome Header with "Quick Stats" */}
      <div className="flex flex-col lg:flex-row justify-between items-end gap-6 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight">
            Dashboard
          </h1>
          <p className="text-slate-400 mt-2 text-lg">
            Welcome back, <span className="text-emerald-400 font-semibold">{user?.name}</span>!
            You are currently a <span className={`font-bold ${levelData.color}`}>{levelData.level}</span> volunteer.
          </p>
        </div>
        
        <div className="flex gap-3">
           <Button 
            onClick={() => navigate('/my-hours')} 
            variant="outline"
            className="border-slate-700 hover:bg-slate-800 text-slate-300"
          >
            <Clock className="mr-2 h-4 w-4" /> History
          </Button>
          <Button 
            onClick={() => navigate('/events')} 
            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-900/20"
          >
            <Calendar className="mr-2 h-4 w-4" /> Browse Events
          </Button>
        </div>
      </div>

      {/* 2. Colorful Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        
        {/* Card 1: Approved Hours (The most important stat) */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 bg-gradient-to-br from-emerald-900/50 to-slate-900 border-l-4 border-l-emerald-500 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-emerald-400 flex justify-between">
                Total Impact <TrendingUp className="h-4 w-4" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats.approvedHours} <span className="text-sm font-normal text-slate-400">hrs</span></div>
              <p className="text-xs text-slate-500 mt-1">Verified community service</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Card 2: Pending (Action needed/Waiting) */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 bg-gradient-to-br from-amber-900/20 to-slate-900 border-l-4 border-l-amber-500 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-amber-400 flex justify-between">
                Pending Approval <Hourglass className="h-4 w-4" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats.pendingHours} <span className="text-sm font-normal text-slate-400">hrs</span></div>
              <p className="text-xs text-slate-500 mt-1">Awaiting admin review</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Card 3: Events & Avg Impact */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 bg-gradient-to-br from-blue-900/20 to-slate-900 border-l-4 border-l-blue-500 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-400 flex justify-between">
                Missions Joined <CalendarDays className="h-4 w-4" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats.eventsCount}</div>
              <p className="text-xs text-slate-500 mt-1">
                Avg <span className="text-blue-200">{stats.avgHoursPerEvent} hrs</span> per mission
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Card 4: Gamification / Level */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 bg-gradient-to-br from-purple-900/40 to-slate-900 border-l-4 border-l-purple-500 shadow-lg relative overflow-hidden">
            {/* Background decorative blob */}
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-purple-500/20 rounded-full blur-2xl"></div>
            
            <CardHeader className="pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-purple-400 flex justify-between">
                Next Rank <Award className="h-4 w-4" />
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="flex justify-between items-end mb-2">
                <span className="text-xl font-bold text-white">{levelData.nextLevel}</span>
                <span className="text-xs text-purple-300">{Math.round(levelData.progress)}%</span>
              </div>
              <Progress value={levelData.progress} className="h-2 bg-slate-800" />
              <p className="text-[10px] text-slate-500 mt-2 text-right">
                {Math.max(0, levelData.target - stats.approvedHours)} more hours needed
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        
        {/* 3. Upcoming Schedule (Main Content) */}
        <Card className="md:col-span-4 border-slate-800 bg-slate-900/60 backdrop-blur-xl h-full">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
             <div className="space-y-1">
                <CardTitle className="flex items-center gap-2 text-white">
                  <Zap className="h-5 w-5 text-yellow-400 fill-yellow-400" /> Upcoming Schedule
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Your committed missions for the next few weeks.
                </CardDescription>
             </div>
             
             {/* --- NEW VIEW ALL BUTTON --- */}
             <Button 
                variant="outline" 
                size="sm"
                className="h-8 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800"
                onClick={() => navigate('/my-registrations')}
              >
                View All
              </Button>
          </CardHeader>

          <CardContent>
            {upcomingEvents.length > 0 ? (
              <div className="space-y-3">
                {upcomingEvents.slice(0, 3).map((event) => { // Limit to 3 items here since we have View All
                  const daysLeft = differenceInDays(new Date(event.date), new Date());
                  const isUrgent = daysLeft <= 2;
                  
                  return (
                    <motion.div 
                      key={event._id}
                      whileHover={{ scale: 1.01 }}
                      onClick={() => navigate(`/events/${event._id}`)}
                      className={`
                        group flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer
                        ${isUrgent 
                          ? 'bg-gradient-to-r from-amber-900/10 to-slate-900 border-amber-500/30' 
                          : 'bg-slate-950/50 border-slate-800 hover:border-emerald-500/30'}
                      `}
                    >
                      {/* Date Block */}
                      <div className={`
                        flex flex-col items-center justify-center h-16 w-16 rounded-lg border 
                        ${isUrgent ? 'bg-amber-900/20 border-amber-500/30 text-amber-400' : 'bg-slate-900 border-slate-700 text-slate-400'}
                      `}>
                        <span className="text-xs font-bold uppercase">{format(new Date(event.date), 'MMM')}</span>
                        <span className="text-2xl font-bold text-white">{format(new Date(event.date), 'dd')}</span>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h4 className="font-semibold text-slate-100 truncate pr-2 group-hover:text-emerald-400 transition-colors">
                            {event.title}
                          </h4>
                          {isUrgent && (
                            <Badge className="bg-amber-500 text-white text-[10px] px-1.5 animate-pulse">
                              Soon
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center text-xs text-slate-500 mt-1.5 gap-3">
                          <span className="flex items-center"><Clock className="h-3 w-3 mr-1" /> {format(new Date(event.date), 'h:mm a')}</span>
                          <span className="flex items-center"><MapPin className="h-3 w-3 mr-1" /> {event.location}</span>
                        </div>
                      </div>

                      <div className="hidden sm:block">
                        <ArrowUpRight className="h-5 w-5 text-slate-600 group-hover:text-white transition-colors" />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-slate-800 rounded-xl bg-slate-950/30">
                <div className="h-12 w-12 rounded-full bg-slate-900 flex items-center justify-center mb-4">
                   <Calendar className="h-6 w-6 text-slate-600" />
                </div>
                <p className="text-slate-300 font-medium">Clear Schedule</p>
                <p className="text-slate-500 text-sm mt-1 mb-4 max-w-xs">
                  You have no upcoming events. Ready to make a difference?
                </p>
                <Button variant="outline" size="sm" onClick={() => navigate('/events')} className="border-emerald-600 text-emerald-500 hover:bg-emerald-600 hover:text-white">
                  Find a Mission
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 4. Recent Logs (Sidebar) */}
        <Card className="md:col-span-3 border-slate-800 bg-slate-900/60 backdrop-blur-xl h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Star className="h-5 w-5 text-purple-500 fill-purple-500" /> Activity Feed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6 relative">
              {/* Vertical Line */}
              {recentLogs.length > 0 && (
                <div className="absolute left-[19px] top-3 bottom-3 w-0.5 bg-slate-800" />
              )}

              {recentLogs.length > 0 ? (
                recentLogs.map((log) => (
                  <div key={log._id} className="relative flex items-start gap-4">
                    {/* Status Dot */}
                    <div className={`
                      relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-slate-950 shadow-sm
                      ${log.status === 'approved' ? 'border-emerald-500/50 text-emerald-500' : 
                        log.status === 'rejected' ? 'border-red-500/50 text-red-500' : 
                        'border-amber-500/50 text-amber-500'}
                    `}>
                      {log.status === 'approved' ? <CheckCircle2 className="h-5 w-5" /> : 
                       log.status === 'rejected' ? <XCircle className="h-5 w-5" /> : 
                       <Hourglass className="h-5 w-5" />}
                    </div>

                    <div className="flex-1 pt-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <p className="text-sm font-medium text-slate-200 truncate pr-2">
                          {log.event?.title || 'Volunteer Work'}
                        </p>
                        <span className="text-[10px] text-slate-500 whitespace-nowrap">
                          {format(new Date(log.dateWorked || log.createdAt), 'MMM d')}
                        </span>
                      </div>
                      <div className="flex items-center mt-1 gap-2">
                        <Badge variant="secondary" className="text-[10px] h-5 bg-slate-800 text-slate-300 hover:bg-slate-700">
                          {log.hours} hrs
                        </Badge>
                        <span className={`text-[10px] capitalize ${
                          log.status === 'approved' ? 'text-emerald-400' : 
                          log.status === 'pending' ? 'text-amber-400' : 'text-red-400'
                        }`}>
                          {log.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-slate-500">
                  <p className="text-sm">No recent activity.</p>
                </div>
              )}
            </div>
            
            <div className="mt-6 pt-4 border-t border-slate-800">
                <Button 
                variant="ghost" 
                className="w-full text-xs text-slate-400 hover:text-white hover:bg-slate-800"
                onClick={() => navigate('/my-hours')}
                >
                View Full History
                </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

export default VolunteerDashboard;