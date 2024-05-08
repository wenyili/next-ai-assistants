'use client'
import { EditName, removeChat } from '@/app/actions/chat'
import { SidebarActions } from '@/app/component/sidebar-actions'
import { SidebarItem } from '@/app/component/sidebar-item'
import {  useState } from 'react'
import { Chat } from '../lib/types'
import useSWR from 'swr'
import { IconSpinner } from '../ui/icons'

const fetcher = (uri:string) => fetch(uri).then(res => res.json())

export function SidebarList() {
  const [editId, setEditId] = useState<string|null>(null)

  const { data: chats, error, isLoading, mutate } = useSWR('/api/storage', fetcher)
  if (error) return <div className="flex items-center justify-center h-screen text-2xl">Error</div>
  if (isLoading) return (
    <div className="flex items-center justify-center h-screen text-2xl">
      <IconSpinner className="h-8 w-8" />
    </div>
  )

  const handleEdit = (id: string | null) => {
    setEditId(id)
  }

  const handleRename = (id: string, name: string) => {
    EditName(id, name).then(() => {
      mutate()
      setEditId(null)
    })
  }

  const handleDelete = async (id: string) => {
    await removeChat(id)
    mutate()
  }

  return (
    <div className="flex-1 overflow-auto">
      {chats?.length ? (
        <div className="space-y-2 px-2">
          {chats.map(
            (chat: Omit<Chat, "message">) =>
              chat && (
                <SidebarItem key={chat.id} chat={chat} isEditing={editId !== null && editId === chat.id} handleRename = {handleRename}>
                  <SidebarActions
                    chat={chat}
                    removeChat={handleDelete}
                    handleEdit={handleEdit}
                  />
                </SidebarItem>
              )
          )}
        </div>
      ) : (
        <div className="p-8 text-center">
          <p className="text-sm text-muted-foreground">No chat history</p>
        </div>
      )}
    </div>
  )
}
