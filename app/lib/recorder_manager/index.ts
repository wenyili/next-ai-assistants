export class RecorderManager {
    private audioContext?: AudioContext;
    private audioNode?: AudioWorkletNode;
    private audioTracks?: MediaStreamTrack[];

    /**
     * 构造函数
     * @param processorPath processor的文件路径，如果processor.worker.js的访问地址为`/a/b/processor.worker.js`,则processorPath 为`/a/b`
     *
     */
    constructor(private processorPath: string) {}

    onStop?: () => void;

    onFrameRecorded?: (params: {
        isLastFrame: boolean;
        frameBuffer: ArrayBuffer;
    }) => void;
    /**
     * 监听录音开始事件
     */
    onStart?: () => void;

    async start({ sampleRate = 16000, frameSize = 1280, arrayBufferType, }: {
        sampleRate?: number;
        frameSize?: number;
        arrayBufferType?: "short16" | "float32";
    }) {
        const audioCtx = new(window.AudioContext)({
            sampleRate
        })
        await audioCtx.audioWorklet.addModule(`${this.processorPath}/processor.worklet.js`)
        this.audioContext = audioCtx;

        const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
              channelCount: 1,
              echoCancellation: true,
              autoGainControl: true,
              noiseSuppression: true,
            },
        })
        this.audioTracks = stream.getTracks();
        const sourceNode = this.audioContext.createMediaStreamSource(stream)
        const audioNode = new AudioWorkletNode(this.audioContext, "processor-worklet")
        this.audioNode = audioNode

        audioNode.port.postMessage({
            type: "init",
            data: {
                frameSize: frameSize,
                toSampleRate: sampleRate,
                fromSampleRate: sampleRate,
                arrayBufferType: arrayBufferType || "short16"
            }
        })

        audioNode.port.onmessage = async (ev: MessageEvent) => {
            const frameBuffer = ev.data.frameBuffer;
            const isLastFrame = ev.data.isLastFrame;
            if (frameSize && this.onFrameRecorded) {
                if (frameBuffer && frameBuffer.byteLength) {
                    for (let a = 0; a < frameBuffer.byteLength;) this.onFrameRecorded({
                        isLastFrame: isLastFrame && a + frameSize >= frameBuffer.byteLength,
                        frameBuffer: ev.data.frameBuffer.slice(a, a + frameSize)
                    }), a += frameSize;
                } else {
                    this.onFrameRecorded(ev.data);
                }
            }
            if (this.onStop && isLastFrame) {
                this.onStop()
            }
        }

        sourceNode.connect(audioNode)
        this.onStart && this.onStart()
    };

    stop() {
        if (this.audioNode) {
            this.audioNode.port.postMessage({
                type: "stop"
            })
        }
        if (this.audioTracks) {
            this.audioTracks[0].stop()
        }
        if (this.audioContext && this.audioContext.state === "running") {
            this.audioContext.close()
        }
    };
}

export { RecorderManager as default };
