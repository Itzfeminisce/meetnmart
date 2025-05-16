import { 
  useQuery, 
  useMutation, 
  UseQueryOptions, 
  UseMutationOptions,
  MutateOptions,
  QueryClient,
  QueryKey
} from '@tanstack/react-query';

// Create a query client to use with the QueryClientProvider
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

/**
 * Custom hook that wraps TanStack Query's useQuery to work with existing fetch functions
 * (can be fetch, axios, supabase, etc.)
 */
export function useFetch<
  TData = unknown,
  TError = unknown,
  TQueryKey extends QueryKey = QueryKey
>(
  // The query key used for caching and deduplication
  queryKey: TQueryKey,
  // Your existing fetch function that returns a promise
  fetchFn: () => Promise<TData>,
  // Optional TanStack Query options
  queryOptions?: Omit<UseQueryOptions<TData, TError, TData, TQueryKey>, 'queryKey' | 'queryFn'>
) {
  return useQuery<TData, TError, TData, TQueryKey>({
    queryKey,
    queryFn: fetchFn,
    ...queryOptions,
  });
}

/**
 * Custom hook that wraps TanStack Query's useMutation to work with existing mutation functions
 * (can be fetch, axios, supabase, etc.)
 */
export function useMutate<
  TData = unknown,
  TError = unknown,
  TVariables = void,
  TContext = unknown
>(
  // Your existing mutation function that takes variables and returns a promise
  mutateFn: (variables: TVariables) => Promise<TData>,
  // Optional TanStack Query mutation options
  mutationOptions?: Omit<UseMutationOptions<TData, TError, TVariables, TContext>, 'mutationFn'>
) {
  return useMutation<TData, TError, TVariables, TContext>({
    mutationFn: mutateFn,
    ...mutationOptions,
  });
}
