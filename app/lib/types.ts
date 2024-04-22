import { type Message } from '@/app/lib/chat/type'

export interface Chat extends Record<string, any> {
  id: string
  title: string
  createdAt: Date
  userId: string
  path: string
  messages: Message[]
  sharePath?: string
}

export interface ChatMeta extends Record<string, any> {
  id: string
  title: string
  userId: string
  path: string
}

export type ServerActionResult<Result> = Promise<
  | Result
  | {
      error: string
    }
>
