import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Loader2, Search, User, MoreVertical, Shield, ShieldAlert 
} from 'lucide-react';
import api from '../../lib/axios';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../../components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

const ManageVolunteers = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch Users
  const { data: users, isLoading, isError } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await api.get('/users');
      return response.data;
    },
  });

  // Filter Logic
  const filteredUsers = users?.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin text-indigo-500" /></div>;
  if (isError) return <div className="text-red-400 text-center mt-10">Failed to load users.</div>;

  return (
    <div className="space-y-6">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Volunteers</h1>
          <p className="text-slate-400">Manage user roles and permissions.</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <Input 
            placeholder="Search by name or email..." 
            className="pl-10 bg-slate-900/50 border-slate-700 focus:border-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Users Table Card */}
      <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <User className="h-5 w-5 text-indigo-400" />
            Registered Users ({filteredUsers?.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-slate-700">
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined Date</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers?.length > 0 ? (
                filteredUsers.map((user) => (
                  <TableRow key={user._id} className="border-slate-800">
                    <TableCell className="font-medium text-white">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 text-indigo-400 font-bold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        {user.name}
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {user.role === 'admin' ? (
                        <Badge variant="outline" className="border-purple-500/50 text-purple-400 gap-1">
                          <ShieldAlert className="h-3 w-3" /> Admin
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-blue-500/50 text-blue-400 gap-1">
                          <Shield className="h-3 w-3" /> Volunteer
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                       <Badge variant="success">Active</Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-slate-500">
                    No users found matching "{searchTerm}"
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

export default ManageVolunteers;