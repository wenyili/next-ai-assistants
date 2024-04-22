'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { type Chat } from '@/app/lib/types'
import { cn } from '@/app/lib/utils'
import { buttonVariants } from '@/app/ui/button'
import { IconMessage, IconUsers } from '@/app/ui/icons'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/app/ui/tooltip'

interface SidebarItemProps {
  chat: Omit<Chat, 'message'>
  children: React.ReactNode,
  isEditing: boolean
  handleRename: (id: string, title: string) => void
}

export function SidebarItem({ chat, children, isEditing = false, handleRename }: SidebarItemProps) {
  const pathname = usePathname()
  const isActive = pathname === chat.path

  if (!chat?.id) return null

  return (
    <div className="relative">
      <div className="absolute left-2 top-1 flex h-6 w-6 items-center justify-center">
        <IconMessage className="mr-2" />
      </div>
      <Link
        href={chat.path}
        className={cn(
          buttonVariants({ variant: 'ghost' }),
          'group w-full pl-8 pr-16',
          isActive && 'bg-accent'
        )}
      >
        <div
          className="relative max-h-5 flex-1 select-none overflow-hidden text-ellipsis break-all"
          title={chat.title}
        >
          {isEditing ? 
            <input type="text" className="whitespace-nowrap focus:outline-none" defaultValue={chat.title} 
              onBlur={e => handleRename(chat.id, e.target.value)}
              onKeyUp={e => e.key === 'Enter' && handleRename(chat.id, (e.target as HTMLInputElement).value)}
            />
            :<span className="whitespace-nowrap">{chat.title}</span>}
        </div>
      </Link>
      {isActive && <div className="absolute right-2 top-1">{children}</div>}
    </div>
  )
}
