'use client'

import * as React from 'react'

import { Button } from '@/app/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/app/ui/sheet'
import { IconSidebar } from '@/app/ui/icons'
import { SidebarList } from './sidebar-list'
import { SidebarFooter } from './sidebar-footer'
import { ThemeToggle } from './theme-toggle'

export function Sidebar() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" className="-ml-2 h-9 w-9 p-0">
          <IconSidebar className="h-6 w-6" />
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="inset-y-0 flex h-auto w-[300px] flex-col p-0">
        <SheetHeader className="p-4">
          <SheetTitle className="text-sm">Chat History</SheetTitle>
        </SheetHeader>
        <SidebarList/>
        <SidebarFooter>
          <ThemeToggle />
          {/* <ClearHistory clearChats={clearChats} /> */}
        </SidebarFooter>
      </SheetContent>
    </Sheet>
  )
}
