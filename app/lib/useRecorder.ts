import { useRef, useState } from "react";
import RecorderManager from './recorder_manager';

const getWebSocketUrl = async (recorderType="iat") => {
    const response = await fetch(`/api/xfyun/${recorderType}`, {
        method: "POST",
    });
    const data = await response.json();
    if (response.status !== 200) {
        alert(data.error)
        return
    }
    return data.result;
}

function toBase64(buffer: ArrayBuffer) {
    var binary = "";
    var bytes = new Uint8Array(buffer);
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

export function useRecorder() {
    const [recording, setRecording] = useState<"CONNECTING" | "STARTING" | "RECORDING" | "CLOSING" | "CLOSED">("CLOSED")
    const [showText, setShowText] = useState<string>('')
    const ws = useRef<WebSocket | undefined>()
    const resultText = useRef<string>('')
    const recorder = useRef<RecorderManager>()
    const recorderType = useRef<string>("iat")
    const [analyser, setAnalyser] = useState<AnalyserNode>()

    if (!recorder.current) {
        recorder.current = new RecorderManager('./recorder');
        recorder.current.onStart = () => {
            console.debug("recording...")
            setRecording("RECORDING")
            setAnalyser(recorder.current?.getAnalyser())
        }
        recorder.current.onStop = () => {
            console.debug("...stop recording");
            ws.current?.close();
        }
        recorder.current.onFrameRecorded = ({ isLastFrame, frameBuffer }) => {
            sendData(isLastFrame, frameBuffer);
        };
    }

    const sendData = (isLastFrame: boolean, frameBuffer: ArrayBuffer) => {
        if (ws.current === undefined) return;
        const _ws = ws.current
        if (_ws.readyState === _ws.OPEN) {
            if (recorderType.current === "iat") {
                _ws.send(
                    JSON.stringify({
                        data: {
                            status: isLastFrame ? 2 : 1,
                            format: "audio/L16;rate=16000",
                            encoding: "raw",
                            audio: toBase64(frameBuffer),
                        },
                    })
                );
            } else {
                _ws.send(new Int8Array(frameBuffer));
            }
            if (isLastFrame) {
                setRecording("CLOSING")
                if (recorderType.current === "iat") {
                    _ws.send('{"end": true}');
                }
            }
        }
    }

    const renderIatResult = (resultData: string) => {
        // 识别结束
        let jsonData = JSON.parse(resultData);
        if (jsonData.data && jsonData.data.result) {
            let data = jsonData.data.result;
            let str = "";
            let ws = data.ws;
            for (let i = 0; i < ws.length; i++) {
                str = str + ws[i].cw[0].w;
            }
            resultText.current += str;
            setShowText(resultText.current);
        }
        if (jsonData.code === 0 && jsonData.data.status === 2) {
            console.debug("end...ws close")
            recorder.current?.stop();
            // ws.current?.close();
        }
        if (jsonData.code !== 0) {
            recorder.current?.stop();
            // ws.current?.close();
            alert(jsonData)
            console.error(jsonData);
        }
    }

    const renderRlasrResult = (resultData: string) => {
        const jsonData = JSON.parse(resultData);
        if (jsonData.action == "started") {
            console.debug("handshake complete");
        } else if (jsonData.action == "result") {
            const data = JSON.parse(jsonData.data)
            let resultTextTemp = ""
            data.cn.st.rt.forEach((j:any) => {
                j.ws.forEach((k:any) => {
                    k.cw.forEach((l:any) => {
                        resultTextTemp += l.w;
                    });
                });
            });

            setShowText(resultText.current + resultTextTemp);
            if (data.cn.st.type == 0) {
                resultText.current += resultTextTemp;
            }

        } else if (jsonData.action == "error") {
            console.debug("error:", jsonData);
        }
    }

    const startRecoding = async () => {
        resultText.current = ""
        setShowText("")
        recorderType.current = localStorage.getItem("recorderType") || "iat"
        console.debug("recorder type:", recorderType.current)

        const websocketUrl = await getWebSocketUrl(recorderType.current)
        if (!websocketUrl) return

        let _ws: WebSocket;
        if ("WebSocket" in window) {
            _ws = new WebSocket(websocketUrl);
            ws.current = _ws;
        } else {
            alert("浏览器不支持WebSocket");
            return; 
        }
        setRecording("CONNECTING")

        _ws.onopen = (e: Event) => {
            console.debug("websocket open")
            setRecording("STARTING")
            recorder.current?.start({
                sampleRate: 16000,
                frameSize: 1280,
            });
            if (recorderType.current === 'iat') {
                const params = {
                    common: {
                        app_id: "338be912",
                    },
                    business: {
                        language: "zh_cn",
                        domain: "iat",
                        accent: "mandarin",
                        vad_eos: 2000,
                        dwa: "wpgs",
                    },
                    data: {
                        status: 0,
                        format: "audio/L16;rate=16000",
                        encoding: "raw",
                    },
                };
                _ws.send(JSON.stringify(params));
            }
        };
        _ws.onmessage = (e: MessageEvent) => {
            if (recorderType.current === 'iat') {
                renderIatResult(e.data);
            } else {
                renderRlasrResult(e.data);
            }
        };
        _ws.onerror = (e: Event) => {
            console.debug("websocket error")
            setRecording("CLOSED")
            recorder.current?.stop();
        };
        _ws.onclose = (e: CloseEvent) => {
            console.debug("websocket close")
            setRecording("CLOSED")
        };
    }

    const stopRecording = () => {
        recorder.current?.stop();
    }

    return {recording, startRecoding, stopRecording, showText, analyser}
}