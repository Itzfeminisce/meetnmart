import { useCallback, useEffect, useState } from 'react';
import { Camera, LogOut, User, ArrowLeft, Settings, Edit3, Save, X } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { ReachabilityToggle } from '@/components/ReachabilityToggle';
import { useAuth } from '@/contexts/AuthContext';
import { cacheKeys, useToggleOnlineStatus } from '@/hooks/api-hooks';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';

const categories = [
  { id: 'food', name: 'Food & Produce', icon: '🍎' },
  { id: 'crafts', name: 'Arts & Crafts', icon: '🎨' },
  { id: 'clothing', name: 'Clothing & Textiles', icon: '👕' },
  { id: 'electronics', name: 'Electronics', icon: '📱' },
  { id: 'services', name: 'Services', icon: '🔧' },
  { id: 'other', name: 'Other', icon: '📦' },
];

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  category: z.string().min(1, { message: "Please select a category" }),
  description: z.string().optional(),
});

const SellerBasicProfileSettings = () => {
  const { user, profile, signOut, isLoading } = useAuth();
  const navigate = useNavigate();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile?.avatar || null);
  const [uploading, setUploading] = useState(false);
  const toggleOnline = useToggleOnlineStatus();
  const queryClient = useQueryClient()

  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: profile?.name || '',
      category: profile?.category || '',
      description: profile?.description || '',
    },
  });
  
  useEffect(() => {
    // Update form when profile data loads
    if (profile) {
      form.reset({
        name: profile.name || '',
        category: profile.category || '',
        description: profile.description || '',
      });
      setAvatarUrl(profile.avatar);
    }
  }, [profile, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: values.name,
          category: values.category,
          description: values.description,
        })
        .eq('id', user.id);

      if (error) {
        toast.error("Unable to update profile. Please try again");
        return;
      }
      
      toast.success("Profile updated successfully!");
      await queryClient.invalidateQueries({queryKey:[cacheKeys.userProfile(profile.id), cacheKeys.currentUser()]})
      // navigate(-1);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error("Failed to update profile. Please try again.");
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) {
      toast.error("You must be logged in to upload an avatar");
      return;
    }
  
    const file = event.target.files?.[0];
    if (!file) return;
  
    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}-${Math.random()}.${fileExt}`;
  
    setUploading(true);
  
    try {
      const { error: uploadError } = await supabase
        .storage
        .from('avatars')
        .upload(filePath, file);
  
      if (uploadError) throw uploadError;
  
      const { data } = supabase
        .storage
        .from('avatars')
        .getPublicUrl(filePath);
  
      const avatarUrl = data.publicUrl;
  
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar: avatarUrl })
        .eq('id', user.id);
  
      if (updateError) throw updateError;
  
      setAvatarUrl(avatarUrl);
      toast.success("Avatar updated successfully!");
      await queryClient.invalidateQueries({queryKey:[cacheKeys.userProfile(profile.id), cacheKeys.currentUser()]})
    } catch (error: any) {
      console.error('Upload error:', error.message || error);
      toast.error("Failed to upload avatar. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleSignOut = useCallback(async () => {
    toast.success('Clearing session...');
    await signOut();
    navigate('/');
  }, [signOut, navigate]);

  const handleToggleOnlineStatus = async (status: boolean) => {
    try {
      const _status = await toggleOnline.mutateAsync({
        status,
        userId: user.id
      });
    } catch (error) {
      console.error("Error updating online status", error?.message);
      toast.error("Unable to update status. Please try again");
    }
  };

  return (
    <>
      {/* Main Content */}
      <div className="md:p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Profile Card - Left Side */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl sticky top-24">
              {/* Avatar Section */}
              <div className="text-center mb-6">
                <div className="relative inline-block mb-4">
                  <div className="h-32 w-32 rounded-full border-4 border-orange-200 shadow-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white">
                    {/* <User size={48} /> */}
                    <Avatar className='w-full h-full object-contain'>
                      <AvatarFallback>{getInitials(profile.name)}</AvatarFallback>
                      <AvatarImage src={avatarUrl ?? profile.avatar} alt={profile.name}/>
                    </Avatar>
                  </div>
                  <div className="absolute -bottom-2 -right-2">
                    <label htmlFor="avatar-upload" className="h-12 w-12 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white flex items-center justify-center cursor-pointer hover:from-orange-600 hover:to-orange-700 shadow-lg transition-all duration-200 hover:scale-105 disabled:opacity-70">
                      <Camera size={20} />
                      <input 
                        id="avatar-upload" 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleAvatarUpload}
                        disabled={uploading}
                      />
                    </label>
                  </div>
                </div>
                <p className="text-sm text-gray-600 font-medium">
                  {uploading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                      Uploading...
                    </span>
                  ) : (
                    'Click camera to change photo'
                  )}
                </p>
              </div>

              <div className="space-y-4">
                {/* Logout Button */}
                <Button 
                  variant='ghost' 
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-colors text-red-500"
                  onClick={handleSignOut}
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>

                {/* Status Toggle */}
                <ReachabilityToggle defaultValue={profile?.is_reachable} onToggle={handleToggleOnlineStatus}/>
              </div>
            </div>
          </div>

          {/* Form Section - Right Side */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl shadow-xl md:border md:border-none border-market-orange/30 md:p-6">
              <div className="flex items-center gap-3 mb-8">
                <Edit3 className="w-6 h-6 text-orange-600" />
                <h2 className="text-2xl font-bold text-foreground">Profile Information</h2>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  
                  {/* Name Field */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="block text-base font-semibold text-muted-foreground mb-2">
                          Display Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="text"
                            placeholder="Enter your business name"
                            className="w-full h-12 px-4 rounded-lg focus:ring-0 focus:outline-none text-base"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Description Field */}
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="block text-base font-semibold text-muted-foreground mb-2">
                          Business Description
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="text"
                            placeholder="Tell customers about your products and services"
                            className="w-full h-12 px-4 rounded-lg focus:ring-0 focus:outline-none text-base"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Category Selection */}
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="block text-base font-semibold text-muted-foreground mb-4">
                          Business Category
                        </FormLabel>
                        <FormControl>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {categories.map(category => (
                              <label 
                                key={category.id}
                                className={`flex items-center space-x-3 p-4 rounded-xl border-2 cursor-pointer transition-all hover:border-muted-foreground ${
                                  field.value === category.id 
                                    ? 'border-muted-foreground' 
                                    : 'border-muted hover:border-orange-200/20'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name="category"
                                  value={category.id}
                                  checked={field.value === category.id}
                                  onChange={(e) => field.onChange(e.target.value)}
                                  className="w-4 h-4 text-orange-600 border-gray-300 focus:ring-orange-500"
                                />
                                <span className="text-xl">{category.icon}</span>
                                <span className="text-foreground font-medium">{category.name}</span>
                              </label>
                            ))}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Submit Button */}
                  <div className="pt-6">
                    <Button 
                      type="submit"
                      disabled={form.formState.isSubmitting}
                      className="w-full h-12 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold text-base rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {form.formState.isSubmitting ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Saving Changes...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <Save className="w-5 h-5" />
                          Save Changes
                        </span>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SellerBasicProfileSettings;
