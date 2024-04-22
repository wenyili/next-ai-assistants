'use client'

import { type Message } from '@/app/lib/chat/type'
import Textarea from 'react-textarea-autosize'

import { Button } from '@/app/ui/button'
import { IconCheck, IconCopy, IconEdit, IconSpinner, IconTrash } from '@/app/ui/icons'
import { useCopyToClipboard } from '@/app/lib/hooks/use-copy-to-clipboard'
import { cn } from '@/app/lib/utils'
import React, { useEffect, useState } from 'react'
import {
  EditDialog,
  EditDialogClose,
  EditDialogContent,
  EditDialogFooter,
  EditDialogHeader,
  EditDialogTitle
} from '@/app/ui/edit-dialog'

interface ChatMessageActionsProps extends React.ComponentProps<'div'> {
  message: Message
  index: number
  removeMessage: (index: number) => void
  editMessage: (index: number, newContent: string) => void
}

export function ChatMessageActions({
  message,
  index,
  className,
  removeMessage,
  editMessage,
  ...props
}: ChatMessageActionsProps) {
  const { isCopied, copyToClipboard } = useCopyToClipboard({ timeout: 2000 })
  const [editDialogOpen, setEditDialogOpen] = React.useState(false)
  const [isEditPending, startEditTransition] = React.useTransition()
  const [text, setText] = useState<string>('')
  const [messageContent, setMessageContent] = useState(''); 
  
  useEffect(() => {
    if (typeof message.content === 'string') {
      setText(message.content)
      setMessageContent(message.content)
    } else {
      const item = message.content.find(item => item.type === 'text');
      setText(item?.text || '')
      setMessageContent(item?.text || '')
    }
  }, [message])

  const onCopy = () => {
    if (isCopied) return
    copyToClipboard(text)
  }

  return (
    <div
      className={cn(
        'flex items-center justify-end transition-opacity group-hover:opacity-100 ',
        className
      )}
      {...props}
    >
      <Button variant="ghost" size="icon" onClick={onCopy}>
        {isCopied ? <IconCheck /> : <IconCopy />}
        <span className="sr-only">Copy message</span>
      </Button>
      <Button variant="ghost" size="icon" onClick={() => setEditDialogOpen(true)}>
        <IconEdit/>
        <span className="sr-only">Edit message</span>
      </Button>
      <Button variant="ghost" size="icon" onClick={() => {removeMessage(index)}}>
        <IconTrash/>
        <span className="sr-only">Remove message</span>
      </Button>
      
      <EditDialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <EditDialogContent>
          <EditDialogHeader>
            <EditDialogTitle>Edit Message</EditDialogTitle>
          </EditDialogHeader>
          <fieldset>
            <Textarea 
              className="rounded-md border border-input min-h-[60px] w-full px-2 py-2 sm:text-sm"
              id="message" value={messageContent}
              onChange={e => setMessageContent(e.target.value)}/>
          </fieldset>
          <EditDialogFooter>
            <EditDialogClose
              disabled={isEditPending}
              onClick={event => {
                event.preventDefault()
                startEditTransition(async () => {
                  editMessage(index, messageContent)
                  setEditDialogOpen(false)
                })
              }}
            >
              {isEditPending && <IconSpinner className="mr-2 animate-spin" />}
              Confirm
            </EditDialogClose>
          </EditDialogFooter>
        </EditDialogContent>
      </EditDialog>
    </div>
  )
}
