import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import {
  useQuery,
  useMutation,
  UseQueryOptions,
  UseMutationOptions,
  QueryClient,
  QueryKey,
  useQueryClient
} from '@tanstack/react-query';

export type UserRole = 'buyer' | 'seller' | 'moderator' | 'admin' | null;
export type UserProfile = Database['public']['Tables']['profiles']['Row']
export type WalletInfo = Database['public']['Tables']['wallets']['Row']
export type EscrowTransaction = Database['public']['Tables']['escrow_transactions']['Row']
export type UsersByRole = Database['public']['Functions']['get_users_by_role']['Returns'][number]
export type WalletSummary = Database['public']['Functions']['get_wallet_summary']['Returns']
export type Transaction = Database['public']['Functions']['get_call_sessions_with_transactions']

// Cache time constants for different data types
const CACHE_TIMES = {
  // Static/semi-static data - cache for longer periods
  USER_PROFILE: 10 * 60 * 1000, // 10 minutes
  USER_ROLE: 15 * 60 * 1000, // 15 minutes
  USER_LISTS: 5 * 60 * 1000, // 5 minutes (sellers, buyers, etc.)
  
  // Dynamic data - shorter cache times
  WALLET_DATA: 2 * 60 * 1000, // 2 minutes
  TRANSACTIONS: 1 * 60 * 1000, // 1 minute
  FEEDBACKS: 3 * 60 * 1000, // 3 minutes
  
  // Real-time data - very short cache
  CURRENT_USER: 30 * 1000, // 30 seconds
  WALLET_SUMMARY: 30 * 1000, // 30 seconds
} as const;

// Create a query client with optimized default options
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: (failureCount, error: any) => {
        // Don't retry on 401/403 errors (auth issues)
        if (error?.status === 401 || error?.status === 403) return false;
        return failureCount < 2; // Only retry twice
      },
      staleTime: CACHE_TIMES.USER_PROFILE, // Default stale time
      gcTime: 30 * 60 * 1000, // Garbage collect after 30 minutes
      // Enable background refetching for better UX
      refetchOnMount: 'always',
      refetchInterval: false, // We'll set specific intervals where needed
    },
    mutations: {
      retry: 1, // Only retry mutations once
    },
  },
});

// Cache key factories for consistent key generation
export const cacheKeys = {
  // Auth related
  currentUser: () => ['auth', 'current_user'] ,
  
  // User related
  userRole: (userId: string) => ['user', userId, 'role'] as const,
  userProfile: (userId: string) => ['user', userId, 'profile'] as const,
  userWallet: (userId: string) => ['user', userId, 'wallet'] as const,
  completeProfile: (userId: string) => ['user', userId, 'complete'] as const,
  
  // Lists
  usersByRole: (role: string) => ['users', 'by_role', role] as const,
  sellers: () => ['users', 'sellers'] as const,
  buyers: () => ['users', 'buyers'] as const,
  moderators: () => ['users', 'moderators'] as const,
  admins: () => ['users', 'admins'] as const,
  
  // Transactions and financial
  transactions: (params: any) => ['transactions', params] as const,
  walletSummary: () => ['wallet', 'summary'] as const,
  
  // Feedback
  feedbacks: () => ['feedbacks'] as const,
} as const;

/**
 * Enhanced useFetch with automatic cache optimization
 */
export function useFetch<
  TData = unknown,
  TError = Error,
  TQueryKey extends QueryKey = QueryKey
>(
  queryKey: TQueryKey,
  fetchFn: () => Promise<TData>,
  queryOptions?: Omit<UseQueryOptions<TData, TError, TData, TQueryKey>, 'queryKey' | 'queryFn'> & {
    cacheTime?: keyof typeof CACHE_TIMES;
  }
) {
  const { cacheTime, ...restOptions } = queryOptions || {};
  
  return useQuery<TData, TError, TData, TQueryKey>({
    queryKey,
    queryFn: fetchFn,
    staleTime: cacheTime ? CACHE_TIMES[cacheTime] : undefined,
    ...restOptions,
  });
}

/**
 * Enhanced useMutate with automatic cache invalidation patterns
 */
export function useMutate<
  TData = unknown,
  TError = Error,
  TVariables = void,
  TContext = unknown
>(
  mutateFn: (variables: TVariables) => Promise<TData>,
  mutationOptions?: Omit<UseMutationOptions<TData, TError, TVariables, TContext>, 'mutationFn'> & {
    invalidatePatterns?: string[][];
  }
) {
  const queryClient = useQueryClient();
  const { invalidatePatterns, ...restOptions } = mutationOptions || {};

  return useMutation<TData, TError, TVariables, TContext>({
    mutationFn: mutateFn,
    onSuccess: async (data, variables, context) => {
      // Auto-invalidate based on patterns
      if (invalidatePatterns) {
        await Promise.all(
          invalidatePatterns.map(pattern => 
            queryClient.invalidateQueries({ queryKey: pattern })
          )
        );
      }
      
      // Call original onSuccess if provided
      if (restOptions.onSuccess) {
        await restOptions.onSuccess(data, variables, context);
      }
    },
    ...restOptions,
  });
}

// ===================
// AUTH HOOKS
// ===================

export const useSignInWithPhone = () => {
  return useMutate(
    async ({ phoneNumber }: { phoneNumber: string }) => {
      const { error } = await supabase.auth.signInWithOtp({
        phone: phoneNumber,
      });
      if (error) throw error;
    },
    {
      invalidatePatterns: [cacheKeys.currentUser()],
    }
  );
};

export const useSignOut = () => {
  return useMutate(
    async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
    {
      onSuccess: async () => {
        // Clear all cache on sign out
        await queryClient.clear();
      },
    }
  );
};

export const useVerifyOTP = () => {
  return useMutate(
    async ({ phoneNumber, token }: { phoneNumber: string; token: string }) => {
      const { error } = await supabase.auth.verifyOtp({
        phone: phoneNumber,
        token,
        type: 'sms',
      });
      if (error) throw error;
    },
    {
      invalidatePatterns: [cacheKeys.currentUser()],
    }
  );
};

export const useCurrentUser = () => {
  return useFetch(
    cacheKeys.currentUser(),
    async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return user;
    },
    {
      cacheTime: 'CURRENT_USER',
      // Refetch every 5 minutes to keep auth state fresh
      refetchInterval: 5 * 60 * 1000,
    }
  );
};

export const useResetPassword = () => {
  return useMutate(async ({ email }: { email: string }) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  });
};

export const useUpdatePassword = () => {
  return useMutate(async ({ password }: { password: string }) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  });
};

// ===================
// USER MANAGEMENT HOOKS
// ===================

export const useUpdateUserRole = () => {
  return useMutate(
    async ({ userId, role }: { userId: string; role: UserRole }) => {
      const { error } = await supabase
        .from('user_roles')
        .upsert({
          user_id: userId,
          role
        });
      if (error) throw error;
      return { userId, role };
    },
    {
      onSuccess: async ({ userId, role }) => {
        // Update cache immediately for better UX
        queryClient.setQueryData(cacheKeys.userRole(userId), role);
        
        // Invalidate related queries
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: cacheKeys.completeProfile(userId) }),
          queryClient.invalidateQueries({ queryKey: ['users', 'by_role'] }),
          queryClient.invalidateQueries({ queryKey: ['users', 'sellers'] }),
          queryClient.invalidateQueries({ queryKey: ['users', 'buyers'] }),
          queryClient.invalidateQueries({ queryKey: ['users', 'moderators'] }),
          queryClient.invalidateQueries({ queryKey: ['users', 'admins'] }),
        ]);
      },
    }
  );
};

export const useUpdateProfile = () => {
  return useMutate(
    async ({ userId, update }: { 
      userId: string; 
      update: { name: string; category: string; description: string } 
    }) => {
      const { error } = await supabase
        .from('profiles')
        .update(update)
        .eq('id', userId);
      if (error) throw error;
      return { userId, update };
    },
    {
      onSuccess: async ({ userId, update }) => {
        // Optimistically update the cache
        queryClient.setQueryData(
          cacheKeys.userProfile(userId), 
          (oldData: any) => oldData ? { ...oldData, ...update } : undefined
        );
        
        // Invalidate related queries
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: cacheKeys.completeProfile(userId) }),
          queryClient.invalidateQueries({ queryKey: ['users', 'by_role'] }),
        ]);
      },
    }
  );
};

export const useSubmitFeedback = () => {
  return useMutate(
    async ({ 
      p_seller_id, 
      rating, 
      callDuration, 
      feedback 
    }: { 
      p_seller_id: string; 
      rating: number; 
      feedback: string; 
      callDuration: string 
    }) => {
      const { error } = await supabase.rpc('submit_call_feedback', {
        p_seller_id: p_seller_id,
        p_rating: rating,
        p_feedback_text: feedback,
        p_call_duration: callDuration
      });
      if (error) throw error;
      return { p_seller_id };
    },
    {
      onSuccess: async ({ p_seller_id }) => {
        // Invalidate feedback and user data
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: cacheKeys.feedbacks() }),
          queryClient.invalidateQueries({ queryKey: cacheKeys.userProfile(p_seller_id) }),
          queryClient.invalidateQueries({ queryKey: cacheKeys.completeProfile(p_seller_id) }),
          queryClient.invalidateQueries({ queryKey: ['users', 'by_role'] }),
        ]);
      },
    }
  );
};

// ===================
// USER DATA FETCHING HOOKS
// ===================

export const useGetUserRole = ({
  userId, 
  enabled = true
}: {
  userId: string; 
  enabled?: boolean
}) => {
  return useFetch(
    cacheKeys.userRole(userId),
    async () => {
      const { data, error } = await supabase
        .rpc('get_user_role', { uid: userId });
      if (error) throw error;
      return data;
    },
    {
      enabled: enabled && !!userId,
      cacheTime: 'USER_ROLE',
    }
  );
};

export const useGetProfileData = ({
  userId, 
  enabled = true
}: {
  userId: string; 
  enabled?: boolean
}) => {
  return useFetch(
    cacheKeys.userProfile(userId),
    async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (error) throw error;
      return data;
    },
    {
      enabled: enabled && !!userId,
      cacheTime: 'USER_PROFILE',
    }
  );
};

export const useGetWalletData = ({
  userId, 
  enabled = true
}: {
  userId: string; 
  enabled?: boolean
}) => {
  return useFetch(
    cacheKeys.userWallet(userId),
    async () => {
      const { data, error } = await supabase
        .rpc('get_user_wallet', { uid: userId });
      if (error) throw error;
      return data;
    },
    {
      enabled: enabled && !!userId,
      cacheTime: 'WALLET_DATA',
      // Wallet data changes frequently, refetch on focus
      refetchOnWindowFocus: true,
    }
  );
};

export const useGetCompleteUserProfile = ({ 
  userId 
}: { 
  userId: string | undefined 
}) => {
  return useFetch(
    cacheKeys.completeProfile(userId!),
    async () => {
      if (!userId) throw new Error("User ID is required");

      const [profileResponse, roleResponse, walletResponse] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        supabase.rpc('get_user_role', { uid: userId }),
        supabase.rpc('get_user_wallet', { uid: userId })
      ]);

      if (profileResponse.error) throw profileResponse.error;
      if (roleResponse.error) throw roleResponse.error;
      if (walletResponse.error) throw walletResponse.error;

      const result = {
        profile: profileResponse.data,
        role: roleResponse.data,
        wallet: walletResponse.data
      };

      // Cache individual pieces for future use
      queryClient.setQueryData(cacheKeys.userProfile(userId), result.profile);
      queryClient.setQueryData(cacheKeys.userRole(userId), result.role);
      queryClient.setQueryData(cacheKeys.userWallet(userId), result.wallet);

      return result;
    },
    {
      enabled: !!userId,
      cacheTime: 'USER_PROFILE',
    }
  );
};

export const useUserHasRole = ({ 
  userId, 
  role 
}: { 
  userId: string | undefined; 
  role: UserRole 
}) => {
  const { data: userRole, isLoading } = useGetUserRole({ 
    userId: userId!, 
    enabled: !!userId 
  });
  
  return {
    hasRole: userRole === role,
    userRole,
    isLoading: isLoading && !!userId
  };
};

// ===================
// FINANCIAL DATA HOOKS
// ===================

export const useGetWalletSummary = ({
  enabled = true
}: {
  enabled?: boolean
}) => {
  return useFetch(
    cacheKeys.walletSummary(),
    async () => {
      const { data, error } = await supabase.rpc('get_wallet_summary');
      if (error) throw error;
      return data;
    },
    {
      enabled,
      cacheTime: 'WALLET_SUMMARY',
      refetchOnWindowFocus: true,
      // Auto-refresh every 30 seconds for admin dashboards
      refetchInterval: 30 * 1000,
    }
  );
};

export const useGetTransactions = ({ 
  params 
}: { 
  params: Transaction['Args'] 
}) => {
  return useFetch(
    cacheKeys.transactions(params),
    async () => {
      const { data, error } = await supabase
        .rpc('get_call_sessions_with_transactions', params);
      if (error) throw error;
      return data;
    },
    {
      cacheTime: 'TRANSACTIONS',
      refetchOnWindowFocus: true,
    }
  );
};

// ===================
// FEEDBACK HOOKS
// ===================

export const useGetUserFeedbacks = () => {
  return useFetch(
    cacheKeys.feedbacks(),
    async () => {
      const { data, error } = await supabase.rpc("get_feedbacks");
      if (error) throw error;
      return data;
    },
    {
      cacheTime: 'FEEDBACKS',
    }
  );
};

// ===================
// USER LIST HOOKS
// ===================

export const useGetSellers = () => {
  return useFetch(
    cacheKeys.sellers(),
    async () => {
      const { data, error } = await supabase
        .rpc('get_users_by_role', { target_role: "seller" });
      if (error) throw error;
      return data;
    },
    {
      cacheTime: 'USER_LISTS',
    }
  );
};

export const useGetBuyers = () => {
  return useFetch(
    cacheKeys.buyers(),
    async () => {
      const { data, error } = await supabase
        .rpc('get_users_by_role', { target_role: "buyer" });
      if (error) throw error;
      return data;
    },
    {
      cacheTime: 'USER_LISTS',
    }
  );
};

export const useGetUsersByRole = ({ 
  role 
}: { 
  role: Exclude<UserRole, null> 
}) => {
  return useFetch(
    cacheKeys.usersByRole(role),
    async () => {
      const { data, error } = await supabase
        .rpc('get_users_by_role', { target_role: role });
      if (error) throw error;
      return data;
    },
    {
      enabled: !!role,
      cacheTime: 'USER_LISTS',
    }
  );
};

export const useGetModerators = () => {
  return useFetch(
    cacheKeys.moderators(),
    async () => {
      const { data, error } = await supabase
        .rpc('get_users_by_role', { target_role: "moderator" });
      if (error) throw error;
      return data;
    },
    {
      cacheTime: 'USER_LISTS',
    }
  );
};

export const useGetAdmins = () => {
  return useFetch(
    cacheKeys.admins(),
    async () => {
      const { data, error } = await supabase
        .rpc('get_users_by_role', { target_role: "admin" });
      if (error) throw error;
      return data;
    },
    {
      cacheTime: 'USER_LISTS',
    }
  );
};

// ===================
// UTILITY FUNCTIONS FOR CACHE MANAGEMENT
// ===================

export const cacheUtils = {
  /**
   * Prefetch user data to improve UX
   */
  prefetchUserData: async (userId: string) => {
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: cacheKeys.userProfile(userId),
        queryFn: async () => {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
          if (error) throw error;
          return data;
        },
        staleTime: CACHE_TIMES.USER_PROFILE,
      }),
      queryClient.prefetchQuery({
        queryKey: cacheKeys.userRole(userId),
        queryFn: async () => {
          const { data, error } = await supabase
            .rpc('get_user_role', { uid: userId });
          if (error) throw error;
          return data;
        },
        staleTime: CACHE_TIMES.USER_ROLE,
      }),
    ]);
  },

  /**
   * Clear user-specific cache
   */
  clearUserCache: async (userId: string) => {
    await Promise.all([
      queryClient.removeQueries({ queryKey: cacheKeys.userProfile(userId) }),
      queryClient.removeQueries({ queryKey: cacheKeys.userRole(userId) }),
      queryClient.removeQueries({ queryKey: cacheKeys.userWallet(userId) }),
      queryClient.removeQueries({ queryKey: cacheKeys.completeProfile(userId) }),
    ]);
  },

  /**
   * Refresh all user lists (useful after role changes)
   */
  refreshUserLists: async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: cacheKeys.sellers() }),
      queryClient.invalidateQueries({ queryKey: cacheKeys.buyers() }),
      queryClient.invalidateQueries({ queryKey: cacheKeys.moderators() }),
      queryClient.invalidateQueries({ queryKey: cacheKeys.admins() }),
    ]);
  },

  /**
   * Get cache statistics for debugging
   */
  getCacheStats: () => {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();
    
    return {
      totalQueries: queries.length,
      staleQueries: queries.filter(q => q.isStale()).length,
      activeQueries: queries.filter(q => q.getObserversCount() > 0).length,
      errorQueries: queries.filter(q => q.state.status === 'error').length,
    };
  },
};

// import { supabase } from '@/integrations/supabase/client';
// import { Database } from '@/integrations/supabase/types';
// import {
//   useQuery,
//   useMutation,
//   UseQueryOptions,
//   UseMutationOptions,
//   QueryClient,
//   QueryKey
// } from '@tanstack/react-query';


// export type UserRole = 'buyer' | 'seller' | 'moderator' | 'admin' | null;
// export type UserProfile = Database['public']['Tables']['profiles']['Row']
// export type WalletInfo = Database['public']['Tables']['wallets']['Row']
// export type EscrowTransaction = Database['public']['Tables']['escrow_transactions']['Row']
// export type UsersByRole = Database['public']['Functions']['get_users_by_role']['Returns'][number]
// export type WalletSummary = Database['public']['Functions']['get_wallet_summary']['Returns']
// export type Transaction = Database['public']['Functions']['get_call_sessions_with_transactions']


// // Create a query client to use with the QueryClientProvider
// export const queryClient = new QueryClient({
//   defaultOptions: {
//     queries: {
//       refetchOnWindowFocus: false,
//       retry: 1,
//       staleTime: 5 * 60 * 1000, // 5 minutes
//     },
//   },
// });

// /**
//  * Custom hook that wraps TanStack Query's useQuery to work with existing fetch functions
//  * (can be fetch, axios, supabase, etc.)
//  */
// export function useFetch<
//   TData = unknown,
//   TError = Error,
//   TQueryKey extends QueryKey = QueryKey
// >(
//   // The query key used for caching and deduplication
//   queryKey: TQueryKey,
//   // Your existing fetch function that returns a promise
//   fetchFn: () => Promise<TData>,
//   // Optional TanStack Query options
//   queryOptions?: Omit<UseQueryOptions<TData, TError, TData, TQueryKey>, 'queryKey' | 'queryFn'>
// ) {
//   return useQuery<TData, TError, TData, TQueryKey>({
//     queryKey,
//     queryFn: fetchFn,
//     ...queryOptions,
//   });
// }

// /**
//  * Custom hook that wraps TanStack Query's useMutation to work with existing mutation functions
//  * (can be fetch, axios, supabase, etc.)
//  */
// export function useMutate<
//   TData = unknown,
//   TError = Error,
//   TVariables = void,
//   TContext = unknown
// >(
//   // Your existing mutation function that takes variables and returns a promise
//   mutateFn: (variables: TVariables) => Promise<TData>,
//   // Optional TanStack Query mutation options
//   mutationOptions?: Omit<UseMutationOptions<TData, TError, TVariables, TContext>, 'mutationFn'>
// ) {
//   return useMutation<TData, TError, TVariables, TContext>({
//     mutationFn: mutateFn,
//     ...mutationOptions,
//   });
// }


// export const useSignInWithPhone = () => {
//   return useMutate(async ({ phoneNumber }: { phoneNumber: string }) => {
//     const { error } = await supabase.auth.signInWithOtp({
//       phone: phoneNumber,
//     });
//     if (error) throw error;
//   })
// }

// export const useSignOut = () => {
//   return useMutate(async () => {
//     const { error } = await supabase.auth.signOut();
//     await queryClient.invalidateQueries()
//     if (error) throw error;
//   })
// }

// export const useVerifyOTP = () => {
//   return useMutate(async ({ phoneNumber, token }: { phoneNumber: string; token: string }) => {
//     const { error } = await supabase.auth.verifyOtp({
//       phone: phoneNumber,
//       token,
//       type: 'sms',
//     });
//     if (error) throw error;
//   })
// }

// export const useUpdateUserRole = () => {
//   return useMutate(async ({ userId, role }: { userId: string; role: UserRole }) => {
//     const { error } = await supabase
//       .from('user_roles')
//       .upsert({
//         user_id: userId,
//         role
//       });

//     await queryClient.invalidateQueries({ queryKey: ["role", userId] })

//     if (error) throw error;
//   })
// }
// export const useUpdateProfile = () => {
//   return useMutate(async ({ userId, update }: { userId: string; update: { name: string; category: string; description: string } }) => {
//     const { error } = await supabase
//       .from('profiles')
//       .update(update)
//       .eq('id', userId);

//     await queryClient.invalidateQueries({ queryKey: ["profile", userId] })

//     if (error) throw error;
//   })
// }
// export const useSubmitFeedback = () => {
//   return useMutate(async ({ p_seller_id, rating, callDuration, feedback }: { p_seller_id: string; rating: number; feedback: string; callDuration: string }) => {
//     const { error } = await supabase.rpc('submit_call_feedback', {
//       p_seller_id: p_seller_id,
//       p_rating: rating,
//       p_feedback_text: feedback,
//       p_call_duration: callDuration
//     });

//     await queryClient.invalidateQueries({ queryKey: ["user", p_seller_id] })
//     if (error) throw error;
//   })
// }

// export const useGetUserFeedbacks = () => {
//   return useFetch(["feedbacks"], async () => {
//     const { data, error } = await supabase.rpc("get_feedbacks")

//     if (error) throw error

//     return data
//   })
// }

// export const useGetUserRole = ({userId, enabled = true}:{userId: string; enabled?: boolean}) => {
//   return useFetch(["role", userId], async () => {
//     const { data, error} = await supabase
//       .rpc('get_user_role', { uid: userId });

//     if (error) throw error

//     return data
//   }, {enabled})
// }
// export const useGetProfileData = ({userId, enabled = true}:{userId: string; enabled?: boolean}) => {
//   return useFetch(["profile", userId], async () => {
//     const { data, error } = await supabase
//       .from('profiles')
//       .select('*')
//       .eq('id', userId)
//       .single();
//     if (error) throw error

//     return data
//   }, {enabled})
// }
// export const useGetWalletData = ({userId, enabled = true}:{userId: string; enabled?: boolean}) => {
//   return useFetch(["wallet", userId], async () => {
//     const { data, error } = await supabase
//       .rpc('get_user_wallet', { uid: userId });

//     if (error) throw error

//     return data
//   }, {enabled})
// }
// export const useGetWalletSummary = ({enabled = true}:{enabled: boolean}) => {
//   return useFetch(["wallet_summary"], async () => {
//     const { data, error } = await supabase.rpc('get_wallet_summary');

