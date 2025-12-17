import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Calendar, Clock, AlertCircle, Loader2, TrendingUp, 
  ArrowRight, CheckCircle2, Activity, UserPlus, FileText 
} from 'lucide-react';
import api from '../../lib/axios';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
  const navigate = useNavigate();

  // 1. Fetch Stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: async () => (await api.get('/admin/stats')).data,
  });

  // 2. Fetch Recent Activity Data (Users & Logs)
  const { data: recentActivity, isLoading: activityLoading } = useQuery({
    queryKey: ['recentActivity'],
    queryFn: async () => {
      const [usersRes, logsRes] = await Promise.all([
        api.get('/users'), 
        api.get('/admin/pending-hours')
      ]);

      const users = usersRes.data.map(u => ({
        type: 'registration',
        title: 'New Volunteer Registration',
        desc: `${u.name} joined the platform`,
        date: new Date(u.createdAt),
        icon: <UserPlus className="h-5 w-5" />,
        color: "bg-blue-500/10 border-blue-500/20 text-blue-500"
      }));

      const logs = logsRes.data.map(l => ({
        type: 'log',
        title: 'Hours Submitted',
        desc: `${l.volunteer?.name || 'Volunteer'} submitted ${l.hours} hours`,
        date: new Date(l.submittedAt),
        icon: <FileText className="h-5 w-5" />,
        color: "bg-purple-500/10 border-purple-500/20 text-purple-500"
      }));

      return [...users, ...logs]
        .sort((a, b) => b.date - a.date)
        .slice(0, 5); 
    },
  });

  const isLoading = statsLoading || activityLoading;

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
      </div>
    );
  }

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} mins ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;
    return `${Math.floor(hours / 24)} days ago`;
  };

  const statCards = [
    {
      title: "Total Volunteers",
      value: stats?.totalVolunteers || 0,
      icon: <Users className="h-6 w-6 text-white" />,
      gradient: "bg-gradient-to-br from-blue-600 to-indigo-600",
      shadow: "shadow-blue-500/20",
      trend: "Active community"
    },
    {
      title: "Pending Approvals",
      value: stats?.pendingVolunteers || 0,
      icon: <AlertCircle className="h-6 w-6 text-white" />,
      gradient: "bg-gradient-to-br from-amber-500 to-orange-600",
      shadow: "shadow-amber-500/20",
      trend: "Requires attention"
    },
    {
      title: "Upcoming Events",
      value: stats?.upcomingEvents || 0,
      icon: <Calendar className="h-6 w-6 text-white" />,
      gradient: "bg-gradient-to-br from-emerald-500 to-teal-600",
      shadow: "shadow-emerald-500/20",
      trend: "Scheduled ahead"
    },
    {
      title: "Hours Logged",
      value: stats?.totalHoursLogged || 0,
      icon: <Clock className="h-6 w-6 text-white" />,
      gradient: "bg-gradient-to-br from-purple-500 to-pink-600",
      shadow: "shadow-purple-500/20",
      trend: "Total impact"
    },
  ];

  return (
    <div className="min-h-full relative">
      
      {/* 1. RELEVANT BACKGROUND IMAGE (Team Collaboration) */}
      <div className="absolute inset-0 z-0 h-[500px] overflow-hidden">
        {/* The Image: A team working together around a table */}
        <div 
          className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center"
        ></div>
        
        {/* The Overlay: Heavy gradient to ensure text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/95 to-slate-950"></div>
      </div>

      {/* Main Content */}
      <div className="space-y-8 pb-10 relative z-10 pt-6">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:justify-between md:items-end gap-4"
        >
          <div>
            <h1 className="text-4xl font-bold text-white tracking-tight">Admin Dashboard</h1>
            <p className="text-slate-300 mt-2 text-lg">Manage your volunteers and track community impact.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="border-slate-600 hover:bg-slate-700 text-slate-200 bg-slate-800/50 backdrop-blur-sm">
              Download Report
            </Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20">
              <Activity className="mr-2 h-4 w-4" /> Live View
            </Button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`border-0 relative overflow-hidden ${stat.gradient} ${stat.shadow} shadow-lg transition-transform hover:-translate-y-1`}>
                <div className="absolute top-0 right-0 p-4 opacity-10 transform scale-150 translate-x-2 -translate-y-2">
                  {stat.icon}
                </div>
                <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                  <CardTitle className="text-sm font-medium text-white/90">
                    {stat.title}
                  </CardTitle>
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    {stat.icon}
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-3xl font-bold text-white">{stat.value}</div>
                  <div className="flex items-center text-white/80 text-xs mt-1 font-medium">
                    <TrendingUp className="mr-1 h-3 w-3" />
                    {stat.trend}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-7">
          
          {/* Recent Activity Feed */}
          <Card className="col-span-4 bg-slate-900/60 border-slate-800 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {recentActivity?.length > 0 ? (
                  recentActivity.map((item, i) => (
                    <div key={i} className="flex items-center group">
                      <div className={`h-10 w-10 rounded-full border flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform`}>
                        {item.icon}
                      </div>
                      <div className="ml-4 space-y-1 flex-1">
                        <p className="text-sm font-medium text-white leading-none">{item.title}</p>
                        <p className="text-sm text-slate-400">{item.desc}</p>
                      </div>
                      <div className="ml-auto font-medium text-xs text-slate-500">
                        {getTimeAgo(item.date)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-500">No recent activity found.</div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Quick Actions */}
          <Card className="col-span-3 bg-slate-900/60 border-slate-800 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <Button 
                variant="outline" 
                onClick={() => navigate('/admin/events/create')}
                className="h-auto py-4 justify-start border-slate-700 bg-slate-800/40 hover:bg-slate-800 hover:border-indigo-500/50 group transition-all"
              >
                <div className="bg-indigo-500/20 p-2 rounded-md mr-4 group-hover:bg-indigo-500 group-hover:text-white transition-colors text-indigo-400">
                  <Calendar className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-white">Create Event</div>
                  <div className="text-xs text-slate-400">Launch a new initiative</div>
                </div>
                <ArrowRight className="ml-auto h-4 w-4 text-slate-500 group-hover:text-white" />
              </Button>

              <Button 
                variant="outline" 
                onClick={() => navigate('/admin/volunteers')}
                className="h-auto py-4 justify-start border-slate-700 bg-slate-800/40 hover:bg-slate-800 hover:border-amber-500/50 group transition-all"
              >
                <div className="bg-amber-500/20 p-2 rounded-md mr-4 group-hover:bg-amber-500 group-hover:text-white transition-colors text-amber-400">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-white">Verify Users</div>
                  <div className="text-xs text-slate-400">Review pending requests</div>
                </div>
                <ArrowRight className="ml-auto h-4 w-4 text-slate-500 group-hover:text-white" />
              </Button>

              <Button 
                variant="outline" 
                onClick={() => navigate('/admin/approvals')}
                className="h-auto py-4 justify-start border-slate-700 bg-slate-800/40 hover:bg-slate-800 hover:border-emerald-500/50 group transition-all"
              >
                <div className="bg-emerald-500/20 p-2 rounded-md mr-4 group-hover:bg-emerald-500 group-hover:text-white transition-colors text-emerald-400">
                  <Clock className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-white">Approve Hours</div>
                  <div className="text-xs text-slate-400">Validate time logs</div>
                </div>
                <ArrowRight className="ml-auto h-4 w-4 text-slate-500 group-hover:text-white" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;