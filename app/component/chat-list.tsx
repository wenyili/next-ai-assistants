import { type Message } from '@/app/lib/chat/type'

import { Separator } from '@/app/ui/separator'
import { ChatMessage } from '@/app/component/chat-message'
import { text } from 'stream/consumers'

export interface ChatList {
  messages: Message[]
  setMessages: (messages: Message[]) => void
}

export function ChatList({ messages, setMessages }: ChatList) {
  if (!messages.length) {
    return null
  }

  const removeMessage = (index: number) => {
    const newMessages = [...messages]
    newMessages.splice(index, 1)
    setMessages(newMessages)
  }

  const editMessage = (index: number, newContent: string) => {
    const newMessages = [...messages]
    const message = newMessages[index]
    // if content.message is a string
    if (typeof message.content === 'string') {
      message.content = newContent
    } else {
      // message.content is Content[]
      // find the index of Content whose type is 'text'
      const textIndex = message.content.findIndex(content => content.type === 'text')
      message.content[textIndex].text = newContent
    }
    setMessages(newMessages)
  }

  return (
    <div className="relative mx-auto max-w-2xl px-4">
      {messages.map((message, index) => (
        <div key={index}>
          <ChatMessage message={message} index={index} removeMessage={removeMessage} editMessage={editMessage}/>
          {index < messages.length - 1 && (
            <Separator className="my-4 md:my-8" />
          )}
        </div>
      ))}
    </div>
  )
}
