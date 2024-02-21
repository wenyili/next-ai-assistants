import { nanoid } from '@/app/lib/utils'
import { GenImage } from '@/app/component/gen-image'
import { Message } from '@/app/lib/chat/type'

export default function GenImagePage() {
  const id = nanoid()

  const messages: Message[] = [
//     {
//       "id": "1",
//       "role": "user",
//       "content": `\`\`\` js
// /* eslint no-confusing-arrow: 0 */
// instance.interceptors.response.use(
//   res => errCodeHandle(res.data.errCode, res.data),
//   // return res.data;
//   error => {
//     const { response } = error
//     if (response) {
//       // 当请求状态不是200时
//       resError(response.status)
//     }

//     return Promise.reject(response)
//   }
// )
// \`\`\`
// 解释\`Promise\``
//     },
    // {
    //   "id": "2",
    //   "role": "user",
    //   "content": "![cat](https://t1.gstatic.com/licensed-image?q=tbn:ANd9GcRRv9ICxXjK-LVFv-lKRId6gB45BFoNCLsZ4dk7bZpYGblPLPG-9aYss0Z0wt2PmWDb)"
    // }
  ]

  // const messages: Message[] = []

  return (
    <GenImage id={id} initialMessages={messages}/>
  )
}
