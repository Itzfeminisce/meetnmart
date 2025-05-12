
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, User } from 'lucide-react';
import { toast } from 'sonner';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { supabase } from '@/integrations/supabase/client';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';



const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  description: z.string().optional(),
});

const EditBuyerProfile = () => {
  const { user, profile, fetchUserProfile } = useAuth();
  const navigate = useNavigate();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile?.avatar || null);
  const [uploading, setUploading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: profile?.name || '',
      description: profile?.description || '',
    },
  });
  
  useEffect(() => {
    // Update form when profile data loads
    if (profile) {
      form.reset({
        name: profile.name || '',
        description: profile.description || '',
      });
      setAvatarUrl(profile.avatar);
    }
  }, [profile, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) {
      toast.error("You must be logged in to update your profile");
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: values.name,
          description: values.description,
        })
        .eq('id', user.id);

      if (error) throw error;
      
      toast.success("Profile updated successfully!");
      await fetchUserProfile();
      // navigate('/seller-dashboard');
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
      await fetchUserProfile();
    } catch (error: any) {
      console.error('Upload error:', error.message || error);
      toast.error("Failed to upload avatar. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  if (!user) {
    navigate('/');
    return null;
  }

  return (
    <div className="app-container px-4 pt-6 pb-24 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gradient">Edit Profile</h1>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate(-1)}
        >
          Cancel
        </Button>
      </div>

      <div className="glass-morphism rounded-xl p-6 mb-6">
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="relative mb-4">
            <Avatar className="h-24 w-24 border-2 border-market-orange/50">
              {avatarUrl ? (
                <AvatarImage src={avatarUrl} alt="Profile" />
              ) : (
                <AvatarFallback className="bg-secondary text-foreground">
                  <User size={48} />
                </AvatarFallback>
              )}
            </Avatar>
            <div className="absolute bottom-0 right-0">
              <Label htmlFor="avatar-upload" className="h-8 w-8 rounded-full bg-market-orange text-white flex items-center justify-center cursor-pointer hover:bg-market-orange/90">
                <Camera size={16} />
                <input 
                  id="avatar-upload" 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleAvatarUpload}
                  disabled={uploading}
                />
              </Label>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            {uploading ? 'Uploading...' : 'Tap to change profile picture'}
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Brief description of your products/services" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full bg-market-orange hover:bg-market-orange/90"
              disabled={form.formState.isSubmitting || uploading}
            >
              {form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default EditBuyerProfile;
