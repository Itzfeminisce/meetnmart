import { useState } from 'react';
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
import { useFetch, useGetTransactions } from '@/hooks/api-hooks';
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
  X
} from 'lucide-react';
import SellerProductCatalogCard from '@/components/SellerProductCatalogCard';
import { Product } from '@/types';
import { mockProducts } from '@/lib/mockData';
import { formatTimeAgo } from '@/lib/utils';

// Product form schema
const productSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(500, 'Description must be less than 500 characters'),
  price: z.coerce.number().min(1, 'Price is required'),
  category: z.string().min(1, 'Category is required'),
  image: z.string().url('Please enter a valid image URL').optional().or(z.literal('')),
  inStock: z.boolean().default(true),
});

type ProductFormValues = z.infer<typeof productSchema>;


const SellerDashboard = () => {
  const { user, profile, signOut, isLoading, fetchTransactions } = useAuth();
  const navigate = useNavigate();
  const [likesSeller, setLikedSeller] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  console.log({ profile });


  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      category: '',
      image: '',
      inStock: true,
    },
  });


  const handleEditProfile = () => {
    navigate('/edit-seller-profile');
  };

  const handleSignOut = async () => {
    toast.success('Clearing session...');
    await signOut();
    navigate('/');
  };

  const handleLikeSeller = (productId: string) => {
    setLikedSeller(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    form.reset({
      name: '',
      description: '',
      price: 0,
      category: '',
      image: '',
      inStock: true,
    });
    setDialogOpen(true);
  };

  const handleEditProduct = (product: typeof mockProducts[0]) => {
    setEditingProduct(product);
    form.reset({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      image: product.image,
      inStock: product.inStock,
    });
    setDialogOpen(true);
  };

  const onSubmit = (values: ProductFormValues) => {
    const newProduct = {
      id: editingProduct ? editingProduct.id : Date.now(),
      name: values.name,
      description: values.description,
      price: `${values.price}`,
      category: values.category,
      image: values.image || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop",
      inStock: values.inStock,
    };

    if (editingProduct) {
      // setProducts(prev => prev.map(p => p.id === editingProduct.id ? newProduct : p));
      toast.success('Product updated successfully!');
    } else {
      // setProducts(prev => [...prev, newProduct]);
      toast.success('Product added successfully!');
    }

    setDialogOpen(false);
    form.reset();
  };


  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Section */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <Card className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="relative">
                    <Avatar className="h-24 w-24 border-4 border-border">
                      {profile.avatar ? (
                        <AvatarImage src={profile.avatar} alt={profile.name} />
                      ) : (
                        <AvatarFallback className="text-2xl font-bold">
                          {profile.name ? profile.name.charAt(0).toUpperCase() : 'S'}
                        </AvatarFallback>
                      )}
                    </Avatar>
                  </div>

                  <div className="space-y-2">
                    <h1 className="text-2xl font-bold">
                      {profile.name || 'MeetnMart Seller'}
                    </h1>
                    <Badge variant="secondary" className="mb-2">
                      <Package className="w-3 h-3 mr-1" />
                      {profile.category || 'General Store'}
                    </Badge>
                    <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="font-medium">4.8</span>
                      <span>(127 reviews)</span>
                    </div>
                  </div>

                  
                     {/* Action Buttons */}
                     <div className="flex items-center justify-center gap-x-2">
                        <Button
                          size='icon'
                          variant='ghost'
                          className='p-0 m-0'
                          onClick={handleEditProfile}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>

                        <Button
                          size='icon'
                          variant='ghost'
                          className='p-0 m-0'
                          disabled={isLoading}
                          onClick={handleSignOut}
                        >
                          <LogOut className="w-4 h-4" />
                        </Button>
                      </div>

                  <div className="w-full space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center justify-start gap-x-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span>{profile.phone_number || user?.phone || "No Phone"}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>Local Seller</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>Joined {formatTimeAgo(profile.created_at)}</span>
                    </div>
                  </div>
                  {!profile.is_reachable && <Badge variant='destructive' className=''>You are currently not visible to buyers</Badge>}
                </div>
              </CardContent>
            </Card>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: ShoppingBag, label: 'Products', value: '12' },
                { icon: TrendingUp, label: 'Sales', value: '$2.8k' },
                { icon: Users, label: 'Buyers', value: '89' },
                { icon: Star, label: 'Rating', value: '4.8' }
              ].map((stat, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 text-center">
                    <stat.icon className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-lg font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Wallet Summary */}
            <WalletSummaryComponent userRole='seller' />

          </div>

          {/* Right Column - Product Catalog */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {/* Catalog Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Product Catalog</h2>
                  <p className="text-muted-foreground">Manage your product listings</p>
                </div>
                <Button onClick={handleAddProduct}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </Button>
              </div>

              {/* Product Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {products.map((product) => (
                  <SellerProductCatalogCard
                    product={product}
                    handleEditProduct={() => handleEditProduct(product)}
                    handleLikeSeller={() => handleLikeSeller(product.id)}
                    likesSeller={likesSeller}
                    key={product.id}
                  />
                ))}

                {/* Add New Product Card */}
                <Card
                  className="group cursor-pointer hover:shadow-lg transition-all duration-300 border-2 border-dashed hover:border-solid"
                  onClick={handleAddProduct}
                >
                  <CardContent className="p-8 flex flex-col items-center justify-center h-full min-h-[280px] text-center">
                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Plus className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">
                      Add New Product
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Expand your catalog and reach more customers
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Product Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto scrollbar-small">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </DialogTitle>
            </DialogHeader>

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
                            <SelectItem value="Food">Food</SelectItem>
                            <SelectItem value="Vegetables">Vegetables</SelectItem>
                            <SelectItem value="Fruits">Fruits</SelectItem>
                            <SelectItem value="Bakery">Bakery</SelectItem>
                            <SelectItem value="Beverages">Beverages</SelectItem>
                            <SelectItem value="Crafts">Crafts</SelectItem>
                            <SelectItem value="Electronics">Electronics</SelectItem>
                            <SelectItem value="Clothing">Clothing</SelectItem>
                            <SelectItem value="Books">Books</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
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
                        <FormLabel>Price ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Enter price in USD
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="inStock"
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

                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Image URL</FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          <Input
                            placeholder="https://example.com/image.jpg"
                            {...field}
                          />
                          {field.value && (
                            <div className="relative w-full h-32 bg-muted rounded-lg overflow-hidden">
                              <img
                                src={field.value}
                                alt="Preview"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.src = "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop";
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormDescription>
                        Optional: Add an image URL to showcase your product
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1">
                    {editingProduct ? 'Update Product' : 'Add Product'}
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
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default SellerDashboard;
