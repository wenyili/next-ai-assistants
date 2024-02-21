// Inspired by Chatbot-UI and modified to fit the needs of this project
// @see https://github.com/mckaywrigley/chatbot-ui/blob/main/components/Chat/ChatMessage.tsx

import React from "react"
import { Message } from '@/app/lib/chat/type'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'

import { cn } from '@/app/lib/utils'
import { CodeBlock } from '@/app/ui/codeblock'
import { MemoizedReactMarkdown } from '@/app/ui/markdown'
import { IconOpenAI, IconUser } from '@/app/ui/icons'
import { ChatMessageActions } from '@/app/component/chat-message-actions'

export interface ChatMessageProps {
  message: Message
}

export function ChatMessage({ message, ...props }: ChatMessageProps) {
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
        {message.role === 'user' ? <IconUser /> : <IconOpenAI />}
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
          {message.content}
        </MemoizedReactMarkdown>
        <ChatMessageActions message={message} />
      </div>
    </div>
  )
}
