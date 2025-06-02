import { NearbySellerProduct } from '@/types';
import React from 'react'
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from './ui/badge';
import { Edit, Heart } from 'lucide-react';
import { Button } from './ui/button';
import { cn, formatCurrency } from '@/lib/utils';


interface SellerProductCatalogCardProps {
    product: NearbySellerProduct;
    handleEditProduct?: (product: NearbySellerProduct) => void;
    handleLikeSeller?: (productId: string) => void;
    likesSeller?: string[]
}

const SellerProductCatalogCard: React.FC<SellerProductCatalogCardProps> = ({ product, handleEditProduct, handleLikeSeller, likesSeller }) => {
    return (
        <Card
            key={product.id}
            onClick={() => handleEditProduct?.(product)}
            className={cn(
                'group overflow-hidden rounded-2xl border shadow-sm transition-shadow duration-300 hover:shadow-md',
                handleEditProduct && 'cursor-pointer'
            )}
        >
            {/* Image & Interactive Icons */}
            <div className="relative aspect-[4/3] w-full overflow-hidden">
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />

                {/* Like Button */}
                {likesSeller?.length > 0 && (
                    <div className="absolute top-2 right-2 z-10">
                        <Button
                            size="icon"
                            variant="ghost"
                            className="bg-background/80 backdrop-blur-sm hover:bg-background"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleLikeSeller?.(product.id);
                            }}
                        >
                            <Heart
                                className={cn(
                                    'w-4 h-4 transition-colors',
                                    likesSeller.includes(product.id) && 'fill-red-500 text-red-500'
                                )}
                            />
                        </Button>
                    </div>
                )}

                {/* Stock Badge */}
                <div className="absolute top-2 left-2 z-10">
                    <Badge
                        variant={product.in_stock ? 'default' : 'secondary'}
                        className={cn(
                            'text-xs',
                            product.in_stock
                                ? 'bg-green-100 text-green-800'
                                : 'bg-muted text-muted-foreground'
                        )}
                    >
                        {product.in_stock ? 'In Stock' : 'Out of Stock'}
                    </Badge>
                </div>

                {/* Hover Overlay for Edit */}
                {handleEditProduct && (
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 flex items-center justify-center">
                        <Edit className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    </div>
                )}
            </div>

            {/* Content */}
            <CardContent className="p-4 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <h3 className="font-semibold text-lg line-clamp-1">{product.name}</h3>
                    {/* <Badge variant="outline" className="text-xs mt-1 sm:mt-0 w-fit">
                        {product.category}
                    </Badge> */}
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2">
                    {product.description}
                </p>

                <div className="flex items-center justify-between pt-3 border-t">
                    <span className="text-lg font-bold">{formatCurrency(product.price)}</span>
                </div>
            </CardContent>
        </Card>

    )
}

export default SellerProductCatalogCard