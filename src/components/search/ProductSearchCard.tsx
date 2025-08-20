import { Product, Seller } from "@/types";
import { useBottomSheet, useSheetData } from "../ui/bottom-sheet-modal";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { ImageGridView } from "../ImageGridView";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Calendar, MapPin, MessageCircle, Phone, SeparatorHorizontal } from "lucide-react";
import { cn, getInitials, sluggify } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Separator } from "../ui/separator";
import { getInlineChatComponentProps } from "../chat/InlineChatSheet";

export function ProductSearchCard({ data: product }: { data: Product }) {
    const { open } = useBottomSheet()
    return (
        <div className="">
            <Card className="group overflow-hidden bg-background cursor-pointer transition-all hover:bg-muted-foreground/10"
                onClick={() => open({
                    viewId: sluggify(product.name),
                    body: <ProductSearchCardBody />,
                    footer: <ProductSearchCardFooter />,
                    header: <ProductSearchCardHeader />,
                    data: product
                })}
            >
                <div className="relative overflow-hidden  max-h-28 rounded-md ">
                    <ImageGridView
                        images={Array.isArray(product.image) ? product.image : [product.image]}
                        itemId={product.seller_id}
                        direction={Array.isArray(product.image) ? "horizontal" : "grid"}
                    />

                    <Badge variant="secondary" className={cn(" border-green-200 absolute top-2 right-2", product.in_stock ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
                        {product.in_stock ? 'In Stock' : 'Out of Stock'}
                    </Badge>
                </div>

                <CardContent className="md:p-4 p-2">
                    <h3 className="font-semibold text-foreground/80 mb-2 line-clamp-2 leading-snug">
                        {product.name}
                    </h3>
                    <p className="text-base text-foreground mb-2 line-clamp-2 leading-snug">
                        {product.description}
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}


export function ProductSearchCardHeader() {
    const { data: sellerData } = useSheetData() as { data: Product & { profiles: { name: string; avatar: string } } }
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <Avatar className="w-8 md:w-12 h-8 md:h-12 rounded-full">
                    <AvatarImage
                        src={sellerData.profiles.avatar}
                        alt={sellerData.profiles.name}
                        loading="lazy"
                    />
                    <AvatarFallback>{getInitials(sellerData.profiles.name)}</AvatarFallback>
                </Avatar>
                <div>
                    <h2 className="text-base md:text-xl font-semibold flex items-center gap-2">
                        {sellerData.profiles.name}
                    </h2>
                </div>
            </div>
        </div>
    )
}

export function ProductSearchCardBody() {
    const { data } = useSheetData() as { data: Product }
    return (
        <div className="space-y-4">
            {/* About Section */}
            <Card className="border-none">
                <CardHeader className="p-2 m-0">
                    <CardTitle className="text-base text-foreground/80">{data.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 p-2">

                    <p className="text-base text-foreground whitespace-pre-wrap break-words">{data.description}</p>


                    <Badge variant="secondary" className={cn(" border-green-200", data.in_stock ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
                        {data.in_stock ? 'In Stock' : 'Out of Stock'}
                    </Badge>
                    <Separator />

                    <img
                        src={data.image}
                        alt={data.name}
                        loading="lazy"
                        className="object-cover rounded"
                    />
                </CardContent>
            </Card>
        </div>
    )
}

export function ProductSearchCardFooter() {
    const { open, } = useBottomSheet()
    const {data: product} = useSheetData() as {data: Product & {profiles: Seller}}
    
    return (
        <div className="sticky bottom-0 border-t p-2 bg-background">
            <div className="flex gap-3">
                <Button size="sm" variant="outline" className="flex-1 flex items-center gap-2" disabled>
                    <Phone className="h-4 w-4" />
                    Call Now
                </Button>

                <Button
                    onClick={() => open(
                        getInlineChatComponentProps({
                            name: product.profiles.name,
                            userId: product.profiles.id,
                            source: "SEARCH",
                            sourceId: product.id
                        }))}
                    type='button' size="sm" variant='market' className="flex-1 flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    Drop a Message
                </Button>
            </div>
        </div>
    )
}

