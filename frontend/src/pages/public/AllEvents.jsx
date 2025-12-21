import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, Search, Loader2, ArrowRight, CheckCircle2, 
  ChevronLeft, ChevronRight, Eye, XCircle, ClipboardList, Calendar
} from 'lucide-react';
import { format, startOfDay } from 'date-fns'; // Import startOfDay
import toast from 'react-hot-toast';

import api from '../../lib/axios';
import useAuth from '../../hooks/useAuth';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../components/ui/card';

const ITEMS_PER_PAGE = 6;

const AllEvents = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const queryClient = useQueryClient();

  // 1. Fetch All Events
  const { data: events, isLoading, isError } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      // Ensure we get FRESH data
      const response = await api.get('/events?limit=1000');
      console.log("DEBUG: All Events fetched:", response.data); // Check console to see if new event is here
      return response.data;
    },
    staleTime: 0, // Always consider data stale to force refresh on mount
    refetchOnWindowFocus: true, 
  });

  // 2. Fetch My Registrations
  const { data: joinedEventIds } = useQuery({
    queryKey: ['my-registrations'],
    queryFn: async () => {
      if (!user) return [];
      try {
        const response = await api.get('/events/my-registrations');
        return response.data; 
      } catch (error) {
        return [];
      }
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
        return response.data.map(event => event._id); 
      } catch (error) {
        return [];
      }
    },
    enabled: !!user, 
  });

  // 4. Register Mutation
  const joinMutation = useMutation({
    mutationFn: async (eventId) => {
      return await api.post(`/events/${eventId}/register`);
    },
    onSuccess: () => {
      toast.success("Successfully registered! 🎉");
      queryClient.invalidateQueries(['events']); 
      queryClient.invalidateQueries(['my-registrations']); 
      queryClient.invalidateQueries(['volunteer-dashboard']); 
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to register');
    }
  });

  // 5. Unregister Mutation
  const leaveMutation = useMutation({
    mutationFn: async (eventId) => {
      return await api.delete(`/events/${eventId}/unregister`);
    },
    onSuccess: () => {
      toast.success("Unregistered successfully.");
      queryClient.invalidateQueries(['events']); 
      queryClient.invalidateQueries(['my-registrations']); 
      queryClient.invalidateQueries(['volunteer-dashboard']); 
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to unregister');
    }
  });

  // 6. Waitlist Mutation
  const waitlistMutation = useMutation({
    mutationFn: async (eventId) => {
      return await api.post(`/events/${eventId}/waitlist`);
    },
    onSuccess: () => {
      toast.success("Added to waitlist!");
      queryClient.invalidateQueries(['my-waitlist']); 
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to join waitlist');
    }
  });

  const handleJoin = (e, eventId) => {
    e.stopPropagation(); 
    if (!user) {
      toast.error("Please login to join events");
      return;
    }
    joinMutation.mutate(eventId);
  };

  const handleLeave = (e, eventId) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to give up your spot?")) return;
    leaveMutation.mutate(eventId);
  };

  const handleWaitlist = (e, eventId) => {
    e.stopPropagation();
    if (!user) {
      toast.error("Please login to join waitlist");
      return;
    }
    waitlistMutation.mutate(eventId);
  };

  // Reset page when searching
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // --- UPDATED FILTERING LOGIC ---
  const filteredEvents = events?.filter(event => {
    // 1. Search Filter
    const matchesSearch = 
      event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.tags || []).some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    // 2. Date Filter (Relaxed)
    // Show events that are today or in the future
    // We use startOfDay to compare just dates, ignoring time
    const eventDate = new Date(event.date);
    const today = startOfDay(new Date());
    const isUpcoming = eventDate >= today; 

    return matchesSearch && isUpcoming;
  }).sort((a, b) => new Date(a.date) - new Date(b.date)) || []; // Sort nearest first

  // Client-side Pagination Logic
  const totalPages = Math.ceil(filteredEvents.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentEvents = filteredEvents.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (isLoading) return <div className="flex items-center justify-center h-96"><Loader2 className="w-10 h-10 animate-spin text-emerald-500" /></div>;
  if (isError) return <div className="mt-20 text-center text-red-400">Failed to load events.</div>;

  return (
    <div className="pb-10 space-y-6">
      
      {/* Header & Search */}
      <div className="flex flex-col items-end justify-between gap-6 md:flex-row">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Explore Opportunities</h1>
          <p className="mt-1 text-base text-slate-400">Find your next mission and make an impact.</p>
        </div>
        
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <Input 
            placeholder="Search events..." 
            className="h-10 text-sm text-white pl-9 bg-slate-900/50 border-slate-700 focus:border-emerald-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Events Grid */}
      {currentEvents.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {currentEvents.map((event) => {
            const tags = event.tags || [];
            const registeredCount = event.registrationCount || 0;
            const remaining = Math.max(0, event.slotsAvailable - registeredCount);
            const isFull = remaining === 0;
            const dateStr = event.date ? format(new Date(event.date), 'MMM d, h:mm a') : 'TBD';

            // Status Checks
            const isJoined = joinedEventIds?.includes(event._id);
            const isOnWaitlist = waitlistedEventIds?.includes(event._id);

            return (
              <Card key={event._id} className="flex flex-col overflow-hidden transition-all duration-300 group border-slate-800 bg-slate-900/60 backdrop-blur-sm hover:border-emerald-500/50">
                
                {/* Image Section */}
                <div className="relative overflow-hidden h-36">
                  <div className="absolute inset-0 z-10 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent" />
                  <img 
                    src={event.bannerImage || "https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&q=80"} 
                    alt={event.title} 
                    className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute z-20 top-3 left-3">
                    <Badge className="bg-slate-950/80 backdrop-blur-md text-white border-slate-700 text-[10px] px-2 py-0.5">
                      {tags[0] || "General"}
                    </Badge>
                  </div>
                </div>

                {/* Content */}
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-start justify-between mb-1">
                    <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {dateStr}
                    </div>
                  </div>
                  <CardTitle className="text-base font-bold leading-tight text-white line-clamp-1">
                    {event.title}
                  </CardTitle>
                  <div className="flex items-center mt-1 text-xs text-slate-400">
                    <MapPin className="w-3 h-3 mr-1" /> {event.location}
                  </div>
                </CardHeader>
                
                <CardContent className="flex-1 p-4 pt-0">
                  <p className="mb-3 text-xs leading-relaxed text-slate-400 line-clamp-2">
                    {event.description}
                  </p>
                  
                  {/* Slots Info */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-medium">
                      <span className={isFull ? "text-red-400" : "text-emerald-400"}>
                        {isFull ? "Event Full" : `${remaining} Spots Left`}
                      </span>
                      <span className="text-slate-500">
                        {registeredCount} / {event.slotsAvailable} Filled
                      </span>
                    </div>
                    <div className="w-full h-1 overflow-hidden rounded-full bg-slate-800">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${isFull ? 'bg-red-500' : 'bg-emerald-500'}`} 
                        style={{ width: `${Math.min((registeredCount / event.slotsAvailable) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </CardContent>

                {/* Footer Buttons */}
                <CardFooter className="grid grid-cols-2 gap-2 p-3 pt-0 mt-auto border-t border-slate-800/50">
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-xs h-9 border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-slate-800 hover:text-white"
                    onClick={() => navigate(`/events/${event._id}`)}
                  >
                    <Eye className="w-3 h-3 mr-2" /> Details
                  </Button>

                  {/* Dynamic Button Logic */}
                  {isJoined ? (
                    <Button 
                      size="sm"
                      variant="destructive"
                      className="text-xs text-red-500 border h-9 bg-red-500/10 hover:bg-red-500/20 border-red-500/20"
                      onClick={(e) => handleLeave(e, event._id)}
                      disabled={leaveMutation.isPending}
                    >
                      {leaveMutation.isPending ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <>
                          Unregister <XCircle className="ml-1.5 h-3 w-3" />
                        </>
                      )}
                    </Button>

                  ) : isFull ? (
                    isOnWaitlist ? (
                      <Button size="sm" variant="secondary" disabled className="text-xs border h-9 bg-amber-500/10 text-amber-500 border-amber-500/20">
                         <ClipboardList className="mr-1.5 h-3 w-3" /> On Waitlist
                      </Button>
                    ) : (
                      <Button 
                        size="sm"
                        className="text-xs text-white h-9 bg-amber-600 hover:bg-amber-700"
                        onClick={(e) => handleWaitlist(e, event._id)}
                        disabled={waitlistMutation.isPending}
                      >
                        {waitlistMutation.isPending ? (
                           <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                           <>
                             Join Waitlist <ClipboardList className="ml-1.5 h-3 w-3" />
                           </>
                        )}
                      </Button>
                    )

                  ) : (
                    <Button 
                      size="sm"
                      className="text-xs text-white h-9 bg-emerald-600 hover:bg-emerald-700"
                      onClick={(e) => handleJoin(e, event._id)}
                      disabled={joinMutation.isPending}
                    >
                      {joinMutation.isPending ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <>
                          Register <ArrowRight className="ml-1.5 h-3 w-3" />
                        </>
                      )}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="py-20 text-center border border-dashed bg-slate-900/50 rounded-xl border-slate-800">
          <h3 className="text-lg font-medium text-white">No upcoming events found</h3>
          <p className="mt-1 text-sm text-slate-500">Check back later for new opportunities.</p>
        </div>
      )}

      {/* Pagination Controls */}
      {filteredEvents.length > ITEMS_PER_PAGE && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <div className="text-xs text-slate-500">
            Showing {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, filteredEvents.length)} of {filteredEvents.length} events
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="w-8 h-8 p-0 border-slate-700"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center px-2 text-sm text-slate-300">
              Page {currentPage} of {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="w-8 h-8 p-0 border-slate-700"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllEvents;