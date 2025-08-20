import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Camera, Save, UserCheck, Edit3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Textarea } from '../ui/textarea';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
});

const BuyerBasicProfileSettings = () => {
  const { user, profile } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile?.avatar || null);
  const [uploading, setUploading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: profile?.name || '',
      description: profile?.description || '',
    },
  });

  // Update form when profile data changes
  useEffect(() => {
    if (profile) {
      form.reset({
        name: profile.name || '',
        description: profile.description || '',
      });
      setAvatarUrl(profile.avatar);
    }
  }, [profile, form]);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    const filePath = `${user.id}/${Date.now()}-${file.name}`;
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

      const newAvatarUrl = data.publicUrl;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar: newAvatarUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setAvatarUrl(newAvatarUrl);
      toast.success("Avatar updated successfully!");
    } catch (error: any) {
      console.error('Upload error:', error.message || error);
      toast.error("Failed to upload avatar. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: values.name,
          description: values.description,
        })
        .eq('id', user?.id);

      if (error) throw error;
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      console.error('Update error:', error.message || error);
      toast.error("Failed to update profile. Please try again.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Profile Header Card */}
      <Card className="border-none">

        <CardContent>
          <div className="flex flex-col items-center justify-center">
            <div className="relative mb-4 group">
              <Avatar className="h-28 w-28">
                {avatarUrl ? (
                  <AvatarImage src={avatarUrl} alt="Profile" className="object-cover" />
                ) : (
                  <AvatarFallback className="bg-market-green/10 text-market-green font-semibold text-2xl">
                    <User size={32} />
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="absolute -bottom-2 -right-2">
                <Label 
                  htmlFor="avatar-upload" 
                  className="h-10 w-10 rounded-full bg-market-orange text-white flex items-center justify-center cursor-pointer hover:bg-market-orange/90 shadow-lg transition-all duration-200 hover:scale-110"
                >
                  <Camera size={18} />
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
            <p className="text-sm text-muted-foreground text-center">
              {uploading ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-market-green border-t-transparent"></div>
                  Uploading...
                </span>
              ) : (
                'Click the camera icon to change your profile picture'
              )}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Basic Information Card */}
      <Card className="">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <UserCheck className="h-5 w-5 text-market-green" />
            Basic Information
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Update your display name and description
          </p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-foreground">
                      Display Name
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter your full name" 
                        {...field}
                        className=""
                      />
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
                    <FormLabel className="text-sm font-medium text-foreground">
                      Bio Description
                    </FormLabel>
                    <FormControl>
                      <Textarea 
                      rows={5}
                        placeholder="Tell us a bit about yourself..." 
                        {...field}
                        className=""
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="pt-4">
                <Button
                  type="submit"
                  variant='market'
                  className="w-full  font-medium py-3"
                  disabled={form.formState.isSubmitting || uploading}
                >
                  {form.formState.isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Saving Changes...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Save className="h-4 w-4" />
                      Save Changes
                    </span>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default BuyerBasicProfileSettings;