import React, { useCallback } from 'react'
import { useBottomSheet, useSheetData } from '../ui/bottom-sheet-modal'
import { FeedItem } from '@/types'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { ExternalLink, MessageCircle, Phone, Star } from 'lucide-react'
import { cn, formatTimeAgo, getInitials, sluggify, toLivekitRoomName, wait } from '@/lib/utils'
import { Separator } from '../ui/separator'
import { Button } from '../ui/button'
import { InlineChatSheetBody, InlineChatSheetFooter, InlineChatSheetHeader } from '../chat/InlineChatSheet'
import { FormProvider, useForm } from 'react-hook-form'
import { Form, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { CallData } from '@/contexts/live-call-context'

const FeedCardPosterSheet = () => {
    return (
        <div>FeedCardPosterSheet</div>
    )
}

export function FeedCardPosterSheetHeader() {
    const { profile } = useAuth()
    const { data: item } = useSheetData() as { data: FeedItem }
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <Avatar className="w-8 md:w-12 h-8 md:h-12 rounded-full">
                    <AvatarImage
                        src={item.author.avatar}
                        alt={item.author.name}
                        loading="lazy"
                    />
                    <AvatarFallback>{getInitials(item.author.name)}</AvatarFallback>
                </Avatar>
                <div>
                    <h2 className="text-base text-foreground/90 font-semibold flex items-center gap-2">
                        {item.author.name}
                        {/* {item.verified && <Award className="h-4 w-4 text-blue-500" />} */}
                    </h2>
                    <p className='text-sm text-foreground/80'>{formatTimeAgo(item.created_at)}</p>
                    <p className={cn(`text-xs text-foreground/80`, [
                        item.author.is_reachable ? 'text-green-500' : 'text-gray-500',
                        profile.id == item.author.id ? 'hidden' : ''
                    ])}>{item.author.is_reachable ? "Available" : "Unavailable"}</p>
                </div>
            </div>
        </div>
    )
}
export function FeedCardPosterSheetBody() {
    const { data: item } = useSheetData() as { data: FeedItem }
    return (
        <div className="space-y-2">
            <div className="px-2 space-y-4">
                {/* Products */}

                {/* Item title */}
                <h3 className="text-base  font-semibold text-foreground/90 my-4">{item.title}</h3>

                {/* Item description */}
                <p className="text-base text-foreground/80 whitespace-pre-wrap break-words">{item.content}</p>

            </div>
            <Separator />

            {item.images.length > 0 && (
                item.images.map((image, idx) => (
                    <div key={idx} className="">
                        <img
                            src={image}
                            alt={image}
                            loading="lazy"
                            className="w-full object-cover"
                        />
                    </div>
                ))
            )}
        </div>
    )
}
export function FeedCardPosterSheetFooter() {
    const navigate = useNavigate()
    const { profile } = useAuth()
    const { open, close } = useBottomSheet()
    const { data } = useSheetData() as { data: FeedItem }

    if (profile.id == data.author.id) return null // Don't show if the user is the author

    const handleCall = useCallback(async () => {
        close()
        await wait(500)

        navigate(`/calls/${toLivekitRoomName(`call_${Date.now()}_${profile.id}`)}`, {
            state: {
                caller: { id: profile.id, name: profile.name },
                room: toLivekitRoomName(`call_${Date.now()}_${profile.id}`),
                receiver: { name: data.author.name, id: data.author.id },
                data: {
                    marketId: data.id,
                    categoryId: data.category.id
                }
            } as CallData,
        });
    }, [data]);

    return (
        <div className="sticky bottom-0 border-t p-2 bg-background">
            <div className="flex gap-3">
                <Button size="sm" variant="outline" disabled={!data.author.is_reachable} className={cn("flex-1 flex items-center gap-2")} onClick={handleCall}>
                    <Phone className="h-4 w-4" />
                    Call Now
                </Button>

                <Button type='button' onClick={() => open({
                    header: <InlineChatSheetHeader />,
                    body: <InlineChatSheetBody />,
                    footer: <InlineChatSheetFooter />,
                    data: {
                        id: data.author.id,
                        name: data.author.name,
                        chatContext: {
                            source: "POST",
                            sourceId: data.id,
                        }
                    },
                    className: "scrollbar-none",
                    viewId: sluggify(data.author.name)
                })} size="sm" variant='market' className="flex-1 flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    Drop a Message
                </Button>
            </div>
        </div>
    )
}


export default FeedCardPosterSheet