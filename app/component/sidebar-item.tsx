'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { cn } from '@/app/lib/utils'
import { buttonVariants } from '@/app/ui/button'
import { IconMessage } from '@/app/ui/icons'

interface SidebarItemProps {
  name: string
  path: string
}

export function SidebarItem({ name, path }: SidebarItemProps) {
  const pathname = usePathname()
  const isActive = pathname === path

  return (
    <div className="relative">
      <div className="absolute left-2 top-1 flex h-6 w-6 items-center justify-center">
        <IconMessage className="mr-2" />
      </div>
      <Link
        href={path}
        className={cn(
          buttonVariants({ variant: 'ghost' }),
          'group w-full pl-8 pr-16',
          isActive && 'bg-accent'
        )}
      >
        <div
          className="relative max-h-5 flex-1 select-none overflow-hidden text-ellipsis break-all"
          title={name}
        >
          <span className="whitespace-nowrap">{name}</span>
        </div>
      </Link>
    </div>
  )
}
