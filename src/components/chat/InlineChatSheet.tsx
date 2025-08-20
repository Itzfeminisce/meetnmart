import React, { useEffect, useState } from 'react'
import { Button } from '../ui/button'
import { Textarea } from '../ui/textarea'
import { quickActions } from '@/data/pulse-mocks'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'
import { useAuth } from '@/contexts/AuthContext'
import { useSendMessage } from '@/hooks/api-hooks'
import { useBottomSheet, useSheetData, useSheetOperations } from '../ui/bottom-sheet-modal'
import { User } from '@/types'
import { Loader2 } from 'lucide-react'
import { useChatStore } from '@/contexts/store/conversation'
import { sluggify } from '@/lib/utils'

export function InlineChatSheetHeader() {
    return (
        <div className="">
            <h2 className="text-lg font-semibold">Write your message</h2>
        </div>
    )
}

export function InlineChatSheetBody() {
    const quickMessage = useChatStore(ctx => ctx.quickMessage)
    const setQuickMessage = useChatStore(ctx => ctx.addQuickMessage)


    function handleMessageChange(value: string) {
        setQuickMessage(value)
    }


    useEffect(() => {
        return () => setQuickMessage('') // Clear the message when the component unmounts
    }, [])


    return (
        <Textarea
            className="w-full mt-4 p-2 rounded-none bg-transparent border-none shadow-none outline-none ring-0 resize-none focus:outline-none focus:ring-0 focus:border-0 focus:border-none focus-visible:outline-none focus-visible:ring-0"
            style={{ boxShadow: 'none', resize: 'none' }}
            rows={10}
            placeholder="Type your message here..."
            onChange={ev => handleMessageChange(ev.target.value)}
            value={quickMessage ?? ""}
        />
    )
}

export function InlineChatSheetFooter() {
    const { profile } = useAuth()
    const addQuickMessage = useChatStore(ctx => ctx.addQuickMessage)
    const message = useChatStore(ctx => ctx.quickMessage)

    const { close: closeSheet } = useBottomSheet()

    const { mutateAsync: sendMessage, isPending, error } = useSendMessage()

    const { data: recipient } = useSheetData() as { data: Pick<User, "id" | "name"> & { chatContext: any } }


    // Find the quick actions for the user's role
    const actionsForRole = Object.entries(quickActions).find(([key]) => key.includes(profile.role));
    const actions = actionsForRole ? actionsForRole[1] : [];


    const handleSubmit = async () => {
        try {
            await sendMessage({
                message: message,
                to: recipient.id,
                context: recipient.chatContext
            })
            addQuickMessage('') // Clear the message after sending
            closeSheet()
        } catch (error) {

        }
    }


    return (
        <div className="p-2">
            <div className="relative">
                <div className="flex overflow-x-auto gap-2 scrollbar-none  pb-2">
                    {Array.isArray(actions) && actions.map((action, index) => (
                        <React.Fragment key={index}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        size="sm"
                                        variant='outline'
                                        className={`rounded-full cursor-pointer transition-colors px-3 md:py-1.5 text-sm font-medium flex-shrink-0 relative`}
                                        onClick={() => addQuickMessage(action.message)}
                                        disabled={isPending}
                                    >
                                        {action.text}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{action.tooltip}</p>
                                </TooltipContent>
                            </Tooltip>
                        </React.Fragment>
                    ))}
                </div>
            </div>
            <div className=""></div>
            <Button variant='market' size='sm' className="w-full" disabled={!message?.trim() || isPending} onClick={handleSubmit}>
                {isPending && <Loader2 className="w-3 h-3 animate-spin" />}
                Send Message
            </Button>
        </div>
    )
}

interface InlineChatSheetComponentProps {
    userId: string;
    name: string;
    source?: Capitalize<string>;
    sourceId?: string;
}
export function getInlineChatComponentProps({ name, userId,source = "DEFAULT",sourceId = "DEFAULT"}: InlineChatSheetComponentProps) {


    return {
        header: <InlineChatSheetHeader />,
        body: <InlineChatSheetBody />,
        footer: <InlineChatSheetFooter />,
        data: {
            id: userId,
            name: name,
            chatContext: {
                source: source,
                sourceId: sourceId,
            }
        },
        className: "scrollbar-none",
        viewId: sluggify(name)
    }
}