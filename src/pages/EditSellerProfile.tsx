import { useCallback, useEffect, useState } from 'react';
import { Camera, LogOut, User, ArrowLeft, Settings, Edit3, Save, X } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { ReachabilityToggle } from '@/components/ReachabilityToggle';
import { useAuth } from '@/contexts/AuthContext';
import { useToggleOnlineStatus } from '@/hooks/api-hooks';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { cacheKeys } from '../hooks/api-hooks';
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

const EditSellerProfileDemo = () => {
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
      {/* Header */}
      <AppHeader 
        title='Edit Profile'
        subtitle=""
        showBackButton
        onBackClick={() => navigate(-1)}
      />

      {/* Main Content */}
      <div className="container mb-[5rem]">
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
            <div className="rounded-2xl shadow-xl border md:border-none border-market-orange/30 p-6 sm:p-8">
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

export default EditSellerProfileDemo;
// import { useCallback, useEffect, useState } from 'react';
// import { Camera, LogOut, User, ArrowLeft, Settings, Edit3, Save, X } from 'lucide-react';
// import AppHeader from '@/components/AppHeader';
// import { useNavigate } from 'react-router-dom';
// import { Input } from '@/components/ui/input';
// import { Button } from '@/components/ui/button';
// import { ReachabilityToggle } from '@/components/ReachabilityToggle';
// import { useAuth } from '@/contexts/AuthContext';
// import { useToggleOnlineStatus } from '@/hooks/api-hooks';
// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { z } from 'zod';
// import { supabase } from '@/integrations/supabase/client';
// import { toast } from 'sonner';

// const categories = [
//   { id: 'food', name: 'Food & Produce', icon: '🍎' },
//   { id: 'crafts', name: 'Arts & Crafts', icon: '🎨' },
//   { id: 'clothing', name: 'Clothing & Textiles', icon: '👕' },
//   { id: 'electronics', name: 'Electronics', icon: '📱' },
//   { id: 'services', name: 'Services', icon: '🔧' },
//   { id: 'other', name: 'Other', icon: '📦' },
// ];

// // const categories = [
// //   { id: 'food', name: 'Food & Produce' },
// //   { id: 'crafts', name: 'Arts & Crafts' },
// //   { id: 'clothing', name: 'Clothing & Textiles' },
// //   { id: 'electronics', name: 'Electronics' },
// //   { id: 'services', name: 'Services' },
// //   { id: 'other', name: 'Other' },
// // ];

// // const CATEGORIES = [
// //   'Fruits & Vegetables',
// //   'Meat & Fish',
// //   'Dairy & Eggs',
// //   'Bakery',
// //   'Spices & Seasonings',
// //   'Handicrafts',
// //   'Clothing & Textiles',
// //   'Jewelry',
// //   'Art & Collectibles',
// //   'Electronics',
// //   'Food Vendors',
// //   'Beauty & Wellness'
// // ];

// const formSchema = z.object({
//   name: z.string().min(2, { message: "Name must be at least 2 characters" }),
//   category: z.string().min(1, { message: "Please select a category" }),
//   description: z.string().optional(),
// });
// const EditSellerProfileDemo = () => {
//     const { user, profile, fetchUserProfile , signOut, isLoading} = useAuth();
//   const navigate = useNavigate();
//   const [avatarUrl, setAvatarUrl] = useState<string | null>(profile?.avatar || null);
//   const [uploading, setUploading] = useState(false);
//   const toggleOnline = useToggleOnlineStatus()

//   const form = useForm<z.infer<typeof formSchema>>({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       name: profile?.name || '',
//       category: profile?.category || 'food',
//       description: profile?.description || '',
//     },
//   });
  
//   useEffect(() => {
//     // Update form when profile data loads
//     if (profile) {
//       form.reset({
//         name: profile.name || '',
//         category: profile.category || 'food',
//         description: profile.description || '',
//       });
//       setAvatarUrl(profile.avatar);
//     }
//   }, [profile, form]);

//   const onSubmit = async (values: z.infer<typeof formSchema>) => {
//     try {
//       const { error } = await supabase
//         .from('profiles')
//         .update({
//           name: values.name,
//           category: values.category,
//           description: values.description,
//         })
//         .eq('id', user.id);

//       if (error) {
//         toast.error("Unable to update profile. Please try again")
//         return;
//       }
      
//       toast.success("Profile updated successfully!");
//       await fetchUserProfile();
//       navigate('/seller-dashboard');
//     } catch (error) {
//       console.error('Error updating profile:', error);
//       toast.error("Failed to update profile. Please try again.");
//     }
//   };

//   const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
//     if (!user) {
//       toast.error("You must be logged in to upload an avatar");
//       return;
//     }
  
//     const file = event.target.files?.[0];
//     if (!file) return;
  
//     const fileExt = file.name.split('.').pop();
//     const filePath = `${user.id}-${Math.random()}.${fileExt}`;
  
//     setUploading(true);
  
//     try {
//       const { error: uploadError } = await supabase
//         .storage
//         .from('avatars')
//         .upload(filePath, file);
  
//       if (uploadError) throw uploadError;
  
//       const { data } = supabase
//         .storage
//         .from('avatars')
//         .getPublicUrl(filePath);
  
//       const avatarUrl = data.publicUrl;
  
//       const { error: updateError } = await supabase
//         .from('profiles')
//         .update({ avatar: avatarUrl })
//         .eq('id', user.id);
  
//       if (updateError) throw updateError;
  
//       setAvatarUrl(avatarUrl);
//       toast.success("Avatar updated successfully!");
//       await fetchUserProfile();
//     } catch (error: any) {
//       console.error('Upload error:', error.message || error);
//       toast.error("Failed to upload avatar. Please try again.");
//     } finally {
//       setUploading(false);
//     }
//   };
  

//   const handleSignOut = useCallback(async () => {
//     toast.success('Clearing session...');
//     await signOut();
//     navigate('/');
//   }, [signOut, navigate]);



//   const handleToggleOnlineStatus = async (status: boolean) => {
//     try {
//       const _status = await toggleOnline.mutateAsync({
//         status,
//         userId: user.id
//       })

//       // setIsOnline(_status)
//     } catch (error) {
//       console.error("Error updating online status", error?.message)
//       toast.error("Unable to update status. Please try again")
//     }
//   };


//   return (
//      <>
//       {/* Header */}
//       <AppHeader 
//       title='Edit Profile'
//       subtitle=""
//       showBackButton
//       onBackClick={() => navigate(-1)}
//       />

//       {/* Main Content */}
//       <div className="container mb-[5rem]">
        

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
//           {/* Profile Card - Left Side */}
//           <div className="lg:col-span-1">
//             <div className="rounded-2xl  p-6 sticky top-24">
//               {/* Avatar Section */}
//               <div className="text-center mb-6">
//                 <div className="relative inline-block mb-4">
//                   <div className="h-32 w-32 rounded-full border-4 border-orange-200 shadow-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white">
//                     <User size={48} />
//                   </div>
//                   <div className="absolute -bottom-2 -right-2">
//                     <button 
//                       onClick={handleAvatarUpload}
//                       disabled={uploading}
//                       className="h-12 w-12 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white flex items-center justify-center cursor-pointer hover:from-orange-600 hover:to-orange-700 shadow-lg transition-all duration-200 hover:scale-105 disabled:opacity-70"
//                     >
//                       <Camera size={20} />
//                     </button>
//                   </div>
//                 </div>
//                 <p className="text-sm text-gray-600 font-medium">
//                   {uploading ? (
//                     <span className="flex items-center justify-center gap-2">
//                       <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
//                       Uploading...
//                     </span>
//                   ) : (
//                     'Click camera to change photo'
//                   )}
//                 </p>
//               </div>

//     <div className="space-y-4">
//                   {/* Logout Button */}
//                   <Button variant='ghost' className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-colors text-destructive">
//                 <LogOut className="w-4 h-4" />
//                 Sign Out
//               </Button>

//               {/* Status Toggle */}
// <ReachabilityToggle defaultValue={profile.is_reachable} onToggle={handleToggleOnlineStatus}/>

//     </div>
            
//             </div>
//           </div>

//           {/* Form Section - Right Side */}
//           <div className="lg:col-span-2">
//             <div className=" rounded-2xl shadow-xl border md:border-none border-market-orange/30 p-6 sm:p-8">
//               <div className="flex items-center gap-3 mb-8">
//                 <Edit3 className="w-6 h-6 text-orange-600" />
//                 <h2 className="text-2xl font-bold text-foreground">Profile Information</h2>
//               </div>

//               <form onSubmit={handleSubmit} className="space-y-8">
                
//                 {/* Name Field */}
//                 <div>
//                   <label className="block text-base font-semibold text-muted-foreground mb-2">
//                     Display Name
//                   </label>
//                   <Input
//                     type="text"
//                     value={formData.name}
//                     onChange={(e) => handleInputChange('name', e.target.value)}
//                     placeholder="Enter your business name"
//                     className="w-full h-12 px-4 rounded-lg focus:ring-0  focus:outline-none text-base"
//                   />
//                 </div>

//                 {/* Description Field */}
//                 <div>
//                   <label className="block text-base font-semibold text-muted-foreground mb-2">
//                     Business Description
//                   </label>
//                   <Input
//                     type="text"
//                     value={formData.description}
//                     onChange={(e) => handleInputChange('description', e.target.value)}
//                     placeholder="Tell customers about your products and services"
//                     className="w-full h-12 px-4 rounded-lg focus:ring-0  focus:outline-none text-base"
//                   />
//                 </div>

//                 {/* Category Selection */}
//                 <div>
//                   <label className="block text-base font-semibold text-muted-foreground mb-4">
//                     Business Category
//                   </label>
//                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//                     {categories.map(category => (
//                       <label 
//                         key={category.id}
//                         className={`flex items-center space-x-3 p-4 rounded-xl border-2 cursor-pointer transition-all hover:border-muted-foreground ${
//                           formData.category === category.id 
//                             ? 'border-muted-foreground' 
//                             : 'border-muted hover:border-orange-200/20'
//                         }`}
//                       >
//                         <input
//                           type="radio"
//                           name="category"
//                           value={category.id}
//                           checked={formData.category === category.id}
//                           onChange={(e) => handleInputChange('category', e.target.value)}
//                           className="w-4 h-4 text-orange-600 border-gray-300 focus:ring-orange-500"
//                         />
//                         <span className="text-xl">{category.icon}</span>
//                         <span className="text-foreground font-medium">{category.name}</span>
//                       </label>
//                     ))}
//                   </div>
//                 </div>

//                 {/* Submit Button */}
//                 <div className="pt-6">
//                   <Button 
//                     type="submit"
//                     disabled={saving}
//                     className="w-full h-12 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold text-base rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
//                   >
//                     {saving ? (
//                       <span className="flex items-center justify-center gap-2">
//                         <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                         Saving Changes...
//                       </span>
//                     ) : (
//                       <span className="flex items-center justify-center gap-2">
//                         <Save className="w-5 h-5" />
//                         Save Changes
//                       </span>
//                     )}
//                   </Button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         </div>
//       </div>
//      </>
//   );
// };

// export default EditSellerProfileDemo;
// import { useState, useEffect, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '@/contexts/AuthContext';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// import { Camera, LogOut, User } from 'lucide-react';
// import { toast } from 'sonner';
// import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
// import { supabase } from '@/integrations/supabase/client';
// import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
// import { useForm } from 'react-hook-form';
// import { z } from 'zod';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { ReachabilityToggle } from '@/components/ReachabilityToggle';
// import { useToggleOnlineStatus } from '@/hooks/api-hooks';

// const categories = [
//   { id: 'food', name: 'Food & Produce' },
//   { id: 'crafts', name: 'Arts & Crafts' },
//   { id: 'clothing', name: 'Clothing & Textiles' },
//   { id: 'electronics', name: 'Electronics' },
//   { id: 'services', name: 'Services' },
//   { id: 'other', name: 'Other' },
// ];

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

// const formSchema = z.object({
//   name: z.string().min(2, { message: "Name must be at least 2 characters" }),
//   category: z.string().min(1, { message: "Please select a category" }),
//   description: z.string().optional(),
// });

// const EditSellerProfile = () => {
//   const { user, profile, fetchUserProfile , signOut, isLoading} = useAuth();
//   const navigate = useNavigate();
//   const [avatarUrl, setAvatarUrl] = useState<string | null>(profile?.avatar || null);
//   const [uploading, setUploading] = useState(false);
//   const toggleOnline = useToggleOnlineStatus()

//   const form = useForm<z.infer<typeof formSchema>>({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       name: profile?.name || '',
//       category: profile?.category || 'food',
//       description: profile?.description || '',
//     },
//   });
  
//   useEffect(() => {
//     // Update form when profile data loads
//     if (profile) {
//       form.reset({
//         name: profile.name || '',
//         category: profile.category || 'food',
//         description: profile.description || '',
//       });
//       setAvatarUrl(profile.avatar);
//     }
//   }, [profile, form]);

//   const onSubmit = async (values: z.infer<typeof formSchema>) => {
//     try {
//       const { error } = await supabase
//         .from('profiles')
//         .update({
//           name: values.name,
//           category: values.category,
//           description: values.description,
//         })
//         .eq('id', user.id);

//       if (error) {
//         toast.error("Unable to update profile. Please try again")
//         return;
//       }
      
//       toast.success("Profile updated successfully!");
//       await fetchUserProfile();
//       navigate('/seller-dashboard');
//     } catch (error) {
//       console.error('Error updating profile:', error);
//       toast.error("Failed to update profile. Please try again.");
//     }
//   };

//   const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
//     if (!user) {
//       toast.error("You must be logged in to upload an avatar");
//       return;
//     }
  
//     const file = event.target.files?.[0];
//     if (!file) return;
  
//     const fileExt = file.name.split('.').pop();
//     const filePath = `${user.id}-${Math.random()}.${fileExt}`;
  
//     setUploading(true);
  
//     try {
//       const { error: uploadError } = await supabase
//         .storage
//         .from('avatars')
//         .upload(filePath, file);
  
//       if (uploadError) throw uploadError;
  
//       const { data } = supabase
//         .storage
//         .from('avatars')
//         .getPublicUrl(filePath);
  
//       const avatarUrl = data.publicUrl;
  
//       const { error: updateError } = await supabase
//         .from('profiles')
//         .update({ avatar: avatarUrl })
//         .eq('id', user.id);
  
//       if (updateError) throw updateError;
  
//       setAvatarUrl(avatarUrl);
//       toast.success("Avatar updated successfully!");
//       await fetchUserProfile();
//     } catch (error: any) {
//       console.error('Upload error:', error.message || error);
//       toast.error("Failed to upload avatar. Please try again.");
//     } finally {
//       setUploading(false);
//     }
//   };
  

//   const handleSignOut = useCallback(async () => {
//     toast.success('Clearing session...');
//     await signOut();
//     navigate('/');
//   }, [signOut, navigate]);



//   const handleToggleOnlineStatus = async (status: boolean) => {
//     try {
//       const _status = await toggleOnline.mutateAsync({
//         status,
//         userId: user.id
//       })

//       // setIsOnline(_status)
//     } catch (error) {
//       console.error("Error updating online status", error?.message)
//       toast.error("Unable to update status. Please try again")
//     }
//   };



//   return (
//     <div className="px-4 pt-6 pb-24 animate-fade-in">
//       <div className="flex items-center justify-between mb-6">
//         <h1 className="text-2xl font-bold text-gradient">Edit Profile</h1>
//         <Button 
//           variant="outline" 
//           size="sm" 
//           onClick={() => navigate(-1)}
//         >
//           Cancel
//         </Button>
//       </div>

//       <div className="glass-morphism rounded-xl p-6 mb-6">
//         <div className="flex flex-col items-center justify-center mb-8">
//           <div className="relative mb-4">
//             <Avatar className="h-24 w-24 border-2 border-market-orange/50">
//               {avatarUrl ? (
//                 <AvatarImage src={avatarUrl} alt="Profile" className='object-cover'/>
//               ) : (
//                 <AvatarFallback className="bg-secondary text-foreground">
//                   <User size={48} />
//                 </AvatarFallback>
//               )}
//             </Avatar>
//             <div className="absolute bottom-0 right-0">
//               <Label htmlFor="avatar-upload" className="h-8 w-8 rounded-full bg-market-orange text-white flex items-center justify-center cursor-pointer hover:bg-market-orange/90">
//                 <Camera size={16} />
//                 <input 
//                   id="avatar-upload" 
//                   type="file" 
//                   accept="image/*" 
//                   className="hidden" 
//                   onChange={handleAvatarUpload}
//                   disabled={uploading}
//                 />
//               </Label>
//             </div>
//           </div>
//           <p className="text-sm text-muted-foreground">
//             {uploading ? 'Uploading...' : 'Tap to change profile picture'}
//           </p>
//         </div>

        

//             {/* Action Buttons */}
//             <div className="flex items-center justify-between w-full border border-muted rounded-md p-4">
//               <Button
//                 size="sm"
//                 variant="ghost"
//                 className="hover:bg-muted text-destructive"
//                 disabled={isLoading}
//                 onClick={handleSignOut}
//               >
//                 <LogOut className="w-5 h-5" />
//                 Logout
//               </Button>
//             </div>

//             <ReachabilityToggle defaultValue={profile.is_reachable} onToggle={handleToggleOnlineStatus} />

//         <Form {...form}>
//           <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
//             <FormField
//               control={form.control}
//               name="name"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Display Name</FormLabel>
//                   <FormControl>
//                     <Input placeholder="Your name" {...field} />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <FormField
//               control={form.control}
//               name="description"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Description</FormLabel>
//                   <FormControl>
//                     <Input placeholder="Brief description of your products/services" {...field} />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <FormField
//               control={form.control}
//               name="category"
//               render={({ field }) => (
//                 <FormItem className="space-y-3">
//                   <FormLabel>Business Category</FormLabel>
//                   <FormControl>
//                     <RadioGroup 
//                       onValueChange={field.onChange}
//                       defaultValue={field.value}
//                       className="grid grid-cols-2 gap-2"
//                     >
//                       {categories.map(category => (
//                         <div key={category.id} className="flex items-center space-x-2">
//                           <RadioGroupItem value={category.id} id={category.id} />
//                           <Label htmlFor={category.id}>{category.name}</Label>
//                         </div>
//                       ))}
//                     </RadioGroup>
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             {/* <FormField
//               control={form.control}
//               name="isSeller"
//               render={({ field }) => (
//                 <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
//                   <FormControl>
//                     <Checkbox 
//                       checked={field.value}
//                       onCheckedChange={field.onChange}
//                     />
//                   </FormControl>
//                   <div className="space-y-1 leading-none">
//                     <FormLabel>
//                       Enable Seller Features
//                     </FormLabel>
//                     <p className="text-sm text-muted-foreground">
//                       Allow buyers to find and contact you
//                     </p>
//                   </div>
//                 </FormItem>
//               )}
//             /> */}

//             <Button 
//               type="submit" 
//               className="w-full bg-market-orange hover:bg-market-orange/90"
//               disabled={form.formState.isSubmitting || uploading}
//             >
//               {form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
//             </Button>
//           </form>
//         </Form>
//       </div>
//     </div>
//   );
// };

// export default EditSellerProfile;
