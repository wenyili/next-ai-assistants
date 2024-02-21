'use client'

import { Message } from '@/app/lib/chat/type'
import { cn } from '@/app/lib/utils'
import { ChatList } from '@/app/component/chat-list'
import { ChatPanel } from '@/app/component/chat-panel'
import { ChatScrollAnchor } from '@/app/component/chat-scroll-anchor'
import { useGenImage } from '@/app/lib/chat/use-gen-image'
import { usePathname, useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'

export interface GenImageProps extends React.ComponentProps<'div'> {
  initialMessages?: Message[]
  id?: string
}

export function GenImage({ id, initialMessages, className }: GenImageProps) {
    const router = useRouter()
    const path = usePathname()

    const { messages, append, reload, stop, isLoading, input, setInput} = useGenImage({
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
            if (path != `/gen-image/${id}`) {
                router.push(`/gen-image/${id}`)
                router.refresh()
            }
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
