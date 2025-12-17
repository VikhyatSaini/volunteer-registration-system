import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Clock, Calendar, CheckCircle2, XCircle, Hourglass, History, Loader2 
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

import api from '../../lib/axios';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../../components/ui/table';

const MyHistory = () => {
  const queryClient = useQueryClient();
  const [selectedEventId, setSelectedEventId] = useState('');
  const [hours, setHours] = useState('');
  const [dateWorked, setDateWorked] = useState('');

  // 1. Fetch My Registered Events (For the dropdown)
  const { data: myEvents } = useQuery({
    queryKey: ['my-events'],
    queryFn: async () => {
      const response = await api.get('/users/my-events');
      return response.data;
    },
  });

  // 2. Fetch My Hour Logs (For the history table)
  const { data: hourLogs, isLoading } = useQuery({
    queryKey: ['my-hours'],
    queryFn: async () => {
      const response = await api.get('/users/my-hours');
      return response.data;
    },
  });

  // 3. Mutation to Submit Hours
  const submitHoursMutation = useMutation({
    mutationFn: async (data) => {
      return await api.post(`/events/${data.eventId}/loghours`, {
        hours: data.hours,
        dateWorked: data.dateWorked
      });
    },
    onSuccess: () => {
      toast.success("Hours submitted successfully! Waiting for approval.");
      setHours('');
      setDateWorked('');
      setSelectedEventId('');
      queryClient.invalidateQueries(['my-hours']);
      queryClient.invalidateQueries(['volunteer-dashboard']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to submit hours');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedEventId || !hours || !dateWorked) {
      toast.error("Please fill in all fields");
      return;
    }
    submitHoursMutation.mutate({ eventId: selectedEventId, hours, dateWorked });
  };

  // Filter events: Can only log hours for PAST events
  const eligibleEvents = myEvents?.filter(event => new Date(event.date) < new Date()) || [];

  return (
    <div className="space-y-8 pb-10">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Activity History</h1>
        <p className="text-slate-400 mt-1">Track your impact and log new volunteer hours.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        
        {/* LEFT COLUMN: Log Hours Form */}
        <div className="lg:col-span-1">
          <Card className="bg-slate-900/60 border-slate-800 backdrop-blur-sm sticky top-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-400">
                <Clock className="h-5 w-5" /> Log New Hours
              </CardTitle>
              <CardDescription>
                Submit hours for past events you attended.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Event Select */}
                <div className="space-y-2">
                  <Label htmlFor="event" className="text-slate-300">Select Event</Label>
                  <select
                    id="event"
                    className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    value={selectedEventId}
                    onChange={(e) => setSelectedEventId(e.target.value)}
                  >
                    <option value="">-- Choose a past event --</option>
                    {eligibleEvents.length > 0 ? (
                      eligibleEvents.map(event => (
                        <option key={event._id} value={event._id}>
                          {event.title} ({format(new Date(event.date), 'MMM d')})
                        </option>
                      ))
                    ) : (
                      <option disabled>No past events found</option>
                    )}
                  </select>
                </div>

                {/* Date Worked */}
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-slate-300">Date Worked</Label>
                  <Input
                    id="date"
                    type="date"
                    className="bg-slate-950 border-slate-700 [color-scheme:dark]"
                    value={dateWorked}
                    onChange={(e) => setDateWorked(e.target.value)}
                  />
                </div>

                {/* Hours Input */}
                <div className="space-y-2">
                  <Label htmlFor="hours" className="text-slate-300">Hours Contributed</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <Input
                      id="hours"
                      type="number"
                      min="0.5"
                      step="0.5"
                      placeholder="e.g. 3.5"
                      className="pl-9 bg-slate-950 border-slate-700"
                      value={hours}
                      onChange={(e) => setHours(e.target.value)}
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white mt-4"
                  disabled={submitHoursMutation.isPending || eligibleEvents.length === 0}
                >
                  {submitHoursMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    "Submit for Approval"
                  )}
                </Button>
                
                {eligibleEvents.length === 0 && (
                  <p className="text-xs text-amber-500/80 mt-2 text-center">
                    You haven't attended any past events yet.
                  </p>
                )}

              </form>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: History Table */}
        <div className="lg:col-span-2">
          <Card className="bg-slate-900/60 border-slate-800 backdrop-blur-sm h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5 text-indigo-400" /> Submission History
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-800 hover:bg-transparent">
                    <TableHead>Event</TableHead>
                    <TableHead>Date Worked</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-emerald-500" />
                      </TableCell>
                    </TableRow>
                  ) : hourLogs?.length > 0 ? (
                    hourLogs.map((log) => (
                      <TableRow key={log._id} className="border-slate-800">
                        <TableCell className="font-medium text-slate-200">
                          {log.event?.title || "Unknown Event"}
                        </TableCell>
                        <TableCell className="text-slate-400">
                          {format(new Date(log.dateWorked), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-slate-800 border-slate-700 text-slate-300">
                            {log.hours} hrs
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {log.status === 'approved' && (
                            <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-500 gap-1">
                              <CheckCircle2 className="h-3 w-3" /> Approved
                            </Badge>
                          )}
                          {log.status === 'pending' && (
                            <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-500 gap-1">
                              <Hourglass className="h-3 w-3" /> Pending
                            </Badge>
                          )}
                          {log.status === 'rejected' && (
                            <Badge variant="outline" className="border-red-500/30 bg-red-500/10 text-red-500 gap-1">
                              <XCircle className="h-3 w-3" /> Rejected
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-32 text-center text-slate-500">
                        No hours logged yet. Select a past event to get started.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MyHistory;