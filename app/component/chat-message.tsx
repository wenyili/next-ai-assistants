// Inspired by Chatbot-UI and modified to fit the needs of this project
// @see https://github.com/mckaywrigley/chatbot-ui/blob/main/components/Chat/ChatMessage.tsx

import React, { useContext, useState } from "react"
import { Content, Message } from '@/app/lib/chat/type'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'

import { cn } from '@/app/lib/utils'
import { CodeBlock } from '@/app/ui/codeblock'
import { MemoizedReactMarkdown } from '@/app/ui/markdown'
import { IconOpenAI, IconUser, IconTool } from '@/app/ui/icons'
import { ChatMessageActions } from '@/app/component/chat-message-actions'
import Image from 'next/image'
import { ImagePreview } from "../ui/image-preview"
import { SettingContext } from "./setting/settingProvider"
export interface ChatMessageProps {
  message: Message
  index: number
  removeMessage: (index: number) => void
  editMessage: (index: number, newContent: string) => void
}

export function ChatMessage({ message, index, removeMessage, editMessage, ...props }: ChatMessageProps) {
  const [showImagePreview, setShowImagePreview] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  let images: string[] = []
  let text = ''
  if (message.tool_calls) {
    text = `\`\`\` json
${JSON.stringify(message.tool_calls, null, 2)}
\`\`\``
  } else if (typeof message.content === 'string') {
    if (message.role === 'tool') {
      text = `\`\`\` json
${message.content}
\`\`\``
    } else {
      text = message.content
    }
  } else if (Array.isArray(message.content)) {
    const item = message.content.find(item => item.type === 'text');
    text = item?.text || ''
    images =  message.content
      .filter((item):item is Content & {image_url: string} => item.type === 'image_url' && item.image_url !== undefined)
      .map(item => item.image_url);
  }

  const getIcon = () => {
    switch (message.role) {
      case 'system':
        return <IconOpenAI/>
      case 'user':
        return <IconUser/>
      case 'assistant':
        if (message.tool_calls) return <IconOpenAI fill="#FF0000"/>;
        return <IconOpenAI/>
      case 'tool':
        return <IconTool/>
      default:
        return <span className="text-gray-500">UNKNOWN</span>
    }
  }

  return (
    <div
      className={cn('group relative mb-4 flex items-start md:-ml-12')}
      {...props}
    >
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border shadow',
          message.role === 'user'
            ? 'bg-background'
            : 'bg-primary text-primary-foreground'
        )}
      >
        {getIcon()}
      </div>
      <div className="flex-1 px-1 ml-4 space-y-2 overflow-hidden">
        <MemoizedReactMarkdown
          className="prose break-words dark:prose-invert prose-p:leading-relaxed prose-pre:p-0"
          remarkPlugins={[remarkGfm, remarkMath]}
          components={{
            p({ children }) {
              return <p className="mb-2 last:mb-0 whitespace-pre-wrap">{children}</p>
            },
            img({ node, ...props }) {
              return <img className="max-w-[67%]" {...props} />
            },
            code({ node, className, children, ...props }) {
              const childArray = React.Children.toArray(children)
              const firstChild = childArray[0] as React.ReactElement
              const firstChildAsString = React.isValidElement(firstChild)
            ? (firstChild as React.ReactElement).props.children
            : firstChild

              if (firstChildAsString === "▍") {
                return <span className="mt-1 animate-pulse cursor-default">▍</span>
              }

              if (typeof firstChildAsString === "string") {
                childArray[0] = firstChildAsString.replace("`▍`", "▍")
              }

              const match = /language-(\w+)/.exec(className || "")

              if (
                typeof firstChildAsString === "string" &&
                !firstChildAsString.includes("\n")
              ) {
                return (
                  <code className={className} {...props}>
                    {childArray}
                  </code>
                )
              }

              return (
                <CodeBlock
                  key={Math.random()}
                  language={(match && match[1]) || ''}
                  value={String(children).replace(/\n$/, '')}
                  {...props}
                />
              )
            }
          }}
        >
          {text}
        </MemoizedReactMarkdown>
        {
          images.map((url, index) => (
            <Image 
              key={index} 
              src={url} 
              alt={`image-${index+1}`} 
              width={300} 
              height={300} 
              onClick={() => {
                setSelectedImage(url)
                setShowImagePreview(true)
              }}
              loading="lazy"
            />
          ))
        }
        <ChatMessageActions message={message} index={index} removeMessage={removeMessage} editMessage={editMessage} />
      </div>
      {showImagePreview && selectedImage && (
        <ImagePreview
          url={selectedImage}
          isOpen={showImagePreview}
          onOpenChange={(isOpen: boolean) => {
            setShowImagePreview(isOpen)
            setSelectedImage(null)
          }}
        />
      )}
    </div>
  )
}
