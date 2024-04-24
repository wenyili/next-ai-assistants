import { Button } from '@/app/ui/button'
import { ButtonScrollToBottom } from '@/app/component/button-scroll-to-bottom'
import { IconRefresh, IconSave, IconSpinner, IconStop } from '@/app/ui/icons'
import { Content, Message, UseChatHelpers } from '@/app/lib/chat/type'
import dynamic from 'next/dynamic'
import { saveChat } from '../actions'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { mutate } from 'swr'

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
  setMessages: (messages: Message[]) => void
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
  setImages,
  setMessages
}: ChatPanelProps) {
  const [isSavePending, startSaveTransition] = useTransition()
  const router = useRouter()
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

  const getTitle = async () => {
    const prompt = [{
      role: "user",
      content: `${JSON.stringify(messages.slice(0, 2))}\n为上面这段对话取个名字（尽量简短），不要带引号：`
    }]
    const response = await fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({
        messages: prompt,
        modelName: "gpt-3.5-turbo",
        stream: false
      }),
    })
    const data = await response.json();
    return data.content
  }
  
  const saveMessage = async () => {
    try {
      const title = await getTitle()
      await saveChat({
        id,
        title,
        path: `/chat/${id}`,
        createdAt: new Date(),
        messages
      })
      router.push(`/chat/${id}`)
      router.refresh()
    } catch (err) {
      console.error(err)
      alert(err)
    }
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
              <div>
                <Button
                  variant="outline"
                  onClick={() => startSaveTransition(async () => {
                    await saveMessage()
                    mutate('/api/storage')
                  })}
                  className="bg-background"
                >
                  {isSavePending ? <IconSpinner className="mr-2 animate-spin" /> : <IconSave className="mr-2" />}
                  Save
                </Button>
                <Button
                  variant="outline"
                  onClick={() => reload()}
                  className="bg-background ml-1"
                >
                  <IconRefresh className="mr-2" />
                  Regenerate response
                </Button>
              </div>
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
            setMessages={setMessages}
          />
        </div>
      </div>
    </div>
  )
}
