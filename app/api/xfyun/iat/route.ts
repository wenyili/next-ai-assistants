import CryptoJS from 'crypto-js';
import { NextResponse } from "next/server";

// 请求地址根据语种不同变化
const host = process.env.XFYUN_IAT_HOST;
const url = process.env.XFYUN_IAT_URL;
// const appId = process.env.XFYUN_APPID!;
const apiKey = process.env.XFYUN_IAT_API_KEY!;
const apiSecret = process.env.XFYUN_IAT_SECRET_KEY!;

export async function POST(req: Request) {
    var date = new Date().toUTCString();
    var algorithm = "hmac-sha256";
    var headers = "host date request-line";
    var signatureOrigin = `host: ${host}\ndate: ${date}\nGET /v2/iat HTTP/1.1`;
    var signatureSha = CryptoJS.HmacSHA256(signatureOrigin, apiSecret);
    var signature = CryptoJS.enc.Base64.stringify(signatureSha);
    var authorizationOrigin = `api_key="${apiKey}", algorithm="${algorithm}", headers="${headers}", signature="${signature}"`;
    var authorization = btoa(authorizationOrigin);
    const result = `${url}?authorization=${authorization}&date=${date}&host=${host}`;
    return NextResponse.json({result}, {status:200});
}