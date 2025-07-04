import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { WalletSummary as WalletSummaryComponent } from '@/components/WalletSummary';
import Loader from '@/components/ui/loader';
import RecentCallCard from '@/components/RecentCallCard';
import { useCreateProduct, useDeleteProduct, useFetch, useGetCategories, useGetProducts, useGetTransactions, useUpdateProduct } from '@/hooks/api-hooks';
import ErrorComponent from '@/components/ErrorComponent';
import {
  Plus,
  Star,
  MapPin,
  Phone,
  Mail,
  Calendar,
  TrendingUp,
  Users,
  ShoppingBag,
  Heart,
  Share2,
  Eye,
  Package,
  Edit,
  LogOut,
  Upload,
  X,
  ShieldQuestionIcon,
  Loader2
} from 'lucide-react';
import SellerProductCatalogCard from '@/components/SellerProductCatalogCard';
import { Product } from '@/types';
import { formatTimeAgo } from '@/lib/utils';
import { ImageUploadField } from '@/components/ui/image-upload-field';
import AppHeader from '@/components/AppHeader';
import { useIsMobile } from '@/hooks/use-mobile';

// Product form schema
const productSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(500, 'Description must be less than 500 characters'),
  price: z.coerce.number().min(1, 'Price is required'),
  category: z.string().min(1, 'Category is required'),
  image: z.string(),
  in_stock: z.boolean().default(true),
});

type ProductFormValues = z.infer<typeof productSchema>;

const EditProduct = () => {
  const { user, profile, signOut, isLoading } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile()
  const [searchQuery, setSearchQuery] = useState('');

  // Queries with optimized configuration
  const {
    data: products = [],
    isLoading: isProductLoading,
    error: productsError
  } = useGetProducts();

  const {
    data: categories,
    error: categoriesError
  } = useGetCategories();


  // Filter products by search query
  const filteredProducts = useMemo(() => {
    if (!searchQuery) return products;

    return products.filter(product => 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  // Mutations with optimistic updates
  const productCreateMutation = useCreateProduct();
  const productUpdateMutation = useUpdateProduct();

  const [likesSeller, setLikedSeller] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productImageUrl, setProductImageUrl] = useState('');

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

  // Update form when editing product
  useEffect(() => {
    if (editingProduct) {
      form.reset({
        ...editingProduct,
        image: editingProduct.image || '',
      });
      setProductImageUrl(editingProduct.image || '');
    }
  }, [editingProduct, form]);


  const handleLikeSeller = useCallback((productId: string) => {
    setLikedSeller(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  }, []);

  const handleAddProduct = useCallback(() => {
    setEditingProduct(null);
    form.reset();
    setProductImageUrl('');
    setDialogOpen(true);
  }, [form]);

  const handleEditProduct = useCallback((product: Product) => {
    setEditingProduct(product);
    form.reset(product);
    setProductImageUrl(product.image || '');
    setDialogOpen(true);
  }, [form]);

  const onSubmit = async (values: ProductFormValues) => {
    try {
      if (editingProduct) {
        await productUpdateMutation.mutateAsync({
          data: {
            ...editingProduct,
            ...values,
            image: values.image || productImageUrl
          },
        });
        toast.success('Product updated successfully!');
      } else {
        await productCreateMutation.mutateAsync({
          data: {
            category: values.category,
            description: values.description,
            image: values.image || productImageUrl,
            in_stock: values.in_stock,
            name: values.name,
            price: values.price,
            seller_id: user.id
          }
        });
        toast.success('Product added successfully!');
      }

      setDialogOpen(false);
      form.reset();
      setProductImageUrl('');
    } catch (error) {
      console.error('Error submitting product:', error);
      toast.error('Failed to save product. Please try again.');
    }
  };

  // Error handling
  if (productsError || categoriesError) {
    return <ErrorComponent error={productsError || categoriesError} />;
  }

  return (
    <>
      <AppHeader
        title="Product Catalog"
        subtitle="Manage your product listings"
        search={{
          placeholder: "Find products...",
          onSearch: setSearchQuery,
          onClear: () => { setSearchQuery("") },
        }}

        rightContentOnNewLine={isMobile}
        rightContent={(
            <Button variant='market' onClick={handleAddProduct} className='w-full'>
            <Plus className="w-4 h-4" />
            <span className=""> Add Product</span>
          </Button>
        )}
      />

      <div className="container mx-auto px-4 py-6 mb-[5rem]">
        {/* <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto scrollbar-small">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </DialogTitle>
            </DialogHeader> */}

            <h1> {editingProduct ? 'Edit Product' : 'Add New Product'}</h1>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map(it => (
                              <SelectItem value={it.id}>{it.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                  filePreferedName={`${user.id}`}
                  onChange={(url) => {
                    setProductImageUrl(url);
                    form.setValue('image', url);
                  }}
                  value={productImageUrl || form.getValues().image}
                  required={true}
                  showPreview={true}
                  maxSizeMB={2}
                  placeholder='https://example.com/image.jpg'
                  label='Product Image URL (Max: 2MB, PNG/JPEG/JPG)'
                  helperText='Upload a clear photo to showcase your product'
                />

                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1" disabled={productCreateMutation.isPending || productUpdateMutation.isPending}>
                    {productCreateMutation.isPending || productUpdateMutation.isPending ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {editingProduct ? 'Updating...' : 'Adding...'}
                      </div>
                    ) : (
                      editingProduct ? 'Update Product' : 'Add Product'
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          {/* </DialogContent>
        </Dialog> */}
      </div>
    </>
  );
};

export default EditProduct;
