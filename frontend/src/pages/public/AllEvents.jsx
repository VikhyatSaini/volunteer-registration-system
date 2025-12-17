import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, Search, Loader2, ArrowRight, CheckCircle2, 
  ChevronLeft, ChevronRight, Eye, XCircle, ClipboardList
} from 'lucide-react';
import { format } from 'date-fns';
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
      const response = await api.get('/events');
      return response.data;
    },
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

  // 3. Fetch My Waitlist (New)
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

  // 6. Waitlist Mutation (New)
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

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const filteredEvents = events?.filter(event => 
    event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (event.tags || []).some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  const totalPages = Math.ceil(filteredEvents.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentEvents = filteredEvents.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (isLoading) return <div className="flex h-96 items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-emerald-500" /></div>;
  if (isError) return <div className="text-center mt-20 text-red-400">Failed to load events.</div>;

  return (
    <div className="space-y-6 pb-10">
      
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Explore Opportunities</h1>
          <p className="text-slate-400 mt-1 text-base">Find your next mission and make an impact.</p>
        </div>
        
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <Input 
            placeholder="Search events..." 
            className="pl-9 h-10 bg-slate-900/50 border-slate-700 focus:border-emerald-500 text-sm"
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
              <Card key={event._id} className="group flex flex-col overflow-hidden border-slate-800 bg-slate-900/60 backdrop-blur-sm hover:border-emerald-500/50 transition-all duration-300">
                
                {/* Image Section */}
                <div className="relative h-36 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent z-10" />
                  <img 
                    src={event.bannerImage || "https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&q=80"} 
                    alt={event.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 z-20">
                    <Badge className="bg-slate-950/80 backdrop-blur-md text-white border-slate-700 text-[10px] px-2 py-0.5">
                      {tags[0] || "General"}
                    </Badge>
                  </div>
                </div>

                {/* Content */}
                <CardHeader className="p-4 pb-2">
                  <div className="flex justify-between items-start mb-1">
                    <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                      {dateStr}
                    </div>
                  </div>
                  <CardTitle className="text-base font-bold text-white line-clamp-1 leading-tight">
                    {event.title}
                  </CardTitle>
                  <div className="flex items-center text-slate-400 text-xs mt-1">
                    <MapPin className="h-3 w-3 mr-1" /> {event.location}
                  </div>
                </CardHeader>
                
                <CardContent className="p-4 pt-0 flex-1">
                  <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed mb-3">
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
                    <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${isFull ? 'bg-red-500' : 'bg-emerald-500'}`} 
                        style={{ width: `${Math.min((registeredCount / event.slotsAvailable) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </CardContent>

                {/* Footer Buttons */}
                <CardFooter className="p-3 pt-0 grid grid-cols-2 gap-2 border-t border-slate-800/50 mt-auto">
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="h-9 border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-slate-800 hover:text-white text-xs"
                    onClick={() => navigate(`/events/${event._id}`)}
                  >
                    <Eye className="mr-2 h-3 w-3" /> Details
                  </Button>

                  {/* Dynamic Button Logic */}
                  {isJoined ? (
                    // State: Already Registered
                    <Button 
                      size="sm"
                      variant="destructive"
                      className="h-9 bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 text-xs"
                      onClick={(e) => handleLeave(e, event._id)}
                      disabled={leaveMutation.isPending}
                    >
                      {leaveMutation.isPending ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <>
                          Unregister <XCircle className="ml-1.5 h-3 w-3" />
                        </>
                      )}
                    </Button>

                  ) : isFull ? (
                    // State: Event Full (Check Waitlist)
                    isOnWaitlist ? (
                      <Button size="sm" variant="secondary" disabled className="h-9 bg-amber-500/10 text-amber-500 border border-amber-500/20 text-xs">
                         <ClipboardList className="mr-1.5 h-3 w-3" /> On Waitlist
                      </Button>
                    ) : (
                      <Button 
                        size="sm"
                        className="h-9 bg-amber-600 hover:bg-amber-700 text-white text-xs"
                        onClick={(e) => handleWaitlist(e, event._id)}
                        disabled={waitlistMutation.isPending}
                      >
                        {waitlistMutation.isPending ? (
                           <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                           <>
                             Join Waitlist <ClipboardList className="ml-1.5 h-3 w-3" />
                           </>
                        )}
                      </Button>
                    )

                  ) : (
                    // State: Available to Register
                    <Button 
                      size="sm"
                      className="h-9 bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                      onClick={(e) => handleJoin(e, event._id)}
                      disabled={joinMutation.isPending}
                    >
                      {joinMutation.isPending ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
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
        <div className="text-center py-20 bg-slate-900/50 rounded-xl border border-dashed border-slate-800">
          <h3 className="text-lg font-medium text-white">No events found</h3>
          <p className="text-slate-500 text-sm mt-1">Try adjusting your search terms.</p>
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
              className="h-8 w-8 p-0 border-slate-700"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center px-2 text-sm text-slate-300">
              Page {currentPage} of {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="h-8 w-8 p-0 border-slate-700"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllEvents;