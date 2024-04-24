import { auth } from '@/auth'
import OSS from 'ali-oss';

// 初始化OSS客户端。请将以下参数替换为您自己的配置信息。
const client = new OSS({
  region: process.env.OSS_REGION, // 示例：'oss-cn-hangzhou'，填写Bucket所在地域。
  accessKeyId: process.env.OSS_ACCESS_KEY_ID!, // 确保已设置环境变量OSS_ACCESS_KEY_ID。
  accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET!, // 确保已设置环境变量OSS_ACCESS_KEY_SECRET。
  bucket: process.env.OSS_BUCKET, // 示例：'my-bucket-name'，填写存储空间名称。
});

export async function GET() {
  const user = (await auth())?.user
  if (!user) {
    return new Response('Unauthorized', {
      status: 401
    })
  }
  try {
    const result = await client.get(`${user.name}/index.json`);
    return new Response(result.content)
  } catch (error:any) {
    console.error('Error:', error);
    return new Response(error, {
      status: 500
    })
  }
}