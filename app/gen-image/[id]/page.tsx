import { Chat } from '@/app/component/chat'

export interface ChatPageProps {
  params: {
    id: string
  }
}

export default async function GenImagePage({ params }: ChatPageProps) {
  return <Chat id={params.id} />
}
