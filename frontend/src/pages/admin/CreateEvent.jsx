import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { 
  Calendar, MapPin, Upload, Sparkles, Tags, Type, 
  Loader2, ArrowLeft 
} from 'lucide-react';
import toast from 'react-hot-toast';

import api from '../../lib/axios';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

const CreateEvent = () => {
  const navigate = useNavigate();
  const [imagePreview, setImagePreview] = useState(null);
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [isGeneratingTags, setIsGeneratingTags] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      slotsAvailable: 10,
      tags: ''
    }
  });

  const watchedFields = watch(['title', 'location', 'date', 'description']);

  const createEventMutation = useMutation({
    mutationFn: async (formData) => {
      return await api.post('/events', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => {
      toast.success('Event launched successfully!');
      navigate('/admin');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create event');
    }
  });

  const onSubmit = (data) => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('date', data.date);
    formData.append('location', data.location);
    formData.append('slotsAvailable', data.slotsAvailable);
    
    const tagsArray = data.tags.split(',').map(t => t.trim()).filter(t => t);
    tagsArray.forEach(tag => formData.append('tags', tag));

    if (data.image && data.image[0]) {
      formData.append('image', data.image[0]);
    }

    createEventMutation.mutate(formData);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleGenerateDescription = async () => {
    if (!watchedFields[0] || !watchedFields[1]) {
      toast.error('Please enter a Title and Location first.');
      return;
    }
    
    setIsGeneratingDesc(true);
    try {
      const res = await api.post('/ai/generate', {
        title: watchedFields[0],
        location: watchedFields[1],
        date: watchedFields[2]
      });
      setValue('description', res.data.generatedDescription);
      toast.success('Description generated!');
    } catch (error) {
      toast.error('AI generation failed.');
    } finally {
      setIsGeneratingDesc(false);
    }
  };

  const handleAutoTag = async () => {
    if (!watchedFields[0] || !watchedFields[3]) {
      toast.error('Please enter a Title and Description first.');
      return;
    }

    setIsGeneratingTags(true);
    try {
      const res = await api.post('/ai/classify', {
        title: watchedFields[0],
        description: watchedFields[3],
        location: watchedFields[1]
      });
      const tagString = res.data.tags.join(', ');
      setValue('tags', tagString);
      toast.success('Tags generated!');
    } catch (error) {
      toast.error('AI tagging failed.');
    } finally {
      setIsGeneratingTags(false);
    }
  };

  return (
    <div className="min-h-screen relative w-full">
      
      {/* 1. FIXED BACKGROUND CONTAINER */}
      {/* This div stays pinned to the viewport, creating the effect that only content scrolls */}
      <div className="fixed inset-0 z-0 w-full h-full">
        {/* High-quality Event Stage Image */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center bg-no-repeat"></div>
        
        {/* Dark Gradient Overlay for Readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/70 via-slate-900/90 to-slate-950"></div>
      </div>

      {/* 2. SCROLLABLE CONTENT */}
      {/* Relative z-10 ensures this sits ON TOP of the fixed background and scrolls naturally */}
      <div className="relative z-10 max-w-4xl mx-auto pt-8 pb-20 px-4">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/admin')}
            className="text-slate-300 hover:text-white hover:bg-white/10 rounded-full"
          >
            <ArrowLeft size={24} />
          </Button>
          <div>
            <h1 className="text-4xl font-bold text-white tracking-tight drop-shadow-lg">Create Event</h1>
            <p className="text-slate-300 drop-shadow-md font-medium">Design and launch your next community initiative.</p>
          </div>
        </div>

        {/* Main Form Card */}
        <Card className="bg-slate-900/80 border-slate-700 backdrop-blur-md shadow-2xl">
          <CardHeader className="border-b border-slate-800 pb-6">
            <CardTitle className="text-white flex items-center gap-2 text-xl">
              <Sparkles className="h-5 w-5 text-indigo-400" />
              Event Details
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              
              {/* Image Upload Section */}
              <div className="space-y-3">
                <Label className="text-slate-300 text-sm uppercase tracking-wider font-semibold">Event Banner</Label>
                <div className="flex items-center justify-center w-full">
                  <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-slate-600 border-dashed rounded-xl cursor-pointer bg-slate-800/40 hover:bg-slate-800/60 hover:border-indigo-500/50 transition-all overflow-hidden relative group">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <div className="p-4 rounded-full bg-slate-800 mb-3 group-hover:scale-110 transition-transform shadow-lg">
                          <Upload className="w-8 h-8 text-slate-400 group-hover:text-indigo-400" />
                        </div>
                        <p className="mb-2 text-sm text-slate-400"><span className="font-semibold text-indigo-400">Click to upload</span> or drag and drop</p>
                        <p className="text-xs text-slate-500">SVG, PNG, JPG (MAX. 800x400px)</p>
                      </div>
                    )}
                    <input 
                      id="dropzone-file" 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      {...register("image", { onChange: handleImageChange })} 
                    />
                  </label>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-slate-300">Event Title</Label>
                  <div className="relative">
                    <Type className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <Input 
                      id="title" 
                      placeholder="e.g. Annual Beach Cleanup" 
                      className="pl-10 bg-slate-950/50 border-slate-700 focus:border-indigo-500 h-11"
                      {...register("title", { required: "Title is required" })} 
                    />
                  </div>
                  {errors.title && <span className="text-xs text-red-400">{errors.title.message}</span>}
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-slate-300">Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <Input 
                      id="location" 
                      placeholder="e.g. Central Park, NY" 
                      className="pl-10 bg-slate-950/50 border-slate-700 focus:border-indigo-500 h-11"
                      {...register("location", { required: "Location is required" })} 
                    />
                  </div>
                  {errors.location && <span className="text-xs text-red-400">{errors.location.message}</span>}
                </div>

                {/* Date */}
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-slate-300">Date & Time</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <Input 
                      id="date" 
                      type="datetime-local"
                      className="pl-10 bg-slate-950/50 border-slate-700 focus:border-indigo-500 h-11 [color-scheme:dark]"
                      {...register("date", { required: "Date is required" })} 
                    />
                  </div>
                  {errors.date && <span className="text-xs text-red-400">{errors.date.message}</span>}
                </div>

                {/* Slots */}
                <div className="space-y-2">
                  <Label htmlFor="slots" className="text-slate-300">Available Slots</Label>
                  <div className="relative">
                    <Input 
                      id="slots" 
                      type="number"
                      min="1"
                      className="bg-slate-950/50 border-slate-700 focus:border-indigo-500 h-11"
                      {...register("slotsAvailable", { required: "Slots are required" })} 
                    />
                  </div>
                </div>
              </div>

              {/* Description Section with AI Button */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="description" className="text-slate-300">Description</Label>
                  <button
                    type="button"
                    onClick={handleGenerateDescription}
                    disabled={isGeneratingDesc}
                    className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 hover:bg-indigo-500/20 hover:text-white transition-all disabled:opacity-50"
                  >
                    {isGeneratingDesc ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                    Generate with AI
                  </button>
                </div>
                <Textarea 
                  id="description" 
                  placeholder="Describe the event activity, requirements, and impact..."
                  className="h-40 bg-slate-950/50 border-slate-700 focus:border-indigo-500 leading-relaxed"
                  {...register("description", { required: "Description is required" })}
                />
                {errors.description && <span className="text-xs text-red-400">{errors.description.message}</span>}
              </div>

              {/* Tags Section with AI Button */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="tags" className="text-slate-300">Tags</Label>
                  <button
                    type="button"
                    onClick={handleAutoTag}
                    disabled={isGeneratingTags}
                    className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 hover:bg-emerald-500/20 hover:text-white transition-all disabled:opacity-50"
                  >
                    {isGeneratingTags ? <Loader2 className="h-3 w-3 animate-spin" /> : <Tags className="h-3 w-3" />}
                    Auto-Classify
                  </button>
                </div>
                <div className="relative">
                  <Input 
                    id="tags" 
                    placeholder="Environment, Outdoor, Teamwork..." 
                    className="bg-slate-950/50 border-slate-700 focus:border-indigo-500 h-11"
                    {...register("tags")} 
                  />
                </div>
                <p className="text-xs text-slate-500">Separate tags with commas.</p>
              </div>

              {/* Submit Button */}
              <div className="pt-6 flex justify-end gap-4 border-t border-slate-800">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/admin')}
                  className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white h-11 px-6"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[180px] h-11 text-base shadow-lg shadow-indigo-500/20"
                  disabled={createEventMutation.isPending}
                >
                  {createEventMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Launching...
                    </>
                  ) : (
                    "Launch Event"
                  )}
                </Button>
              </div>

            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateEvent;