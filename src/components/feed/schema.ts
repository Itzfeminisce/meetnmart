// lib/schemas.ts
import { z } from 'zod';

export const feedFormSchema = z.object({
  content: z.string()
    .min(10, "Post content must be at least 10 characters")
    .max(500, "Post content cannot exceed 500 characters")
    .refine(
      (content) => content.trim().length > 0,
      "Post content cannot be empty"
    ),
  location: z.string()
    .min(1, "Location is required"),
  urgency: z.enum(["low", "medium", "high", "not_specified"])
    .optional()
    .default("not_specified"),
});

export type FeedFormData = z.infer<typeof feedFormSchema>;

export const feedMarketFilterSchema = z.object({
  selectedMarket: z.string().min(1, "Market selection is required"),
  feedFilter: z.enum(["all", "buyer_request", "seller_offer", "delivery_ping"])
    .default("all"),
});

export type FeedMarketFilterData = z.infer<typeof feedMarketFilterSchema>;