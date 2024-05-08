import { auth } from '@/auth'
import { getCity } from './adcode'

const URL = "https://restapi.amap.com/v3/weather/weatherInfo"
const key = process.env.GAODE_WEATHER_API_KEY

export async function POST(req: Request) {
    const json = await req.json()
    const { province, city, extensions } = json

    const user = (await auth())?.user
    if (!user) {
        return new Response('Unauthorized', {
            status: 401
        })
    }

    try {
        const res = await fetch(`${URL}?key=${key}&city=${getCity(province, city)}&extensions=${extensions}`, 
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            }
        )
        const data = await res.json()
        return Response.json({ data })
    } catch (error: any) {
        let errorMessage = error.message || error
        const errorCode = error.status || 500

        console.error(errorMessage)
        return new Response(errorMessage, {
            status: errorCode
        })
    }
}