//     if (error) throw error

//     return data
//   }, {enabled})
// }
// export const useGetTransactions = ({ params }: { params: Transaction['Args'] }) => {
//   return useFetch(["transactions", params], async () => {
//     const { data, error } = await supabase
//       .rpc('get_call_sessions_with_transactions', params);
//     if (error) throw error

//     return data
//   })
// }
// export const useGetSellers = () => {
//   return useFetch(["sellers"], async () => {
//     const { data, error } = await supabase
//       .rpc('get_users_by_role', { target_role: "seller" });
//     if (error) throw error

//     return data
//   })
// }


// export const useGetBuyers = () => {
//   return useFetch(["buyers"], async () => {
//     const { data, error } = await supabase
//       .rpc('get_users_by_role', { target_role: "buyer" });
//     if (error) throw error

//     return data
//   })
// }

// /**
//  * Hook to get users by any role (not just sellers/buyers)
//  */
// export const useGetUsersByRole = ({ role }: { role: Exclude<UserRole, null> }) => {
//   return useFetch([`users_by_role`, role], async () => {
//     const { data, error } = await supabase
//       .rpc('get_users_by_role', { target_role: role });
//     if (error) throw error;
//     return data;
//   }, {
//     enabled: !!role,
//   });
// };

// /**
//  * Hook to get moderators
//  */
// export const useGetModerators = () => {
//   return useFetch(["moderators"], async () => {
//     const { data, error } = await supabase
//       .rpc('get_users_by_role', { target_role: "moderator" });
//     if (error) throw error;
//     return data;
//   });
// };

// /**
//  * Hook to get admins
//  */
// export const useGetAdmins = () => {
//   return useFetch(["admins"], async () => {
//     const { data, error } = await supabase
//       .rpc('get_users_by_role', { target_role: "admin" });
//     if (error) throw error;
//     return data;
//   });
// };

// /**
//  * Hook to get complete user profile with role and wallet
//  */
// export const useGetCompleteUserProfile = ({ userId }: { userId: string | undefined }) => {
//   return useFetch(["complete_profile", userId], async () => {
//     if (!userId) throw new Error("User ID is required");

//     const [profileResponse, roleResponse, walletResponse] = await Promise.all([
//       supabase.from('profiles').select('*').eq('id', userId).single(),
//       supabase.rpc('get_user_role', { uid: userId }),
//       supabase.rpc('get_user_wallet', { uid: userId })
//     ]);

//     if (profileResponse.error) throw profileResponse.error;
//     if (roleResponse.error) throw roleResponse.error;
//     if (walletResponse.error) throw walletResponse.error;

//     return {
//       profile: profileResponse.data,
//       role: roleResponse.data,
//       wallet: walletResponse.data
//     };
//   }, {
//     enabled: !!userId,
//   });
// };

// /**
//  * Hook to check if user has a specific role
//  */
// export const useUserHasRole = ({ userId, role }: { userId: string | undefined; role: UserRole }) => {
//   const { data: userRole } = useGetUserRole({ userId });
//   return {
//     hasRole: userRole === role,
//     userRole,
//     isLoading: !userRole && !!userId
//   };
// };

// /**
//  * Hook to get current session user
//  */
// export const useCurrentUser = () => {
//   return useFetch(["current_user"], async () => {
//     const { data: { user }, error } = await supabase.auth.getUser();
//     if (error) throw error;
//     return user;
//   });
// };

// /**
//  * Hook for resetting password
//  */
// export const useResetPassword = () => {
//   return useMutate(async ({ email }: { email: string }) => {
//     const { error } = await supabase.auth.resetPasswordForEmail(email);
//     if (error) throw error;
//   });
// };

// /**
//  * Hook for updating password
//  */
// export const useUpdatePassword = () => {
//   return useMutate(async ({ password }: { password: string }) => {
//     const { error } = await supabase.auth.updateUser({ password });
//     if (error) throw error;
//   });
// };