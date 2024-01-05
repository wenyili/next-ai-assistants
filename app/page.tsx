import { nanoid } from '@/app/lib/utils'
import { Chat } from '@/app/component/chat'

export default function Home() {
  const id = nanoid()

  return (
    <Chat id={id} />
  )
}
