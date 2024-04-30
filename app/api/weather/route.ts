import { auth } from '@/auth'

const URL = "https://restapi.amap.com/v3/weather/weatherInfo"
const key = process.env.GAODE_WEATHER_API_KEY

export async function GET() {
    const user = (await auth())?.user
    if (!user) {
        return new Response('Unauthorized', {
        status: 401
        })
    }
}