'use client'

// import { UseChatHelpers } from 'ai/react'
import * as React from 'react'
import Textarea from 'react-textarea-autosize'

import { Button, buttonVariants } from '@/app/ui/button'
import { IconArrowElbow, IconPlus, IconImage, IconMic } from '@/app/ui/icons'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from '@/app/ui/tooltip'
import { useEnterSubmit } from '@/app/lib/hooks/use-enter-submit'
import { cn } from '@/app/lib/utils'
import { useRouter } from 'next/navigation'
import { UseChatHelpers } from '../lib/chat/type'
import {isMobile} from 'react-device-detect';
import { Input } from '../ui/input'
import { ChatImagesDisplay } from './chat-images-display'
import { useModel } from '../lib/model'
import { VoiceDetector } from './voice-detector'

export interface PromptProps
  extends Pick<UseChatHelpers, 'input' | 'setInput'>  {
  onSubmit: (value: string) => Promise<void>
  isLoading: boolean
  handleSelectImageFile?: (target: File) => void
  images?: string[]
  setImages?: React.Dispatch<React.SetStateAction<string[]>>;
}

function PromptForm({
  onSubmit,
  input,
  setInput,
  isLoading,
  handleSelectImageFile,
  images,
  setImages
}: PromptProps) {
  const { formRef, onKeyDown } = useEnterSubmit()
  const inputRef = React.useRef<HTMLTextAreaElement>(null)
  const router = useRouter()
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const { model } = useModel()
  const [ showVoiceDetector, setShowVoiceDetector ] = React.useState<boolean>(false)

  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  const handlePaste = (event: React.ClipboardEvent) => {
    const items = event.clipboardData.items
    if (!items || items.length === 0 ) {
      return
    }
    const item = items[0]
    if (item.type.indexOf("image") !== 0) {
      return
    }
    const file = item.getAsFile()
    if (file) {
      handleSelectImageFile?.(file)
    }
  }

  return (
    <>
      {showVoiceDetector && (
        <VoiceDetector
          isOpen={showVoiceDetector}
          onOpenChange={async (isOpen: boolean, result?: string) => {
            setShowVoiceDetector(isOpen)
            if (result) {
              await onSubmit(result)
            }
          }}
        />
      )}
      {(images && setImages && images.length > 0) && <ChatImagesDisplay images={images} setImages={setImages}/>}
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
        <div className="flex flex-row items-center max-h-60 w-full grow overflow-hidden bg-background px-2 sm:rounded-md sm:border sm:px-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={e => {
                      e.preventDefault()
                      router.refresh()
                      // redirect to /
                      router.push('/')
                  }}
                  className={cn(
                    buttonVariants({ size: 'sm', variant: 'outline' }),
                    'top-4 h-8 w-8 rounded-full bg-background p-2'
                  )}
                >
                  <IconPlus />
                  <span className="sr-only">New Chat</span>
                </button>
              </TooltipTrigger>
              <TooltipContent>New Chat</TooltipContent>
            </Tooltip>
            {(model === "GPT4" && handleSelectImageFile) && (<Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    buttonVariants({ size: 'sm', variant: 'outline' }),
                    'ml-2 top-4 h-8 w-8 rounded-full bg-background p-2'
                  )}
                >
                  <IconImage />
                  <span className="sr-only">New Image</span>
                </button>
              </TooltipTrigger>
              <TooltipContent>New Image</TooltipContent>
            </Tooltip>)}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={e => {
                    setShowVoiceDetector(true)
                  }}
                  className={cn(
                    buttonVariants({ size: 'sm', variant: 'outline' }),
                    'ml-2 top-4 h-8 w-8 rounded-full bg-background p-2'
                  )}
                >
                  <IconMic />
                  <span className="sr-only">Ask</span>
                </button>
              </TooltipTrigger>
              <TooltipContent>Ask</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Textarea
            ref={inputRef}
            tabIndex={0}
            onKeyDown={!isMobile ? onKeyDown : undefined}
            rows={1}
            value={input}
            onChange={e => setInput(e.target.value)}
            onPaste={handlePaste}
            placeholder="Send a message."
            spellCheck={false}
            className="min-h-[60px] w-full resize-none bg-transparent px-4 py-[1.3rem] focus-within:outline-none sm:text-sm"
          />
          <div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                      type="submit"
                      size="icon"
                      disabled={isLoading || input === ''}
                  >
                      <IconArrowElbow />
                      <span className="sr-only">Send message</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Send message</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          {/* Hidden input to select files from device */}
          {(model === "GPT4" && handleSelectImageFile) && (<Input
            ref={fileInputRef}
            className="hidden"
            type="file"
            onChange={e => {
              if (!e.target.files) return
              handleSelectImageFile(e.target.files[0])
              e.target.value = '';
            }}
            accept="image/*"
          />)}
        </div>
      </form>
    </>
  )
}

PromptForm.displayname = 'ModelType';
export default PromptForm;