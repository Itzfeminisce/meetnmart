import { Package } from "lucide-react"
import { useSheetData } from "../ui/bottom-sheet-modal"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from "../ui/input";
import { SearchableSelect } from "../ui/searchable-select";
import { Textarea } from "../ui/textarea";
import { Switch } from "../ui/switch";
import { ImageUploadField } from "../ui/image-upload-field";
import { Button } from "../ui/button";
import { z } from "zod";
import { useCreateProduct, useGetCategories, useUpdateProduct } from "@/hooks/api-hooks";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";


const productSchema = z.object({
    name: z.string().min(1, 'Product name is required').max(100, 'Name must be less than 100 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters').max(500, 'Description must be less than 500 characters'),
    price: z.coerce.number().min(1, 'Price is required'),
    category: z.string().min(1, 'Category is required'),
    image: z.string(),
    in_stock: z.boolean().default(true),
});

type ProductFormValues = z.infer<typeof productSchema>;



export function CatalogHeader() {
    const { data: sheet } = useSheetData()
    const editingProduct = sheet?.action === "update-product";


    return (
        <div className="flex items-center gap-x-2 justify-between">
            <Package className="w-5 h-5" />
            {editingProduct ? 'Edit Product' : 'Add New Product'}
        </div>

    )
}

export function CatalogBody() {
    const { profile } = useAuth()
    const { data: categories, isLoading: isCategoryLoading } = useGetCategories();
    const [productImageUrl, setProductImageUrl] = useState("")
    const { data: sheet, updateData } = useSheetData()

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            name: '',
            description: '',
            price: 0,
            category: '',
            image: '',
            in_stock: true,
        },
    });


    useEffect(() => {
        if (form) {
            updateData({
                form
            })
        }
    }, [form])

    useEffect(() => {
        if (sheet.action === "update-product") {
            form.reset({
                image: productImageUrl,
                ...sheet.product,
            });
        }
    }, [form]);


    return (
        <Form {...form}>
            <div className="space-y-6 p-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Product Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter product name" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Category</FormLabel>
                                <SearchableSelect
                                    options={categories?.map(c => ({
                                        label: c.name,
                                        value: c.id,
                                    }))}
                                    searchPlaceholder='Search Categories'
                                    clearable
                                    disabled={isCategoryLoading}
                                    onValueChange={field.onChange}
                                    value={field.value}
                                />
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Describe your product in detail..."
                                    className="min-h-[100px]"
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription>
                                Provide a detailed description to attract more buyers
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Price</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        {...field}
                                    />
                                </FormControl>
                                <FormDescription>
                                    Enter price in NGN
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="in_stock"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-base">In Stock</FormLabel>
                                    <FormDescription>
                                        Is this product currently available?
                                    </FormDescription>
                                </div>
                                <FormControl>
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>

                <ImageUploadField
                    onChange={(url) => {
                        setProductImageUrl(url);
                        form.setValue('image', url);
                    }}
                    value={productImageUrl || form.getValues().image}
                    filePreferedName={profile.id}
                    required={true}
                    showPreview={true}
                    maxSizeMB={2}
                    placeholder='https://example.com/image.jpg'
                    label='Product Image URL (Max: 2MB, PNG/JPEG/JPG)'
                    helperText='Upload a clear photo to showcase your product'
                />


            </div>
        </Form>

    )
}

export function CatalogFooter() {
    const {profile} = useAuth()
    

    const productCreateMutation = useCreateProduct();
    const productUpdateMutation = useUpdateProduct();

    const { data: sheet } = useSheetData()

    
    const handleCreate = async () => {
        const { category, description, image, in_stock, name, price } = sheet?.form.getValues()
        await productCreateMutation.mutateAsync({
            data: {
                category,
                description,
                image,
                in_stock,
                name,
                price,
                seller_id: profile.id
            }
        });
        toast.success('Product created successfully!');
    }
    
    const handleUpdate = async () => {
        const { category, description, image, in_stock, name, price, id } = sheet?.form.getValues()
 
        await productUpdateMutation.mutateAsync({
            data: {
                id: id,
                category,
                description,
                image,
                in_stock,
                name,
                price,
                seller_id: profile.id
            }
        });
        toast.success('Product updated successfully!');
    }

    return (
        <div className="flex p-2">
            {sheet.action === "create-product" ? (
                <Button onClick={handleCreate} type="submit" size="sm" variant="market" className="flex-1" >
                    Add to catalog
                </Button>
            ) : sheet.action === "update-product" ? (
                <Button onClick={handleUpdate} type="submit" size="sm" variant="market" className="flex-1" >
                    Update
                </Button>
            ) : null}
        </div>
    )
}
