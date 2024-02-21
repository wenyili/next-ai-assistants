'use client'

// import { UseChatHelpers } from 'ai/react'
import * as React from 'react'
import Textarea from 'react-textarea-autosize'

import { Button, buttonVariants } from '@/app/ui/button'
import { IconArrowElbow, IconPlus } from '@/app/ui/icons'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from '@/app/ui/tooltip'
import { useEnterSubmit } from '@/app/lib/hooks/use-enter-submit'
import { cn } from '@/app/lib/utils'
import { useRouter, usePathname } from 'next/navigation'
import { UseChatHelpers } from '../lib/chat/type'
import {isMobile} from 'react-device-detect';

export interface PromptProps
  extends Pick<UseChatHelpers, 'input' | 'setInput'>  {
  onSubmit: (value: string) => Promise<void>
  isLoading: boolean
}

export function PromptForm({
  onSubmit,
  input,
  setInput,
  isLoading
}: PromptProps) {
  const { formRef, onKeyDown } = useEnterSubmit()
  const inputRef = React.useRef<HTMLTextAreaElement>(null)
  const router = useRouter()
  const pathname = usePathname()
  let pushpath = '/chat'
  if (pathname.startsWith('/gen-image')) {
    pushpath = '/gen-image'
  }

  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  return (
    <form
      onSubmit={async e => {
        e.preventDefault()
        if (!input?.trim()) {
          return
        }
        setInput('')
        await onSubmit(input)
      }}
      ref={formRef}
    >
      <div className="relative flex max-h-60 w-full grow flex-col overflow-hidden bg-background px-8 sm:rounded-md sm:border sm:px-12">
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <button
                      onClick={e => {
                          e.preventDefault()
                          router.refresh()
                          router.push(pushpath)
                      }}
                      className={cn(
                          buttonVariants({ size: 'sm', variant: 'outline' }),
                          'absolute left-0 top-4 h-8 w-8 rounded-full bg-background p-0 sm:left-4'
                      )}
                    >
                    <IconPlus />
                    <span className="sr-only">New Chat</span>
                    </button>
                </TooltipTrigger>
                <TooltipContent>New Chat</TooltipContent>
            </Tooltip>
        </TooltipProvider>
        <Textarea
          ref={inputRef}
          tabIndex={0}
          onKeyDown={!isMobile ? onKeyDown : undefined}
          rows={1}
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Send a message."
          spellCheck={false}
          className="min-h-[60px] w-full resize-none bg-transparent px-4 py-[1.3rem] focus-within:outline-none sm:text-sm"
        />
        <div className="absolute right-0 top-4 sm:right-4">
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                    <Button
                        type="submit"
                        size="icon"
                        // disabled={isLoading || input === ''}
                    >
                        <IconArrowElbow />
                        <span className="sr-only">Send message</span>
                    </Button>
                    </TooltipTrigger>
                    <TooltipContent>Send message</TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
      </div>
    </form>
  )
}
