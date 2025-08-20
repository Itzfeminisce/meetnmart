import { FeedItem, Product } from "@/types";
import { useBottomSheet, useSheetData } from "../ui/bottom-sheet-modal";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { ImageGridView } from "../ImageGridView";
import { Button } from "../ui/button";
import { Calendar, MapPin, MessageCircle, Phone, Star } from "lucide-react";
import { Separator } from "../ui/separator";
import { formatCurrency, sluggify } from "@/lib/utils";

interface FeedSearchCardProps {
    data: Pick<FeedItem, "id" | "content" | "images" | "title">
}


export function FeedSearchCard({ data }: FeedSearchCardProps) {
    const { open } = useBottomSheet()
    return (
        <Card className="group overflow-hidden bg-background p-2 space-y-4  cursor-pointer transition-all hover:bg-muted-foreground/10"
            onClick={() => open({
                viewId: sluggify(data.title),
                body: <FeedSearchCardBottomSheetBody />,
                // footer: <FeedSearchCardBottomSheetFooter />,
                header: <FeedSearchCardBottomSheetHeader />,
                data: data
            })}
        >
            {data.images && data.images.length > 0 ? (
                <div className="relative overflow-hidden max-h-32 rounded-md w-full">
                    <ImageGridView
                        images={data.images}
                        itemId={data.id}
                        direction={data.images.length > 1 ? "horizontal" : "grid"}
                    />
                </div>

            ) : (
                <h1 className="text-foreground/80 text-base">{data.title}</h1>
            )}
            <CardContent className="p-0 space-y-2">
                <p className="text-base text-foreground line-clamp-3">
                    {data.content}
                </p>
            </CardContent>

        </Card>
    );
}


export function FeedSearchCardBottomSheetHeader() {
    const { data: dataData } = useSheetData() as { data: FeedSearchCardProps['data'] }
    return (
        <h2 className="text-base font-semibold text-foreground/80">
            {dataData.title}
        </h2>
    )
}

export function FeedSearchCardBottomSheetBody() {
    const { data } = useSheetData() as { data: FeedSearchCardProps['data'] }

    return (
        <div className="space-y-4">

            <p className="text-base text-foreground p-2">{data.content}</p>

            <Separator />

            {/* Products */}
            <Card className="border-none">
                <CardContent className="space-y-4 p-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {data.images.map((image, idx) => (
                            // <div key={data.id} className="flex gap-3 p-3 border rounded-lg">
                            <img key={idx}
                                src={image}
                                alt={data.title}
                                className="object-cover rounded"
                            />
                            // </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export function FeedSearchCardBottomSheetFooter() {
    const { open } = useBottomSheet()
    return (
        <div className="sticky bottom-0 border-t px-2 py-4 bg-background">
            <div className="flex gap-3">
                <Button size="sm" variant="outline" className="flex-1 flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Call Now
                </Button>
                <Button onClick={() => open({
                    viewId: "chat",
                    body: <>
                        <p>Write your message</p>
                    </>,
                    data: {
                        name: "John Doe"
                    }
                })} size="sm" className="flex-1 flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    Drop a Message
                </Button>
            </div>
        </div>
    )
}
