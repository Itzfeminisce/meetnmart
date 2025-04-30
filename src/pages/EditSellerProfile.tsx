
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Camera, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getInitials } from '@/lib/utils';

const EditSellerProfile = () => {
  const { user, profile, fetchUserProfile } = useAuth();
  const navigate = useNavigate();
  
  const [name, setName] = useState(profile?.name || '');
  const [description, setDescription] = useState(profile?.description || '');
  const [category, setCategory] = useState(profile?.category || '');
  const [isOnline, setIsOnline] = useState(profile?.is_online || false);
  const [isSeller, setIsSeller] = useState(profile?.is_seller || false);
  const [isLoading, setIsLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setDescription(profile.description || '');
      setCategory(profile.category || '');
      setIsOnline(profile.is_online || false);
      setIsSeller(profile.is_seller || false);
      setAvatarUrl(profile.avatar || '');
    }
  }, [profile]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarUrl(URL.createObjectURL(file));
    }
  };

  const uploadAvatar = async (): Promise<string | null> => {
    if (!avatarFile || !user) return null;
    
    try {
      const fileExt = avatarFile.name.split('.').pop();
      const filePath = `${user.id}-${Date.now()}.${fileExt}`;
      
      // Upload the file to Supabase Storage
      const { error: uploadError, data } = await supabase.storage
        .from('avatars')
        .upload(filePath, avatarFile);

      if (uploadError) throw uploadError;
      
      return `${filePath}`;
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      let avatarPath = profile?.avatar;
      
      // Upload new avatar if selected
      if (avatarFile) {
        avatarPath = await uploadAvatar();
      }
      
      // Update profile in Supabase
      const { error } = await supabase
        .from('profiles')
        .update({
          name,
          description,
          category,
          is_online: isOnline,
          is_seller: isSeller,
          avatar: avatarPath,
          updated_at: new Date()
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      // Update user role if seller status changed
      if (profile?.is_seller !== isSeller) {
        await supabase.from('user_roles').upsert({
          user_id: user.id,
          role: isSeller ? 'seller' : 'buyer',
          updated_at: new Date()
        });
      }
      
      // Refresh profile data
      await fetchUserProfile();
      
      toast.success('Profile updated successfully');

      // Navigate back to the appropriate dashboard
      navigate(isSeller ? '/seller-dashboard' : '/buyer-dashboard');
      
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackClick = () => {
    navigate(profile?.is_seller ? '/seller-dashboard' : '/buyer-dashboard');
  };

  const categories = [
    'Produce',
    'Fresh Meat',
    'Food & Beverages',
    'Art & Crafts',
    'Electronics',
    'Fashion',
    'Health & Beauty',
    'Home Goods',
    'Books & Music',
    'Other'
  ];

  return (
    <div className="app-container px-4 pt-6 pb-20 animate-fade-in">
      <div className="flex items-center mb-6">
        <Button 
          size="icon"
          variant="ghost"
          onClick={handleBackClick}
          className="mr-2"
        >
          <ArrowLeft />
        </Button>
        <h1 className="text-2xl font-bold text-gradient">Edit Profile</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col items-center">
          <div className="relative mb-4">
            <Avatar className="h-24 w-24 border-2 border-market-orange/50">
              {avatarUrl ? (
                <AvatarImage src={avatarUrl} alt={name} />
              ) : (
                <AvatarFallback className="text-xl">
                  {getInitials(name)}
                </AvatarFallback>
              )}
            </Avatar>
            <label 
              htmlFor="avatar-upload" 
              className="absolute bottom-0 right-0 bg-market-orange text-white p-2 rounded-full cursor-pointer shadow-lg"
            >
              <Camera size={16} />
            </label>
            <input 
              id="avatar-upload" 
              type="file" 
              accept="image/*" 
              onChange={handleAvatarChange}
              className="hidden" 
            />
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Display Name</Label>
            <Input 
              id="name" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your display name"
              className="bg-secondary/50 border-none"
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={profile?.is_seller ? "Tell buyers about yourself and what you sell..." : "Add a short bio..."}
              className="bg-secondary/50 border-none resize-none h-24"
            />
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="bg-secondary/50 border-none">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat.toLowerCase()}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="block text-muted-foreground mb-2">Account Type</Label>
            <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
              <div>
                <h3 className="font-medium">Seller Account</h3>
                <p className="text-sm text-muted-foreground">
                  {isSeller 
                    ? "You can receive calls and payments from buyers" 
                    : "Switch to seller mode to accept calls and payments"}
                </p>
              </div>
              <Switch 
                checked={isSeller}
                onCheckedChange={setIsSeller}
                className={isSeller ? 'bg-market-orange' : undefined}
              />
            </div>
          </div>

          {isSeller && (
            <div>
              <Label className="block text-muted-foreground mb-2">Availability</Label>
              <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                <div>
                  <h3 className="font-medium">Online Status</h3>
                  <p className="text-sm text-muted-foreground">
                    {isOnline 
                      ? "You're visible to buyers" 
                      : "You're not visible to buyers"}
                  </p>
                </div>
                <Switch 
                  checked={isOnline}
                  onCheckedChange={setIsOnline}
                  className={isOnline ? 'bg-market-green' : undefined}
                />
              </div>
            </div>
          )}
        </div>
        
        <Button 
          type="submit" 
          className="w-full bg-market-orange hover:bg-market-orange/90"
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </form>
    </div>
  );
};

export default EditSellerProfile;
