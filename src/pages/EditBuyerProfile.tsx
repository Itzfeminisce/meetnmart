
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
import AppHeader from '@/components/AppHeader';
import { Separator } from '@/components/ui/separator';
import { useCreateInterests, useGetCategories } from '@/hooks/api-hooks';
import Loader from '@/components/ui/loader';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';



const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  description: z.string().optional(),
});

const EditBuyerProfile = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile?.avatar || null);
  const [uploading, setUploading] = useState(false);

  const { updateOnboardingStep } = useAuth()
  const { data: interests, error: _error, isLoading } = useGetCategories()
  const interestMutation = useCreateInterests()
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [error, setError] = useState(_error?.message || '');

  const toggleInterest = (interestId) => {
      const newSelection = selectedInterests.includes(interestId)
          ? selectedInterests.filter(id => id !== interestId)
          : [...selectedInterests, interestId];

      setSelectedInterests(newSelection);

      if (newSelection.length === 0) {
          setError('Please select at least one interest');
      } else {
          setError('');
      }
  };

  const handleSubmit = async () => {
      if (selectedInterests.length === 0) {
          setError('Please select at least one interest');
          return;
      }
      await interestMutation.mutateAsync({ interests: selectedInterests })
    
      await updateOnboardingStep(2)
      navigate("/feeds", { replace: true })
  };


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
      // await fetchUserProfile();
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
      // await fetchUserProfile();
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
    <>
      <AppHeader
        title='Edit Profile'
        onBackClick={() => navigate(-1)}
        showBackButton

      />
      <div className="app-container">
        <div className="rounded-xl p-6 mb-6">
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

          <div className="space-y-4">
            <h1 className='text-foreground'>Basic Information</h1>
            <Separator />
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-muted-foreground'>Display Name</FormLabel>
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
          <div className="space-y-4">
            <h1 className='text-foreground'>Interests</h1>
            {/* Flowing Badge Layout */}
            <div className="flex flex-wrap gap-3 justify-center mb-6 p-4">
              {isLoading ? <Loader /> : (
                interests.map((interest) => {
                  const isSelected = selectedInterests.includes(interest.id);
                  return (
                    <Tooltip>
                      <TooltipTrigger>
                        <Badge
                          key={interest.id}
                          variant="outline"
                          className={cn(
                            "cursor-pointer transition-all duration-200 px-4 py-2.5 text-sm font-medium rounded-full",
                            [
                              isSelected ? [`border-2  shadow-market-orange transform scale-105`, interest.color] :
                                `hover:border-current hover:shadow-sm`
                            ],
                          )
                          }
                          onClick={() => toggleInterest(interest.id)}
                        >
                          <span className="mr-2">{interest.icon}</span>
                          {interest.name}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        {interest.description}
                      </TooltipContent>
                    </Tooltip>
                  );
                })
              )}

            </div>

            <Separator />
          </div>
        </div>
      </div>
    </>
  );
};

export default EditBuyerProfile;
