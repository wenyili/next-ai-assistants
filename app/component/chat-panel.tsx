import { Button } from '@/app/ui/button'
import { ButtonScrollToBottom } from '@/app/component/button-scroll-to-bottom'
import { IconRefresh, IconStop } from '@/app/ui/icons'
import { Content, Message, UseChatHelpers } from '@/app/lib/chat/type'
import dynamic from 'next/dynamic'

const PromptForm = dynamic(() => import('@/app/component/prompt-form'), { ssr: false })

export interface ChatPanelProps
  extends Pick<
    UseChatHelpers,
    | 'append'
    | 'isLoading'
    | 'messages'
    | 'input'
    | 'setInput'
    | 'reload'
    | 'stop'
  > {
  id?: string
  handleSelectImageFile?: (target: File) => void
  images?: string[]
  setImages?: React.Dispatch<React.SetStateAction<string[]>>;
}

export function ChatPanel({
  id,
  isLoading,
  stop,
  append,
  reload,
  input,
  setInput,
  messages,
  handleSelectImageFile,
  images,
  setImages
}: ChatPanelProps) {
  const getContent = (input: string) => {
    let content: string | Content[] = input;
    if (images && images.length > 0) {
        content = [{
            "type": "text",
            "text": input
        }]
        content = content.concat(images.map((imageUrl) => ({
            "type": "image_url",
            "image_url": imageUrl
        })))
    }
    return content
  }

  return (
    <div className="fixed inset-x-0 bottom-0 bg-gradient-to-b from-muted/10 from-10% to-muted/30 to-50%">
      <ButtonScrollToBottom />
      <div className="mx-auto sm:max-w-2xl sm:px-4">
        <div className="flex h-10 items-center justify-center">
          {isLoading ? (
            <Button
              variant="outline"
              onClick={() => stop()}
              className="bg-background"
            >
              <IconStop className="mr-2" />
              Stop generating
            </Button>
          ) : (
            messages?.length > 0 && (
              <Button
                variant="outline"
                onClick={() => reload()}
                className="bg-background"
              >
                <IconRefresh className="mr-2" />
                Regenerate response
              </Button>
            )
          )}
        </div>
        <div className="space-y-4 border-t bg-background px-4 py-2 shadow-lg sm:rounded-t-xl sm:border md:py-4">
          <PromptForm
            onSubmit={async value => {
              await append({
                id,
                content: getContent(value),
                role: 'user'
              })
            }}
            input={input}
            setInput={setInput}
            isLoading={isLoading}
            handleSelectImageFile={handleSelectImageFile}
            images={images}
            setImages={setImages}
          />
        </div>
      </div>
    </div>
  )
}
