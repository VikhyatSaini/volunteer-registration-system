import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Loader2, CheckCircle2, XCircle, Clock, Calendar, MapPin, User
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns'; // Standard date formatting

import api from '../../lib/axios';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../../components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

const ApproveHours = () => {
  const queryClient = useQueryClient();

  // 1. Fetch Pending Logs
  const { data: logs, isLoading, isError } = useQuery({
    queryKey: ['pending-hours'],
    queryFn: async () => {
      const response = await api.get('/admin/pending-hours');
      return response.data;
    },
  });

  // 2. Approve/Reject Mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ logId, status }) => {
      return await api.patch(`/admin/hours/${logId}`, { status });
    },
    onSuccess: (_, variables) => {
      toast.success(`Hours ${variables.status === 'approved' ? 'Approved' : 'Rejected'}`);
      queryClient.invalidateQueries(['pending-hours']);
      queryClient.invalidateQueries(['adminStats']); // Refresh dashboard stats too
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Action failed');
    }
  });

  const handleAction = (logId, status) => {
    updateStatusMutation.mutate({ logId, status });
  };

  if (isLoading) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin text-indigo-500" /></div>;
  if (isError) return <div className="text-red-400 text-center mt-10">Failed to load pending logs.</div>;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Pending Approvals</h1>
        <p className="text-slate-400">Review and verify volunteer time submissions.</p>
      </div>

      {/* Main Table Card */}
      <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <Clock className="h-5 w-5 text-indigo-400" />
            Pending Requests ({logs?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-slate-700">
                <TableHead>Volunteer</TableHead>
                <TableHead>Event / Activity</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead className="text-right">Decision</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs?.length > 0 ? (
                logs.map((log) => (
                  <TableRow key={log._id} className="border-slate-800">
                    
                    {/* Volunteer Info */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 text-slate-400">
                          <User className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-medium text-white">{log.volunteer?.name}</div>
                          <div className="text-xs text-slate-500">{log.volunteer?.email}</div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Event Info */}
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium text-slate-200">{log.event?.title || "Custom Entry"}</div>
                        <div className="flex items-center text-xs text-slate-500 gap-1">
                          <MapPin className="h-3 w-3" /> {log.event?.location || "Remote/Unspecified"}
                        </div>
                      </div>
                    </TableCell>

                    {/* Date */}
                    <TableCell>
                      <div className="flex items-center gap-2 text-slate-300">
                        <Calendar className="h-4 w-4 text-slate-500" />
                        {format(new Date(log.date), 'MMM dd, yyyy')}
                      </div>
                    </TableCell>

                    {/* Hours */}
                    <TableCell>
                      <Badge variant="outline" className="text-lg px-3 py-1 border-slate-700 bg-slate-800 text-white font-bold">
                        {log.hours} <span className="text-xs font-normal text-slate-400 ml-1">hrs</span>
                      </Badge>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          size="sm"
                          variant="ghost"
                          onClick={() => handleAction(log._id, 'rejected')}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          disabled={updateStatusMutation.isPending}
                        >
                          <XCircle className="h-5 w-5 mr-1" /> Reject
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => handleAction(log._id, 'approved')}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-900/20"
                          disabled={updateStatusMutation.isPending}
                        >
                          {updateStatusMutation.isPending ? (
                             <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                             <>
                               <CheckCircle2 className="h-4 w-4 mr-2" /> Approve
                             </>
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-500">
                      <div className="h-16 w-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle2 className="h-8 w-8 text-emerald-500/50" />
                      </div>
                      <p className="text-lg font-medium text-white">All Caught Up!</p>
                      <p className="text-sm">No pending hour logs to review.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApproveHours;