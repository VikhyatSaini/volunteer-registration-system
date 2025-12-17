import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Calendar, MapPin, Clock, Users, ArrowLeft, Loader2, 
  CheckCircle2, XCircle, Share2, ClipboardList 
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

import api from '../../lib/axios';
import useAuth from '../../hooks/useAuth';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent } from '../../components/ui/card';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Local state for immediate UI feedback
  const [localWaitlist, setLocalWaitlist] = useState(false);

  // 1. Fetch Single Event Data
  const { data: event, isLoading, isError } = useQuery({
    queryKey: ['event', id],
    queryFn: async () => {
      const response = await api.get(`/events/${id}`);
      return response.data;
    },
  });

  // 2. Fetch My Registrations
  const { data: joinedEventIds } = useQuery({
    queryKey: ['my-registrations'],
    queryFn: async () => {
      if (!user) return [];
      const response = await api.get('/events/my-registrations');
      return response.data;
    },
    enabled: !!user,
  });

  // 3. Fetch My Waitlist
  const { data: waitlistedEventIds } = useQuery({
    queryKey: ['my-waitlist'],
    queryFn: async () => {
      if (!user) return [];
      try {
        const response = await api.get('/events/my-waitlist');
        return response.data;
      } catch (error) {
        return [];
      }
    },
    enabled: !!user,
  });

  // 4. Register Mutation
  const joinMutation = useMutation({
    mutationFn: async () => {
      return await api.post(`/events/${id}/register`);
    },
    onSuccess: () => {
      toast.success("Successfully registered! 🎉");
      queryClient.invalidateQueries(['event', id]); 
      queryClient.invalidateQueries(['my-registrations']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to register');
    }
  });

  // 5. Unregister Mutation
  const leaveMutation = useMutation({
    mutationFn: async () => {
      return await api.delete(`/events/${id}/unregister`);
    },
    onSuccess: () => {
      toast.success("Unregistered successfully.");
      queryClient.invalidateQueries(['event', id]);
      queryClient.invalidateQueries(['my-registrations']);
      setLocalWaitlist(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to unregister');
    }
  });

  // 6. Join Waitlist Mutation
  const waitlistMutation = useMutation({
    mutationFn: async () => {
      return await api.post(`/events/${id}/waitlist`);
    },
    onSuccess: (data) => {
      toast.success(data.data.message || "Added to waitlist!");
      setLocalWaitlist(true); 
      queryClient.invalidateQueries(['my-waitlist']);
    },
    onError: (error) => {
      const msg = error.response?.data?.message || 'Failed to join waitlist';
      if (msg.toLowerCase().includes("already")) {
        setLocalWaitlist(true);
        toast.error("You are already on the waitlist.");
      } else {
        toast.error(msg);
      }
    }
  });

  // --- NEW: SHARE FUNCTION ---
  const handleShare = async () => {
    const shareData = {
      title: event.title,
      text: `Check out this volunteer opportunity: ${event.title}`,
      url: window.location.href,
    };

    try {
      // 1. Try Native Share (Mobile)
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // 2. Fallback to Clipboard (Desktop)
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard! 📋");
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  if (isLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-emerald-500" /></div>;
  if (isError || !event) return <div className="text-center mt-20 text-red-400">Event not found.</div>;

  // Derived State
  const isJoined = joinedEventIds?.includes(id);
  const isOnWaitlist = waitlistedEventIds?.includes(id) || localWaitlist;
  
  const registeredCount = event.registrationCount || 0;
  const remaining = Math.max(0, event.slotsAvailable - registeredCount);
  const isFull = remaining === 0;

  return (
    <div className="pb-20 max-w-5xl mx-auto">
      
      {/* Back Button */}
      <Button 
        variant="ghost" 
        className="mb-6 text-slate-400 hover:text-white pl-0 hover:bg-transparent"
        onClick={() => navigate('/events')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Events
      </Button>

      {/* Hero Image Section */}
      <div className="relative w-full h-64 md:h-96 rounded-2xl overflow-hidden shadow-2xl shadow-emerald-900/10 mb-8 group">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/20 to-transparent z-10" />
        <img 
          src={event.bannerImage || "https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&q=80"} 
          alt={event.title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 p-6 md:p-10 z-20 w-full">
          <div className="flex flex-wrap gap-2 mb-4">
            {event.tags?.map((tag, i) => (
              <Badge key={i} className="bg-emerald-500/20 text-emerald-300 backdrop-blur-md border-0">
                {tag}
              </Badge>
            ))}
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 tracking-tight drop-shadow-lg">{event.title}</h1>
          <div className="flex items-center text-slate-300 text-lg">
            <MapPin className="h-5 w-5 mr-2 text-emerald-400" /> {event.location}
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        
        {/* Left Column: Description */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h2 className="text-2xl font-semibold text-white mb-4">About this Event</h2>
            <div className="prose prose-invert prose-slate max-w-none">
              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap text-lg">
                {event.description}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Action Card */}
        <div className="lg:col-span-1">
          <Card className="bg-slate-900/60 border-slate-800 backdrop-blur-xl sticky top-8">
            <CardContent className="p-6 space-y-6">
              
              {/* Date & Time */}
              <div className="flex items-start gap-4">
                <div className="bg-slate-800 p-3 rounded-lg text-emerald-400">
                  <Calendar className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-slate-400 text-sm font-medium uppercase tracking-wide">Date</p>
                  <p className="text-white font-semibold text-lg">{format(new Date(event.date), 'MMMM d, yyyy')}</p>
                  <p className="text-slate-400 text-sm">{format(new Date(event.date), 'EEEE')}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-slate-800 p-3 rounded-lg text-emerald-400">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-slate-400 text-sm font-medium uppercase tracking-wide">Time</p>
                  <p className="text-white font-semibold text-lg">{format(new Date(event.date), 'h:mm a')}</p>
                </div>
              </div>

              {/* Slots */}
              <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400 flex items-center gap-2">
                    <Users className="h-4 w-4" /> Capacity
                  </span>
                  <span className="text-white font-bold">{registeredCount} / {event.slotsAvailable} Filled</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${isFull ? 'bg-red-500' : 'bg-emerald-500'}`} 
                    style={{ width: `${Math.min((registeredCount / event.slotsAvailable) * 100, 100)}%` }}
                  />
                </div>
                <p className={`text-xs text-center font-medium ${isFull ? 'text-red-400' : 'text-emerald-400'}`}>
                  {isFull ? "No spots remaining" : `${remaining} spots left!`}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                
                {/* 1. If Joined -> Show Unregister */}
                {isJoined ? (
                  <Button 
                    variant="destructive" 
                    className="w-full h-12 text-base bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20"
                    onClick={() => {
                        if(confirm('Are you sure you want to unregister?')) leaveMutation.mutate();
                    }}
                    disabled={leaveMutation.isPending}
                  >
                    {leaveMutation.isPending ? <Loader2 className="animate-spin h-5 w-5" /> : (
                        <>Unregister <XCircle className="ml-2 h-5 w-5" /></>
                    )}
                  </Button>
                
                ) : isFull ? (
                  /* 2. If Full -> Show Waitlist or "On Waitlist" */
                  isOnWaitlist ? (
                     <Button disabled className="w-full h-12 text-base bg-amber-500/10 text-amber-500 border border-amber-500/20 cursor-not-allowed">
                        <ClipboardList className="mr-2 h-5 w-5" /> On Waitlist
                     </Button>
                  ) : (
                    <Button 
                      className="w-full h-12 text-base bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-900/20"
                      onClick={() => {
                          if(!user) toast.error("Please login to join waitlist");
                          else waitlistMutation.mutate();
                      }}
                      disabled={waitlistMutation.isPending}
                    >
                      {waitlistMutation.isPending ? <Loader2 className="animate-spin h-5 w-5" /> : (
                          <>Join Waitlist <ClipboardList className="ml-2 h-5 w-5" /></>
                      )}
                    </Button>
                  )

                ) : (
                  /* 3. Normal State -> Show Register */
                  <Button 
                    className="w-full h-12 text-base bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-900/20"
                    onClick={() => {
                        if(!user) toast.error("Please login to join");
                        else joinMutation.mutate();
                    }}
                    disabled={joinMutation.isPending}
                  >
                    {joinMutation.isPending ? <Loader2 className="animate-spin h-5 w-5" /> : (
                        <>Register Now <CheckCircle2 className="ml-2 h-5 w-5" /></>
                    )}
                  </Button>
                )}

                {/* --- SHARE BUTTON (FIXED) --- */}
                <Button 
                  variant="outline" 
                  className="w-full border-slate-700 hover:bg-slate-800 text-slate-400"
                  onClick={handleShare} // Added the handler here
                >
                  <Share2 className="mr-2 h-4 w-4" /> Share Event
                </Button>
              </div>

            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;