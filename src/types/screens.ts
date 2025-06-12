import { z } from "zod";


const ScreenSchema = z.enum(['category', 'market']);
const ActionSchema = z.enum(['view_all']);
const UtmSourceSchema = z.enum(['buyer_landing', 'market_selection', 'category_selection', 'seller_landing'])
const UtmRoleSchema = z.enum(["buyer", "seller"])

export const UtmCtaSchema = z.custom<`${z.infer<typeof ScreenSchema>}.${z.infer<typeof ActionSchema>}`>(
    (val) => {
        if (typeof val !== 'string') return false;
        const [screen, action] = val.split('.');
        return ScreenSchema.safeParse(screen).success && ActionSchema.safeParse(action).success;
    },
    {
        message: 'Invalid UTM CTA format. Must be in format "screen.action" where screen is "category" or "market" and action is "view_all"'
    }
);

export type UtmCta = z.infer<typeof UtmCtaSchema>;
export type UtmSource = z.infer<typeof UtmSourceSchema>
export type UtmRole = z.infer<typeof UtmRoleSchema>

export const MarketSelectionLocationStateSchema = z.object({
    title: z.string().default("Available Markets"),
    desciption: z.string().optional().default("The magic happens here."),
    categoryIds: z.array(z.string()).default([]),
    utm_source: UtmSourceSchema,
    utm_cta: UtmCtaSchema.optional(),
    utm_role: UtmRoleSchema
})

export type MarketSelectionLocationStateType = z.infer<typeof MarketSelectionLocationStateSchema>



export const CategorySelectionStateSchema = z.object({
    title: z.string(),
    markets: z.array(z.object({
        id: z.string(),
        name: z.string()
    })),
    utm_source: UtmSourceSchema,
    utm_role: UtmRoleSchema
})

export type CategorySelectionStateType = z.infer<typeof CategorySelectionStateSchema>

export const SellerSelectionStateSchema = z.object({
    title: z.string(),
    market: z.object({
        id: z.string(),
        name: z.string()
    }),
    category: z.object({
        id: z.string().nullable(),
        name: z.string().nullable()
    }),
    utm_source: UtmSourceSchema,
})

export type SellerSelectionStateType = z.infer<typeof SellerSelectionStateSchema>