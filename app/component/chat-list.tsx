import { type Message } from '@/app/lib/chat/type'

import { Separator } from '@/app/ui/separator'
import { ChatMessage } from '@/app/component/chat-message'
import { useContext } from 'react'
import { SettingContext } from './setting/settingProvider'

export interface ChatList {
  messages: Message[]
  setMessages: (messages: Message[]) => void
}

export function ChatList({ messages, setMessages }: ChatList) {
  const { debug } = useContext(SettingContext)

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
    const newMessage: Message = JSON.parse(JSON.stringify(messages[index]))
    // if content.message is a string
    if (typeof newMessage.content === 'string') {
      newMessage.content = newContent
    } else {
      // message.content is Content[]
      // find the index of Content whose type is 'text'
      const textIndex = newMessage.content.findIndex(content => content.type === 'text')
      newMessage.content[textIndex].text = newContent
    }
    newMessages[index] = newMessage
    setMessages(newMessages)
  }

  let listMessages = messages;
  if (!debug) {
    listMessages = messages.filter((item) => {
      if (item.role === "tool") return false
      if (item.role === "assistant" && item.tool_calls) return false
      return true
    })
  }

  return (
    <div className="relative mx-auto max-w-2xl px-4">
      {listMessages.map((message, index) => (
        <div key={index}>
          <ChatMessage message={message} index={index} removeMessage={removeMessage} editMessage={editMessage}/>
          {index < listMessages.length - 1 && (
            <Separator className="my-4 md:my-8" />
          )}
        </div>
      ))}
    </div>
  )
}
