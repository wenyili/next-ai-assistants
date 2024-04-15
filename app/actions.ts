'use server'

import { revalidatePath } from 'next/cache'
import { type Chat } from '@/app/lib/types'
import { auth } from '@/auth'
import { unstable_noStore as noStore } from 'next/cache';
import OSS from 'ali-oss';

// 初始化OSS客户端。请将以下参数替换为您自己的配置信息。
const client = new OSS({
  region: 'oss-cn-hangzhou', // 示例：'oss-cn-hangzhou'，填写Bucket所在地域。
  accessKeyId: process.env.OSS_ACCESS_KEY_ID!, // 确保已设置环境变量OSS_ACCESS_KEY_ID。
  accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET!, // 确保已设置环境变量OSS_ACCESS_KEY_SECRET。
  bucket: 'chats-storage', // 示例：'my-bucket-name'，填写存储空间名称。
});

async function getIndex(userId: string) {
    const result = await client.get(`${userId}/index.json`);
    return JSON.parse(result.content)
}

async function saveIndex(chats: Omit<Chat, 'messages'>[], userId: string) {
    await client.put(`${userId}/index.json`, Buffer.from(JSON.stringify(chats)));
}

export async function getChats() {
    noStore()
    const session = await auth() 
    const userId = session?.user?.name

    if (!userId) {
        throw new Error('User not found')
    }
    
    const chats =  await getIndex(userId)
    return chats
}

export async function getChat(id: string) {
    console.log(`get chat: ${id}`)
    const session = await auth() 
    const userId = session?.user?.name

    if (!userId) {
        throw new Error('User not found')
    }
    const result = await client.get(`${userId}/${id}.json`);
    return JSON.parse(result.content)
}

export async function removeChat(id:string) {
    const session = await auth() 
    const userId = session?.user?.name

    if (!userId) {
        throw new Error('User not found')
    }

    await client.delete(`${userId}/${id}.json`);

    // update index
    const chats: Omit<Chat, 'meesages'>[] = await getIndex(userId)
    // fileter chats
    const filteredChats = chats.filter(chat => chat.id !== id)
    await saveIndex(filteredChats, userId)
}

export async function saveChat(chat: Omit<Chat, "userId">) {
    const session = await auth() 
    const userId = session?.user?.name

    if (!userId) {
        throw new Error('User not found')
    }

    await client.put(`${userId}/${chat.id}.json`, Buffer.from(JSON.stringify({...chat, userId})));

    // update index
    const chats: Omit<Chat, 'meesages'>[] = await getIndex(userId)
    // if chat not exist in chats
    if (!chats.find(item => item.id === chat.id)) {
        chats.push({
            id: chat.id, 
            title: chat.title,
            createdAt: chat.createdAt,
            path: chat.path,
            userId
        })
        await saveIndex(chats, userId)
    }
}

export async function EditName(id: string, newTitle: string) {
    const session = await auth() 
    const userId = session?.user?.name

    if (!userId) {
        throw new Error('User not found')
    }
    // update index
    const chats: Omit<Chat, 'meesages'>[] = await getIndex(userId)
    // find chat according to id, and change its title to newTitle
    const chat = chats.find(item => item.id === id)
    if (!chat) {
        throw new Error(`Chat ${id} not found`)
    }
    chat.title = newTitle
    await saveIndex(chats, userId)
}

export async function getSharedChat(id: string) {
  return null
}

export async function shareChat(chat: Omit<Chat, 'message'>) {
    return chat
}
