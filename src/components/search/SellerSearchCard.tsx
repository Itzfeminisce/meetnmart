import { Product, Seller } from "@/types";
import { useBottomSheet, useSheetData } from "../ui/bottom-sheet-modal";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { ImageGridView } from "../ImageGridView";
import { Button } from "../ui/button";
import { Calendar, MapPin, MessageCircle, Phone, Star } from "lucide-react";
import { Separator } from "../ui/separator";
import { formatCurrency, getInitials, sluggify } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { getInlineChatComponentProps, InlineChatSheetBody, InlineChatSheetFooter, InlineChatSheetHeader } from "../chat/InlineChatSheet";
import { ProductSearchCard, ProductSearchCardBody, ProductSearchCardFooter, ProductSearchCardHeader } from "./ProductSearchCard";
import { FeedSearchCardBottomSheetHeader } from "./FeedSearchCard";

interface SellerSearchCardProps {
    data: Seller & { products: Pick<Product, "id" | "name" | "image" | "description">[] } & { location?: { address?: string } }
}


export function SellerSearchCard({ data: seller }: SellerSearchCardProps) {
    const { open } = useBottomSheet()
    return (
            <Card className="group overflow-hidden bg-background p-2 space-y-4  cursor-pointer transition-all hover:bg-muted-foreground/10 max-h-min"
                onClick={() => open({
                    viewId: sluggify(seller.name),
                    body: <SellerSearchCardBottomSheetBody />,
                    footer: <SellerSearchCardBottomSheetFooter />,
                    header: <SellerSearchCardBottomSheetHeader />,
                    data: seller
                })}
            >


                <CardContent className="p-0 space-y-2">
                    <div className="flex items-center gap-2 mb-3">
                        <Avatar
                            className="w-6 h-6 rounded-full"
                        >
                            <AvatarImage
                                src={seller.avatar}
                                alt={seller.name}
                                loading="lazy" />
                            <AvatarFallback>{getInitials(seller.name)}</AvatarFallback>
                        </Avatar>
                        <span className="text-base text-foreground/80">{seller.name}</span>
                    </div>

                    <p className="text-base text-foreground line-clamp-3">
                        {seller.description}
                    </p>
                </CardContent>
                {seller.products && (<div className="relative overflow-hidden max-h-32 rounded-md ">
                    <ImageGridView
                        images={seller.products.map(pr => pr.image)}
                        itemId={seller.id}
                        direction={seller.products.length > 1 ? "horizontal" : "grid"}
                    />
                </div>)
                }
            </Card>
    );
}


function SellerSearchCardBottomSheetHeader() {
    const { data: sellerData } = useSheetData() as { data: SellerSearchCardProps['data'] }
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <Avatar className="w-8 md:w-12 h-8 md:h-12 rounded-full">
                    <AvatarImage
                        src={sellerData.avatar}
                        alt={sellerData.name}
                        loading="lazy"
                    />
                    <AvatarFallback>{getInitials(sellerData.name)}</AvatarFallback>
                </Avatar>
                <div>
                    <h2 className="text-base text-foreground font-semibold flex items-center gap-2">
                        {sellerData.name}
                        {/* {sellerData.verified && <Award className="h-4 w-4 text-blue-500" />} */}
                    </h2>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {/* <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span>{sellerData.rating}</span>
                        </div> */}
                        {/* <span>•</span> */}
                        <span>{ sellerData.is_online ? (sellerData.is_reachable?"Available now": "Away") : "Unavailable"}</span>
                    </div>
                </div>
            </div>
            {/* <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button> */}
        </div>
    )
}

function SellerSearchCardBottomSheetBody() {
    const { data: sellerData, } = useSheetData() as { data: SellerSearchCardProps['data'] }
    const { open } = useBottomSheet()
    // const sellerData = getData() as SellerSearchCardProps['data']
    return (
        <div>
            {/* About Section */}
            <Card className="border-none">
                <CardHeader className="p-2 m-0">
                    <CardTitle className="text-base text-foreground/80">About</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 p-2">
                    {sellerData?.description && <p className="text-base text-foreground">{sellerData.description}</p>}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {sellerData.location && <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            {/* @ts-ignore */}
                            <span>{"Hidden Information" || sellerData.location?.address}</span>
                        </div>}

                        {/* @ts-ignore */}
                        {/* {sellerData.created_at && <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>Member since {"Jan, 2025"}</span>
                        </div>} */}
                    </div>

                    {/* <div className="flex flex-wrap gap-2">
              {sellerData.categories.map((category) => (
                <Badge key={category} variant="secondary">
                  {category}
                </Badge>
              ))}
            </div> */}
                </CardContent>
            </Card>

            <Separator />

            {/* Products */}
            {sellerData?.products.length == 0 ? (
                <div className="p-4 flex items-center justify-center text-muted">No products</div>
            ) : (
                <Card className="border-none">
                    <CardHeader className="p-2 m-0">
                        <CardTitle className="text-base text-foreground/80">Products</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 p-2">
                        <div className="grid grid-cols-1 md:grid-cols-2">
                            {sellerData.products.map((product) => (
                                <div key={product.id} className="flex gap-3 border-b last:border-b-0 py-4 cursor-pointer hover:bg-muted/40 transition-colors"
                                onClick={() => open({
                                    header: <ProductSearchCardHeader />,
                                    body: <ProductSearchCardBody />,
                                    data: {
                                        profiles: {
                                            name: sellerData.name,
                                            avatar: sellerData.avatar
                                        },
                                        ...product,
                                        // ...  sellerData,
                                    }
                                })}
                                >
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        loading="lazy"
                                        className="w-16 h-16 object-cover rounded"
                                    />
                                    <div className="flex-1">
                                        <h4 className="font-medium text-sm line-clamp-2">{product.name}</h4>
                                        <p className="text-sm font-semibold text-foreground/80 mt-1">{formatCurrency(3400)}</p>
                                        <p className="text-sm text-foreground/80 mt-1 line-clamp-1">{product.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}


            <Separator />

            {/* Reviews */}
            {/* @ts-ignore */}
            {(sellerData?.reviews || []).length == 0 ? (
                <div className="p-4 flex items-center justify-center text-muted">No reviews</div>
            ) : (
                <Card className="border-none">
                    <CardHeader className="p-2 m-0">
                        <CardTitle className="text-lg">Recent Reviews</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 p-2">
                        {/* {sellerData.reviews.map((review) => (
              <div key={review.id} className="border-b pb-4 last:border-b-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{review.user}</span>
                    <div className="flex">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{review.date}</span>
                </div>
                <p className="text-sm text-muted-foreground">{review.comment}</p>
              </div>
            ))} */}
                    </CardContent>
                </Card>)}
        </div>
    )
}

function SellerSearchCardBottomSheetFooter() {
    const { open, getData } = useBottomSheet()

    const sellerData = getData() as SellerSearchCardProps['data']
    return (
        <div className="sticky bottom-0 border-t p-2 bg-background">
            <div className="flex gap-3">
                <Button size="sm" variant="outline" className="flex-1 flex items-center gap-2" disabled={!(sellerData?.is_online && sellerData?.is_reachable)}>
                    <Phone className="h-4 w-4" />
                    Call Now
                </Button>

                <Button type='button' onClick={() => open(
                    getInlineChatComponentProps({
                    name: sellerData.name,
                    userId: sellerData.id,
                    source: "SEARCH",
                    // sourceId: sellerData.id
                }))} size="sm" variant='market' className="flex-1 flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    Drop a Message
                </Button>
            </div>
        </div>
    )
}
