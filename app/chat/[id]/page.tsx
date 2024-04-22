import { getChat } from '@/app/actions'
import { Chat } from '@/app/component/chat'
import { auth } from '@/auth'
import { notFound, redirect } from 'next/navigation'

export interface ChatPageProps {
  params: {
    id: string
  }
}

export default async function ChatPage({ params }: ChatPageProps) {
  const session = await auth()

  if (!session?.user) {
    redirect(`/sign-in?next=/chat/${params.id}`)
  }

  const chat = await getChat(params.id)

  if (!chat) {
    notFound()
  }

  if (chat?.userId !== session?.user?.name) {
    notFound()
  }

  return <Chat id={params.id} initialMessages={chat.messages}/>
}
