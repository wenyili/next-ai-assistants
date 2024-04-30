'use client'

import { Message } from '@/app/lib/chat/type'
import { cn } from '@/app/lib/utils'
import { ChatList } from '@/app/component/chat-list'
import { ChatPanel } from '@/app/component/chat-panel'
import { ChatScrollAnchor } from '@/app/component/chat-scroll-anchor'
import { useChat } from '@/app/lib/chat/use-chat'
import { toast } from 'react-hot-toast'
import { experimental_onToolCall } from '@/app/lib/experimental_onToolCall'
import { useContext } from 'react'
import { SettingContext } from './setting/settingProvider'

export interface ChatProps extends React.ComponentProps<'div'> {
  initialMessages?: Message[]
  id?: string
}

export function Chat({ id, initialMessages, className }: ChatProps) {
    const { model, tools } = useContext(SettingContext)
    const { messages, append, reload, stop, isLoading, input, setInput, images, setImages, handleSelectImageFile, setMessages} = useChat({
        model,
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
            // if (path != `/chat/${id}`) {
            //     router.push(`/chat/${id}`)
            //     router.refresh()
            // }
        },
        experimental_onToolCall,
        tools
    })
    return (
        <>
            <div className={cn('pb-[200px] pt-4 md:pt-10', className)}>
                <ChatList messages={messages} setMessages={setMessages} />
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
                handleSelectImageFile={handleSelectImageFile}
                images={images}
                setImages={setImages}
                setMessages={setMessages}
            />
        </>
    )
}
