
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

const categories = [
  { id: 'food', name: 'Food & Produce' },
  { id: 'crafts', name: 'Arts & Crafts' },
  { id: 'clothing', name: 'Clothing & Textiles' },
  { id: 'electronics', name: 'Electronics' },
  { id: 'services', name: 'Services' },
  { id: 'other', name: 'Other' },
];

const CATEGORIES = [
  'Fruits & Vegetables',
  'Meat & Fish',
  'Dairy & Eggs',
  'Bakery',
  'Spices & Seasonings',
  'Handicrafts',
  'Clothing & Textiles',
  'Jewelry',
  'Art & Collectibles',
  'Electronics',
  'Food Vendors',
  'Beauty & Wellness'
];

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  category: z.string().min(1, { message: "Please select a category" }),
  description: z.string().optional(),
  isSeller: z.boolean().default(true),
});

const EditSellerProfile = () => {
  const { user, profile, fetchUserProfile } = useAuth();
  const navigate = useNavigate();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile?.avatar || null);
  const [uploading, setUploading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: profile?.name || '',
      category: profile?.category || 'food',
      description: profile?.description || '',
      isSeller: profile?.is_seller === undefined ? true : profile.is_seller,
    },
  });
  
  useEffect(() => {
    // Update form when profile data loads
    if (profile) {
      form.reset({
        name: profile.name || '',
        category: profile.category || 'food',
        description: profile.description || '',
        isSeller: profile.is_seller === undefined ? true : profile.is_seller,
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
          category: values.category,
          description: values.description,
          is_seller: values.isSeller,
        })
        .eq('id', user.id);

      if (error) throw error;
      
      toast.success("Profile updated successfully!");
      await fetchUserProfile();
      navigate('/seller-dashboard');
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

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Business Category</FormLabel>
                  <FormControl>
                    <RadioGroup 
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-2 gap-2"
                    >
                      {categories.map(category => (
                        <div key={category.id} className="flex items-center space-x-2">
                          <RadioGroupItem value={category.id} id={category.id} />
                          <Label htmlFor={category.id}>{category.name}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isSeller"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox 
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Enable Seller Features
                    </FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Allow buyers to find and contact you
                    </p>
                  </div>
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

export default EditSellerProfile;
// import { useState, useEffect } from 'react';
// import { useAuth } from '@/contexts/AuthContext';
// import { useNavigate } from 'react-router-dom';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Textarea } from '@/components/ui/textarea';
// import { Label } from '@/components/ui/label';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// import { Camera, Loader2 } from 'lucide-react';
// import { getInitials } from '@/lib/utils';
// import { supabase } from '@/integrations/supabase/client';
// import { toast } from 'sonner';

// const CATEGORIES = [
//   'Fruits & Vegetables',
//   'Meat & Fish',
//   'Dairy & Eggs',
//   'Bakery',
//   'Spices & Seasonings',
//   'Handicrafts',
//   'Clothing & Textiles',
//   'Jewelry',
//   'Art & Collectibles',
//   'Electronics',
//   'Food Vendors',
//   'Beauty & Wellness'
// ];

// const EditSellerProfile = () => {
//   const { user, profile, fetchUserProfile, updateUserRole } = useAuth();
//   const navigate = useNavigate();
  
//   const [name, setName] = useState(profile?.name || '');
//   const [description, setDescription] = useState(profile?.description || '');
//   const [category, setCategory] = useState(profile?.category || '');
//   const [avatar, setAvatar] = useState<string | null>(profile?.avatar || null);
//   const [isUploading, setIsUploading] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   useEffect(() => {
//     if (profile) {
//       setName(profile.name || '');
//       setDescription(profile.description || '');
//       setCategory(profile.category || '');
//       setAvatar(profile.avatar || null);
//     }
//   }, [profile]);

//   const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file || !user) return;
    
//     setIsUploading(true);
    
//     try {
//       // In a real app, you'd upload this to storage
//       // For this demo, we'll use a data URL
//       const reader = new FileReader();
//       reader.onloadend = async () => {
//         const dataUrl = reader.result as string;
//         setAvatar(dataUrl);
//         setIsUploading(false);
//       };
//       reader.readAsDataURL(file);
//     } catch (error) {
//       console.error('Error uploading avatar:', error);
//       toast.error('Failed to upload avatar');
//       setIsUploading(false);
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!user) return;
    
//     setIsSubmitting(true);
    
//     try {
//       // Update profile
//       const { error: profileError } = await supabase
//         .from('profiles')
//         .update({
//           name,
//           description,
//           category,
//           avatar,
//           is_seller: true,
//           updated_at: new Date().toISOString()
//         })
//         .eq('id', user.id);
      
//       if (profileError) throw profileError;
      
//       // Ensure user role is set to seller
//       const { error: roleError } = await supabase
//         .from('user_roles')
//         .upsert({
//           user_id: user.id,
//           role: 'seller',
//           updated_at: new Date().toISOString()
//         });
      
//       if (roleError) throw roleError;
      
//       // Update local role
//       await updateUserRole('seller');
      
//       // Refresh profile data
//       await fetchUserProfile();
      
//       toast.success('Profile updated successfully');
//       navigate('/seller-dashboard');
//     } catch (error) {
//       console.error('Error updating profile:', error);
//       toast.error('Failed to update profile');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   if (!user) {
//     navigate('/');
//     return null;
//   }

//   return (
//     <div className="container max-w-md px-4 py-8">
//       <h1 className="text-2xl font-bold mb-6">Set Up Seller Profile</h1>
      
//       <form onSubmit={handleSubmit} className="space-y-6">
//         {/* Avatar Upload */}
//         <div className="flex justify-center mb-6">
//           <div className="relative">
//             <Avatar className="h-24 w-24 border-2 border-secondary">
//               {avatar ? (
//                 <AvatarImage src={avatar} alt={name} />
//               ) : (
//                 <AvatarFallback className="text-xl">
//                   {getInitials(name)}
//                 </AvatarFallback>
//               )}
//             </Avatar>
//             <label 
//               htmlFor="avatar-upload" 
//               className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-1.5 cursor-pointer shadow-md"
//             >
//               {isUploading ? (
//                 <Loader2 className="h-4 w-4 animate-spin" />
//               ) : (
//                 <Camera className="h-4 w-4" />
//               )}
//               <input
//                 id="avatar-upload"
//                 type="file"
//                 accept="image/*"
//                 className="hidden"
//                 onChange={handleAvatarChange}
//                 disabled={isUploading}
//               />
//             </label>
//           </div>
//         </div>
        
//         {/* Name Input */}
//         <div className="space-y-2">
//           <Label htmlFor="name">Display Name</Label>
//           <Input
//             id="name"
//             placeholder="Your name or business name"
//             value={name}
//             onChange={(e) => setName(e.target.value)}
//             required
//           />
//         </div>
        
//         {/* Category Selection */}
//         <div className="space-y-2">
//           <Label htmlFor="category">Category</Label>
//           <Select value={category} onValueChange={setCategory} required>
//             <SelectTrigger>
//               <SelectValue placeholder="Select a category" />
//             </SelectTrigger>
//             <SelectContent>
//               {CATEGORIES.map((cat) => (
//                 <SelectItem key={cat} value={cat}>{cat}</SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//         </div>
        
//         {/* Description */}
//         <div className="space-y-2">
//           <Label htmlFor="description">Description</Label>
//           <Textarea
//             id="description"
//             placeholder="Tell buyers about yourself and what you sell..."
//             value={description || ''}
//             onChange={(e) => setDescription(e.target.value)}
//             rows={4}
//           />
//         </div>
        
//         <Button 
//           type="submit" 
//           className="w-full" 
//           disabled={isSubmitting}
//         >
//           {isSubmitting ? (
//             <>
//               <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//               Saving...
//             </>
//           ) : (
//             'Save & Continue'
//           )}
//         </Button>
//       </form>
//     </div>
//   );
// };

// export default EditSellerProfile;