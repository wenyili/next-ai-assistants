import { Chat } from '@/app/component/chat'
import { nanoid } from '@/app/lib/utils'

export default async function ChatPage() {
  const id = nanoid()

  return <Chat id={id} />
}
