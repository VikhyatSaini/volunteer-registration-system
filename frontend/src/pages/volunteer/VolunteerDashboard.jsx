import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  Clock, Calendar, Award, TrendingUp, ArrowRight, 
  MapPin, CheckCircle2, Hourglass, XCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

import api from '../../lib/axios';
import useAuth from '../../hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';

const VolunteerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // 1. Fetch Volunteer Stats & Data
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['volunteer-dashboard'],
    queryFn: async () => {
      // Run in parallel: Stats, My Events, My Logs
      const [statsRes, eventsRes, logsRes] = await Promise.all([
        api.get('/volunteer/stats').catch(() => ({ data: { totalHours: 0, eventsCount: 0 } })), 
        api.get('/events/my-events'),
        api.get('/volunteer/history')
      ]);

      return {
        stats: statsRes.data,
        upcomingEvent: eventsRes.data.find(e => new Date(e.date) > new Date()), // Find next event
        recentLogs: logsRes.data.slice(0, 3) // Top 3 recent logs
      };
    },
  });

  const stats = dashboardData?.stats || { totalHours: 0, eventsCount: 0 };
  const nextEvent = dashboardData?.upcomingEvent;
  const recentLogs = dashboardData?.recentLogs || [];

  return (
    <div className="min-h-full space-y-8 pb-10">
      
      {/* 1. Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-end gap-4"
      >
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight">
            Welcome back, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-slate-400 mt-2 text-lg">
            Thank you for making a difference. Here is your impact overview.
          </p>
        </div>
        <Button 
          onClick={() => navigate('/events')}
          className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-900/20"
        >
          <Calendar className="mr-2 h-4 w-4" /> Browse Events
        </Button>
      </motion.div>

      {/* 2. Impact Cards (Emerald Theme) */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Total Hours */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-0 bg-gradient-to-br from-emerald-600 to-teal-600 shadow-lg shadow-emerald-500/20 relative overflow-hidden h-full">
            <div className="absolute top-0 right-0 p-4 opacity-10 transform scale-150">
              <Clock className="h-24 w-24 text-white" />
            </div>
            <CardHeader className="relative z-10 pb-2">
              <CardTitle className="text-sm font-medium text-white/90">Total Hours Contributed</CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-bold text-white">{stats.totalHours || 0}</div>
              <p className="text-emerald-100 text-sm mt-1 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" /> Lifetime Impact
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Events Attended */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm shadow-md hover:border-emerald-500/30 transition-colors h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Events Attended</CardTitle>
              <Award className="h-5 w-5 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats.eventsCount || 0}</div>
              <p className="text-slate-500 text-xs mt-1">Community initiatives joined</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Impact Level (Gamification Placeholder) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm shadow-md hover:border-blue-500/30 transition-colors h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Current Level</CardTitle>
              <Award className="h-5 w-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">Bronze Volunteer</div>
              <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-500 to-blue-500 h-full w-[45%]" />
              </div>
              <p className="text-slate-500 text-xs mt-2">5 more hours to Silver</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-7">
        
        {/* 3. Next Upcoming Event Highlight */}
        <Card className="col-span-4 border-slate-800 bg-slate-900/60 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Calendar className="h-5 w-5 text-emerald-400" /> 
              Next Upcoming Mission
            </CardTitle>
          </CardHeader>
          <CardContent>
            {nextEvent ? (
              <div className="relative rounded-xl overflow-hidden border border-slate-700 group">
                {/* Background Image with Overlay */}
                <div className="absolute inset-0 bg-slate-900/60 z-10 group-hover:bg-slate-900/50 transition-colors" />
                <img 
                  src={nextEvent.image || "https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&q=80"} 
                  alt="Event" 
                  className="w-full h-48 object-cover transition-transform duration-700 group-hover:scale-105"
                />
                
                {/* Content Overlay */}
                <div className="absolute inset-0 z-20 p-6 flex flex-col justify-end">
                  <div className="flex gap-2 mb-2">
                    <Badge className="bg-emerald-500/20 text-emerald-300 border-0 backdrop-blur-md">
                      {format(new Date(nextEvent.date), 'MMM dd')}
                    </Badge>
                    <Badge className="bg-slate-950/40 text-slate-200 border-0 backdrop-blur-md flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {format(new Date(nextEvent.date), 'h:mm a')}
                    </Badge>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-1">{nextEvent.title}</h3>
                  <div className="flex items-center text-slate-300 text-sm">
                    <MapPin className="h-3 w-3 mr-1" /> {nextEvent.location}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-48 rounded-xl border-2 border-dashed border-slate-700 flex flex-col items-center justify-center text-slate-500 gap-3">
                <Calendar className="h-10 w-10 opacity-50" />
                <p>No upcoming events scheduled.</p>
                <Button variant="link" onClick={() => navigate('/events')} className="text-emerald-400">
                  Browse Opportunities &rarr;
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 4. Recent Activity / Log Status */}
        <Card className="col-span-3 border-slate-800 bg-slate-900/60 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {recentLogs.length > 0 ? (
                recentLogs.map((log, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="mt-1">
                      {log.status === 'approved' && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
                      {log.status === 'pending' && <Hourglass className="h-5 w-5 text-amber-500" />}
                      {log.status === 'rejected' && <XCircle className="h-5 w-5 text-red-500" />}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium text-white leading-none">
                        Logged {log.hours} Hours
                      </p>
                      <p className="text-xs text-slate-500">
                        {log.event?.title || 'Custom Entry'} • {format(new Date(log.date), 'MMM dd')}
                      </p>
                    </div>
                    <Badge variant="outline" className={`
                      text-[10px] capitalize
                      ${log.status === 'approved' ? 'border-emerald-500/20 text-emerald-500' : ''}
                      ${log.status === 'pending' ? 'border-amber-500/20 text-amber-500' : ''}
                      ${log.status === 'rejected' ? 'border-red-500/20 text-red-500' : ''}
                    `}>
                      {log.status}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-500 text-sm">
                  You haven't logged any hours yet.
                </div>
              )}
              
              <Button 
                variant="outline" 
                className="w-full border-slate-700 hover:bg-slate-800 text-slate-300"
                onClick={() => navigate('/my-hours')}
              >
                View Full History
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VolunteerDashboard;