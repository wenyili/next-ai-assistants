'use client'

import { Message } from '@/app/lib/chat/type'
import { cn } from '@/app/lib/utils'
import { ChatList } from '@/app/component/chat-list'
import { ChatPanel } from '@/app/component/chat-panel'
import { ChatScrollAnchor } from '@/app/component/chat-scroll-anchor'
import { useChat } from '@/app/lib/chat/use-chat'
import { usePathname, useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'

export interface ChatProps extends React.ComponentProps<'div'> {
  initialMessages?: Message[]
  id?: string
}

export function Chat({ id, initialMessages, className }: ChatProps) {
    const router = useRouter()
    const path = usePathname()
    const { messages, append, reload, stop, isLoading, input, setInput} = useChat({
        initialMessages,
        id,
        body: {
            id
        },
        onResponse(response) {
            if (response.status === 401) {
                toast.error(response.statusText)
            }
        },
        onFinish() {
            // if (!path.includes('chat')) {
            //     router.push(`/chat/${id}`)
            //     router.refresh()
            // }
        }
    })
    return (
        <>
            <div className={cn('pb-[200px] pt-4 md:pt-10', className)}>
                <ChatList messages={messages} />
                <ChatScrollAnchor trackVisibility={isLoading} />
            </div>
            <ChatPanel
                id={id}
                isLoading={isLoading}
                append={append}
                stop={stop}
                reload={reload}
                messages={messages}
                input={input}
                setInput={setInput}
            />
        </>
    )
}
