'use client'

import { type Message } from '@/app/lib/chat/type'

import { Button } from '@/app/ui/button'
import { IconCheck, IconCopy } from '@/app/ui/icons'
import { useCopyToClipboard } from '@/app/lib/hooks/use-copy-to-clipboard'
import { cn } from '@/app/lib/utils'

interface ChatMessageActionsProps extends React.ComponentProps<'div'> {
  message: Message
}

export function ChatMessageActions({
  message,
  className,
  ...props
}: ChatMessageActionsProps) {
  const { isCopied, copyToClipboard } = useCopyToClipboard({ timeout: 2000 })
  
  let text = ''
  if (typeof message.content === 'string') {
    text = message.content
  } else {
    const item = message.content.find(item => item.type === 'text');
    text = item?.text || ''
  }

  const onCopy = () => {
    if (isCopied) return
    copyToClipboard(text)
  }

  return (
    <div
      className={cn(
        'flex items-center justify-end transition-opacity group-hover:opacity-100 md:absolute md:-right-10 md:-top-2 md:opacity-0',
        className
      )}
      {...props}
    >
      <Button variant="ghost" size="icon" onClick={onCopy}>
        {isCopied ? <IconCheck /> : <IconCopy />}
        <span className="sr-only">Copy message</span>
      </Button>
    </div>
  )
}
