import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  User, Mail, Calendar, Wrench, Camera, Loader2, Save, Upload
} from 'lucide-react';
import toast from 'react-hot-toast';

import api from '../lib/axios';
import useAuth from '../hooks/useAuth'; // Assuming you have this hook
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';

const Profile = () => {
  const { user: authUser, login } = useAuth(); // We might need 'login' or 'setUser' to update local context if you have it
  const queryClient = useQueryClient();
  
  // Local Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    skills: '', // displayed as comma-separated string
    availability: '', // displayed as comma-separated string
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // 1. Fetch Profile Data
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await api.get('/users/profile');
      return response.data;
    },
  });

  // 2. Populate Form when data arrives
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        email: profile.email || '',
        skills: profile.skills ? profile.skills.join(', ') : '',
        availability: profile.availability ? profile.availability.join(', ') : '',
      });
      setImagePreview(profile.profilePicture);
    }
  }, [profile]);

  // 3. Update Profile Mutation
  const updateMutation = useMutation({
    mutationFn: async (data) => {
      // Need FormData for file upload
      const form = new FormData();
      form.append('name', data.name);
      form.append('email', data.email);
      
      // Convert strings back to arrays for backend
      // Backend expects arrays, but FormData sends strings. 
      // Mongoose/Express often handles array fields in FormData automatically if sent as 'skills[]' 
      // OR we can just send them and handle splitting in backend. 
      // *Based on your controller*, it reads `req.body.skills`. 
      // Since FormData sends values as strings, we might need to send them carefully.
      // Easiest way for your specific backend (which might expect JSON logic): 
      // Use the individual fields. 
      
      // NOTE: Your backend controller reads `req.body.skills`. 
      // If we send via FormData, complex arrays can be tricky.
      // Strategy: Send them as individual items appended multiple times 
      // OR rely on the backend parsing a comma-separated string if it was built that way.
      // Looking at your User Model, it's [String]. 
      // Let's iterate and append.
      
      const skillList = data.skills.split(',').map(s => s.trim()).filter(Boolean);
      skillList.forEach(s => form.append('skills', s));

      const availList = data.availability.split(',').map(s => s.trim()).filter(Boolean);
      availList.forEach(s => form.append('availability', s));

      if (imageFile) {
        form.append('image', imageFile); // 'image' matches upload.single('image') in routes
      }

      return await api.put('/users/profile', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: (response) => {
      toast.success("Profile updated successfully!");
      queryClient.invalidateQueries(['profile']);
      
      // If your useAuth has a way to update the user in local storage/context without login, do it here.
      // Example: login(response.data); 
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (isLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-emerald-500" /></div>;

  return (
    <div className="max-w-4xl mx-auto pb-10 space-y-8">
      
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Account Settings</h1>
        <p className="text-slate-400 mt-1">Manage your profile details and preferences.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        
        {/* Left Col: Profile Card */}
        <div className="md:col-span-1">
          <Card className="bg-slate-900/60 border-slate-800 backdrop-blur-sm h-full">
            <CardContent className="pt-6 text-center space-y-4">
              
              <div className="relative inline-block group">
                <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-slate-800 shadow-xl mx-auto">
                  <img 
                    src={imagePreview || "https://via.placeholder.com/150"} 
                    alt="Profile" 
                    className="h-full w-full object-cover"
                  />
                </div>
                <label 
                  htmlFor="image-upload" 
                  className="absolute bottom-0 right-0 p-2 bg-emerald-600 rounded-full text-white cursor-pointer hover:bg-emerald-700 transition-colors shadow-lg"
                >
                  <Camera className="h-4 w-4" />
                </label>
                <input 
                  id="image-upload" 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleImageChange}
                />
              </div>

              <div>
                <h2 className="text-xl font-bold text-white">{profile?.name}</h2>
                <p className="text-slate-400 text-sm">{profile?.email}</p>
              </div>

              <div className="flex justify-center gap-2 pt-2">
                <Badge variant="secondary" className="bg-slate-800 text-slate-300">
                  {profile?.role?.toUpperCase()}
                </Badge>
                <Badge 
                  className={
                    profile?.status === 'approved' ? "bg-emerald-500/20 text-emerald-400" :
                    profile?.status === 'rejected' ? "bg-red-500/20 text-red-400" :
                    "bg-amber-500/20 text-amber-400"
                  }
                >
                  {profile?.status?.toUpperCase()}
                </Badge>
              </div>

            </CardContent>
          </Card>
        </div>

        {/* Right Col: Edit Form */}
        <div className="md:col-span-2">
          <Card className="bg-slate-900/60 border-slate-800 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Edit Profile</CardTitle>
              <CardDescription>Update your personal information.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-slate-300">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <Input 
                      id="name"
                      className="pl-9 bg-slate-950 border-slate-700 text-white"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-300">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <Input 
                      id="email"
                      type="email"
                      className="pl-9 bg-slate-950 border-slate-700 text-white"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>

                <Separator className="bg-slate-800" />

                {/* Availability */}
                <div className="space-y-2">
                  <Label htmlFor="availability" className="text-slate-300">Availability</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <Input 
                      id="availability"
                      placeholder="e.g. Weekends, Monday Mornings"
                      className="pl-9 bg-slate-950 border-slate-700 text-white"
                      value={formData.availability}
                      onChange={(e) => setFormData({...formData, availability: e.target.value})}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">Separate multiple times with commas.</p>
                </div>

                {/* Skills */}
                <div className="space-y-2">
                  <Label htmlFor="skills" className="text-slate-300">Skills & Interests</Label>
                  <div className="relative">
                    <Wrench className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <Input 
                      id="skills"
                      placeholder="e.g. First Aid, Driving, Coding"
                      className="pl-9 bg-slate-950 border-slate-700 text-white"
                      value={formData.skills}
                      onChange={(e) => setFormData({...formData, skills: e.target.value})}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">Separate multiple skills with commas.</p>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button 
                    type="submit" 
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    disabled={updateMutation.isPending}
                  >
                    {updateMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    Save Changes
                  </Button>
                </div>

              </form>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
};

export default Profile;