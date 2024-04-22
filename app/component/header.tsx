import * as React from 'react'
import Link from 'next/link'

import { auth } from '@/auth'
import { Button } from '@/app/ui/button'
import { Sidebar } from '@/app/component/sidebar'
import {
  IconSeparator,
} from '@/app/ui/icons'
import { UserMenu } from '@/app/component/user-menu'
import { signOut } from '@/auth'
import dynamic from 'next/dynamic'

const ModelType = dynamic(() => import('@/app/component/model-type'), { ssr: false })

async function UserOrLogin() {
  const session = await auth() 
  return (
    <div className="flex items-center">
      <IconSeparator className="w-6 h-6 text-muted-foreground/50" /> 
      {session?.user ? (
        <UserMenu user={session.user} signOut={async () => {
          'use server'
          await signOut()
        }} />
      ) : (
        <Button variant="link" asChild className="-ml-2">
          <Link href="/sign-in?callbackUrl=/">Login</Link>
        </Button>
      )}
    </div>
  )
}

export function Header() {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between w-full h-16 px-4 border-b shrink-0 bg-gradient-to-b from-background/10 via-background/50 to-background/80 backdrop-blur-xl">
      <div className="flex items-center">
        <Sidebar/>
        <React.Suspense fallback={<div className="flex-1 overflow-auto" />}>
          <UserOrLogin />
        </React.Suspense>
      </div>
      <div className="flex items-center">
        <ModelType />
      </div>
    </header>
  )
}
