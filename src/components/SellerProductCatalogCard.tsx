import { Product } from '@/types';
import React from 'react'
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from './ui/badge';
import { Edit, Heart } from 'lucide-react';
import { Button } from './ui/button';
import { cn, formatCurrency } from '@/lib/utils';


interface SellerProductCatalogCardProps {
    product: Product;
    handleEditProduct?: (product: Product) => void;
    handleLikeSeller?: (productId: string) => void;
    likesSeller?: string[]
}

const SellerProductCatalogCard: React.FC<SellerProductCatalogCardProps> = ({ product, handleEditProduct, handleLikeSeller, likesSeller }) => {
    return (
        <Card
            key={product.id}
            className={cn('group overflow-hidden', handleEditProduct && 'hover:shadow-lg transition-all duration-300 cursor-pointer')}
            onClick={() => handleEditProduct?.(product)}
        >
            <div className="relative overflow-hidden">
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {
                    likesSeller && likesSeller.length > 0 && (
                        <div className="absolute top-2 right-2 flex gap-2">
                            <Button
                                size="sm"
                                variant="secondary"
                                className="h-8 w-8 p-0 bg-background/80 backdrop-blur-sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleLikeSeller?.(product.id);
                                }}
                            >
                                <Heart className={`w-4 h-4 ${likesSeller.includes(product.id) ? 'fill-current text-red-500' : ''} transition-colors`} />
                            </Button>
                        </div>
                    )
                }
                <div className="absolute top-2 left-2">
                    <Badge variant={product.inStock ? "default" : "secondary"}>
                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                    </Badge>
                </div>
                {handleLikeSeller && (
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                        <Edit className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>)
                }
            </div>

            <CardContent className="p-4">
                <div className="space-y-3">
                    <div>
                        <h3 className="font-semibold text-lg line-clamp-1">
                            {product.name}
                        </h3>
                        <Badge variant="outline" className="text-xs mt-1">
                            {product.category}
                        </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2">
                        {product.description}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t">
                        <span className="text-lg font-bold">
                            {formatCurrency(product.price)}
                        </span>
                        {/* <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Heart className="w-3 h-3" />
                            {product.likes}
                        </div> */}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default SellerProductCatalogCard