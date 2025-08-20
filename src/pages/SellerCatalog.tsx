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
import { getShortName } from '../lib/utils';
import { ImageUploadField } from '@/components/ui/image-upload-field';
import AppHeader from '@/components/AppHeader';
import { useIsMobile } from '@/hooks/use-mobile';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { useBottomSheet } from '@/components/ui/bottom-sheet-modal';
import { CatalogBody, CatalogFooter, CatalogHeader } from '@/components/catalog';

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

const SellerCatalog = () => { 
  const isMobile = useIsMobile()
  const [searchQuery, setSearchQuery] = useState('');
  const bottomSheet = useBottomSheet()

  // Queries with optimized configuration
  const {
    data: products = [],
    isLoading: isProductLoading,
    error: productsError
  } = useGetProducts();
 

  // Filter products by search query
  const filteredProducts = useMemo(() => {
    if (!searchQuery) return products;

    return products.filter(product =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);
 
  const [likesSeller, setLikedSeller] = useState<string[]>([]);

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
 
  const handleLikeSeller = useCallback((productId: string) => {
    setLikedSeller(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  }, []);

  const handleManageProduct = useCallback(({action, product = null}) => {
    bottomSheet.open({
      header: <CatalogHeader />,
      body: <CatalogBody />,
      footer: <CatalogFooter />,
      data: {
        action,
        product
      }
    })
  }, []);
  
  // Error handling
  if (productsError ) {
    return <ErrorComponent error={productsError } />;
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
          <Button variant='market' onClick={() => handleManageProduct({action: "create-product"})} className='w-full'>
            <Plus className="w-4 h-4" />
            <span className=""> Add New Product</span>
          </Button>
        )}
      />

      <div className="container mx-auto px-4 py-6 mb-[5rem]">
        <div className="space-y-6">
          {/* Product Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 lg:grid-cols-3 gap-6">
            {isProductLoading ? <Loader /> : filteredProducts.length == 0 ? (
              <Card className="group border-none p-8 text-center flex flex-col items-center justify-center min-h-[280px]">
                <CardContent className="flex flex-col items-center justify-center h-full gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ShieldQuestionIcon className="w-6 h-6 text-market-orange" />
                  </div>
                  <h3 className="text-lg font-semibold text-market-orange">
                    Your catalog is empty
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Sellers with product listings stand a higher chance of engaging buyers.
                  </p>
                </CardContent>
              </Card>
            ) : filteredProducts.map((product) => (
              <SellerProductCatalogCard
                product={product}
                handleEditProduct={() => handleManageProduct({action: "update-product", product})}
                handleLikeSeller={() => handleLikeSeller(product.id)}
                likesSeller={likesSeller}
                key={product.id}
              />
            ))}

            {/* Add New Product Card */}
            <Card
              className="group cursor-pointer hover:shadow-lg transition-all duration-300 border-2 border-dashed hover:border-solid"
              onClick={() => handleManageProduct({action: "create-product"})}
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
    </>
  );
};

export default SellerCatalog;
