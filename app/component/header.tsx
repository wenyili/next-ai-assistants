import * as React from 'react'
import Link from 'next/link'

import { auth } from '@/auth'
// import { clearChats } from '@/app/lib/actions'
import { Button } from '@/app/ui/button'
import { Sidebar } from '@/app/component/sidebar'
// import { SidebarList } from '@/app/component/sidebar-list'
import {
  IconSeparator,
} from '@/app/ui/icons'
import { SidebarFooter } from '@/app/component/sidebar-footer'
import { ThemeToggle } from '@/app/component/theme-toggle'
// import { ClearHistory } from '@/components/clear-history'
import { UserMenu } from '@/app/component/user-menu'
import { signOut } from '@/auth'

async function UserOrLogin() {
  const session = await auth()
  return (
    <>
      <Sidebar>
        {/* <React.Suspense fallback={<div className="flex-1 overflow-auto" />}>
          <SidebarList userId={session?.user?.id} />
        </React.Suspense> */}
        <SidebarFooter>
          <ThemeToggle />
          {/* <ClearHistory clearChats={clearChats} /> */}
        </SidebarFooter>
      </Sidebar>
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
    </>
  )
}

export function Header() {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between w-full h-16 px-4 border-b shrink-0 bg-gradient-to-b from-background/10 via-background/50 to-background/80 backdrop-blur-xl">
      <div className="flex items-center">
        <React.Suspense fallback={<div className="flex-1 overflow-auto" />}>
          <UserOrLogin />
        </React.Suspense>
      </div>
    </header>
  )
}
