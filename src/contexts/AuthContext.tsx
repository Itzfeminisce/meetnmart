import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { Navigate, Outlet, redirect, useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: User | null;
  profile: any | null;
  userRole: 'buyer' | 'seller' | 'moderator' | 'admin' | null;
  wallet: { balance: number; escrowed_balance: number } | null;
  isLoading: boolean;
  signInWithPhone: (phoneNumber: string) => Promise<{ error: any | null }>;
  verifyOTP: (phoneNumber: string, token: string) => Promise<{ error: any | null }>;
  signOut: () => Promise<void>;
  fetchUserProfile: (userId?: string) => Promise<void>;
  updateUserRole: (role: 'buyer' | 'seller' | 'moderator' | 'admin') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAutheticated, setIsAutheticated] = useState<boolean>(false);
  const [profile, setProfile] = useState<any | null>(null);
  const [userRole, setUserRole] = useState<'buyer' | 'seller' | 'moderator' | 'admin' | null>(null);
  const [wallet, setWallet] = useState<{ balance: number; escrowed_balance: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserProfile = async (userId?: string) => {
    setIsLoading(true)
    try {
      const id = userId || user?.id;
      if (!id) {
        console.log("No user ID available for fetching profile");
        return;
      }

      console.log("Fetching profile for user ID:", id);

      // Fetch profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (profileError) {
        console.error("Profile fetch error:", profileError);
      } else {
        console.log("Profile data retrieved:", profileData ? "success" : "null");

        // Set default names if not already set
        if (profileData && !profileData.name) {
          const defaultName = profileData.is_seller ? 'MeetnMart Seller' : 'MeetnMart Buyer';
          
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ name: defaultName })
            .eq('id', id);

          if (updateError) {
            console.error("Error updating default name:", updateError);
          } else {
            profileData.name = defaultName;
          }
        }

        setProfile(profileData);
      }

      // Continue even if profile fetch failed
      
      // Fetch user role
      console.log("Fetching user role");
      const { data: roleData, error: roleError } = await supabase
        .rpc('get_user_role', { uid: id });

      if (roleError) {
        console.error("Role fetch error:", roleError);
      } else if (roleData) {
        console.log("User role:", roleData);
        setUserRole(roleData as 'buyer' | 'seller' | 'moderator' | 'admin');
      }

      // Fetch wallet data
      console.log("Fetching wallet data");
      const { data: walletData, error: walletError } = await supabase
        .rpc('get_user_wallet', { uid: id });

      if (walletError) {
        console.error("Wallet fetch error:", walletError);
      } else if (walletData) {
        console.log("Wallet data retrieved");
        setWallet(walletData as { balance: number; escrowed_balance: number });
      }
      
      console.log("User profile fetch complete");
    } catch (error: any) {
      console.error('Error fetching user profile:', error);
      // Don't rethrow - we want to continue even if there's an error
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
        const { data: {session}, error } = await supabase.auth.getSession();
      setIsAutheticated(!!session)
     if(!!session){
      setUser(session?.user)

      fetchUserProfile(session?.user.id)
     }
    };

    // Initialize auth immediately
    initializeAuth().finally(() => setIsLoading(false));

    const { data: {subscription} } = supabase.auth.onAuthStateChange(async (_, session) => {
      setIsAutheticated(!!session)
      setUser(session?.user);
    });

    // Cleanup function
    return () => {
        subscription.unsubscribe();
    };
  }, []);

  const signInWithPhone = async (phoneNumber: string) => {
    try {
      console.log("Signing in with phone:", phoneNumber);
      const { error } = await supabase.auth.signInWithOtp({
        phone: phoneNumber,
      });

      if (error) {
        console.error("Phone sign-in error:", error);
      } else {
        console.log("OTP sent successfully");
      }

      return { error };
    } catch (error: any) {
      console.error("Phone sign-in exception:", error);
      return { error };
    }
  };

  const verifyOTP = async (phoneNumber: string, token: string) => {
    try {
      console.log("Verifying OTP for phone:", phoneNumber);
      const { error } = await supabase.auth.verifyOtp({
        phone: phoneNumber,
        token,
        type: 'sms',
      });

      if (error) {
        console.error("OTP verification error:", error);
      } else {
        console.log("OTP verified successfully");
      }

      return { error };
    } catch (error: any) {
      console.error("OTP verification exception:", error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      console.log("Signing out");
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Sign out error:", error);
        toast.error('Failed to log out');
      } else {
        setUser(null);
        setProfile(null);
        setUserRole(null);
        setWallet(null);
        toast.success('Logged out successfully');
      }
    } catch (error) {
      console.error("Sign out exception:", error);
      toast.error('An error occurred during logout');
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserRole = async (role: 'buyer' | 'seller' | 'moderator' | 'admin') => {
    if (!user) {
      console.error("Cannot update role: No user logged in");
      return;
    }

    try {
      console.log("Updating user role to:", role);
      
      // Update user role in the database
      const { error: roleError } = await supabase
        .from('user_roles')
        .upsert({
          user_id: user.id,
          role
        });

      if (roleError) {
        console.error("Role update error:", roleError);
        throw roleError;
      }

      // Update profile with is_seller flag
      const isSeller = role === 'seller' || role === 'admin' || role === 'moderator';
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          is_seller: isSeller
        })
        .eq('id', user.id);

      if (profileError) {
        console.error("Profile update error:", profileError);
        throw profileError;
      }

      setUserRole(role);

      // Update the local profile
      if (profile) {
        console.log("Updating local profile with new role status");
        setProfile({
          ...profile,
          is_seller: isSeller
        });
      }

      console.log("User role updated successfully");
    } catch (error: any) {
      console.error('Error updating user role:', error);
      throw error;
    }
  };

  const value = {
    user,
    profile,
    userRole,
    wallet,
    isLoading,
    signInWithPhone,
    verifyOTP,
    signOut,
    fetchUserProfile,
    updateUserRole
  };

  
  if(!isAutheticated){
    redirect("/")
  }

  console.log({user, profile, userRole});
  
  // Make sure we always render the context provider, even if still loading
  return (
    <AuthContext.Provider value={value}>
        {children}
        {/* <Outlet /> */}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
// import React, { createContext, useContext, useEffect, useState } from 'react';
// import { supabase } from '@/integrations/supabase/client';
// import { User } from '@supabase/supabase-js';
// import { toast } from 'sonner';

// interface AuthContextType {
//   user: User | null;
//   profile: any | null;
//   userRole: 'buyer' | 'seller' | 'moderator' | 'admin' | null;
//   wallet: { balance: number; escrowed_balance: number } | null;
//   isLoading: boolean;
//   signInWithPhone: (phoneNumber: string) => Promise<{ error: any | null }>;
//   verifyOTP: (phoneNumber: string, token: string) => Promise<{ error: any | null }>;
//   signOut: () => Promise<void>;
//   fetchUserProfile: () => Promise<void>;
//   updateUserRole: (role: 'buyer' | 'seller' | 'moderator' | 'admin') => Promise<void>;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [user, setUser] = useState<User | null>(null);
//   const [profile, setProfile] = useState<any | null>(null);
//   const [userRole, setUserRole] = useState<'buyer' | 'seller' | 'moderator' | 'admin' | null>(null);
//   const [wallet, setWallet] = useState<{ balance: number; escrowed_balance: number } | null>(null);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {

  
//     // Check for session on initial load
//     const getSession = async () => {
//       try {
//         const { data, error } = await supabase.auth.getSession();
        
//         if (error) {
//           console.error("Session retrieval error:", error);
//           setIsLoading(false);
//           return;
//         }
        
//         setUser(data.session?.user || null);
        
//         if (data.session?.user) {
//           await fetchUserProfile(data.session.user.id);
//         }
        
//         setIsLoading(false);
//       } catch (error) {
//         console.error("Authentication error:", error);
//         setIsLoading(false);
//       }
//     };
  
//     getSession();
  
//     // Listen for auth changes
//     const { data: authListener } = supabase.auth.onAuthStateChange(
//       async (event, session) => {
//         console.log("Auth state changed:", event);
        
//         // Update the user state regardless of the event
//         setUser(session?.user || null);
  
//         // Handle different auth events
//         switch (event) {
//           case 'SIGNED_IN':
//             if (session?.user) {
//               await fetchUserProfile(session.user.id);
//             }
//             break;
            
//           case 'SIGNED_OUT':
//             // Clear user data
//             setProfile(null);
//             setUserRole(null);
//             setWallet(null);
//             break;
            
//           case 'USER_UPDATED':
//             if (session?.user) {
//               await fetchUserProfile(session.user.id);
//             }
//             break;
            
//           // Handle other events as needed
//         }
//       }
//     );
  
//     return () => {
//       // Cleanup subscription when component unmounts
//       if (authListener && authListener.subscription) {
//         authListener.subscription.unsubscribe();
//       }
//     };
//   }, []); // Empty dependency array to run once on mount

//   // useEffect(() => {
//   //   // Check for session on initial load
//   //   const getSession = async () => {
//   //     const { data } = await supabase.auth.getSession();
//   //     setUser(data.session?.user || null);
//   //     setIsLoading(false);

//   //     if (data.session?.user) {
//   //       await fetchUserProfile(data.session.user.id);
//   //     }
//   //   };

//   //   getSession();

//   //   // Listen for auth changes
//   //   const { data: { subscription } } = supabase.auth.onAuthStateChange(
//   //     async (event, session) => {
//   //       setUser(session?.user || null);

//   //       if (session?.user) {
//   //         console.log("Fecthi user");
          
//   //         try {
//   //           await fetchUserProfile(session.user.id);
//   //         } catch (error) {
//   //           console.log("fetchUserProfile",error);
            
//   //         }
//   //         console.log("Fecthi user 2");
//   //       } else {
//   //         setProfile(null);
//   //         setUserRole(null);
//   //         setWallet(null);
//   //       }
//   //     }
//   //   );

//   //   console.log({subscription});
    

//   //   return () => {
//   //     subscription.unsubscribe();
//   //   };
//   // }, []);

//   const fetchUserProfile = async (userId?: string) => {
//     try {
//       const id = userId || user?.id;
//       if (!id) return;

//       console.log({id});
      

//       // Fetch profile data
//       const { data: profileData, error: profileError, count,status,statusText } = await supabase
//         .from('profiles')
//         .select('*')
//         .eq('id', id)
//         .single();

        

//       if (profileError) throw profileError;

//       // Set default names if not already set
//       if (profileData && !profileData.name) {
//         const defaultName = profileData.is_seller ? 'MeetnMart Seller' : 'MeetnMart Buyer';
//         const { error: updateError } = await supabase
//           .from('profiles')
//           .update({ name: defaultName })
//           .eq('id', id);

//         if (updateError) throw updateError;
//         profileData.name = defaultName;
//       }

//       setProfile(profileData);

//       // Fetch user role
//       const { data: roleData, error: roleError } = await supabase
//         .rpc('get_user_role', { uid: id });

//       if (!roleError && roleData) {
//         setUserRole(roleData as 'buyer' | 'seller' | 'moderator' | 'admin');
//       }

//       // Fetch wallet data
//       const { data: walletData, error: walletError } = await supabase
//         .rpc('get_user_wallet', { uid: id });

//       if (!walletError && walletData) {
//         setWallet(walletData as { balance: number; escrowed_balance: number });
//       }
//     } catch (error: any) {
//       console.error('Error fetching user profile:', error);
//     }
//   };

//   const signInWithPhone = async (phoneNumber: string) => {
//     try {
//       const { error } = await supabase.auth.signInWithOtp({
//         phone: phoneNumber,
//       });

//       return { error };
//     } catch (error: any) {
//       return { error };
//     }
//   };

//   const verifyOTP = async (phoneNumber: string, token: string) => {
//     try {
//       const { error } = await supabase.auth.verifyOtp({
//         phone: phoneNumber,
//         token,
//         type: 'sms',
//       });

//       return { error };
//     } catch (error: any) {
//       return { error };
//     }
//   };

//   const signOut = async () => {
//     setIsLoading(true);
//     await supabase.auth.signOut();
//     setUser(null);
//     setProfile(null);
//     setUserRole(null);
//     setWallet(null);
//     setIsLoading(false);
//     toast.success('Logged out successfully');
//   };

//   const updateUserRole = async (role: 'buyer' | 'seller' | 'moderator' | 'admin') => {
//     if (!user) return;

//     try {
//       // Update user role in the database
//       const { error: roleError } = await supabase
//         .from('user_roles')
//         .upsert({
//           user_id: user.id,
//           role
//         });

//       if (roleError) throw roleError;

//       // Update profile with is_seller flag
//       const { error: profileError } = await supabase
//         .from('profiles')
//         .update({
//           is_seller: role === 'seller' || role === 'admin' || role === 'moderator'
//         })
//         .eq('id', user.id);

//       if (profileError) throw profileError;

//       setUserRole(role);

//       // Update the local profile
//       if (profile) {
//         setProfile({
//           ...profile,
//           is_seller: role === 'seller' || role === 'admin' || role === 'moderator'
//         });
//       }

//     } catch (error: any) {
//       console.error('Error updating user role:', error);
//       throw error;
//     }
//   };

//   const value = {
//     user,
//     profile,
//     userRole,
//     wallet,
//     isLoading,
//     signInWithPhone,
//     verifyOTP,
//     signOut,
//     fetchUserProfile,
//     updateUserRole
//   };

//   console.log({value});
  

//   return isLoading ? <p>Loadin configs..</p> : <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// };

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };
