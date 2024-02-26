import { cn } from "@/app/lib/utils"
import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose } from "@/app/ui/dialog"
import { LiveAudioVisualizer } from "./live-audio-visualizer"

interface VoiceDetectorProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean, result?: string) => void
}

export function VoiceDetector ({
  isOpen,
  onOpenChange
}: VoiceDetectorProps) {
  let chunks: Blob[] = [];
  
  const [result, setResult] = useState();
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder>();
  const [recordingBlob, setRecordingBlob] = useState<Blob>();

  useEffect(() => {
    if (
      recordingBlob != null &&
      recording == false
    ) {
      const fetchData = async () => {
        const response = await fetch("/api/whisper", {
          method: "POST",
          body: recordingBlob,
        });
        const data = await response.json();
        if (response.status !== 200) {
          throw data.error || new Error(`Request failed with status ${response.status}`);
        }
        setResult(data.result);
      }
      fetchData()
    }
  }, [recordingBlob]);


  // Function to start recording
  const startRecording = () => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        setRecording(true);
        const recorder: MediaRecorder = new MediaRecorder(
          stream
        );
        setMediaRecorder(recorder);
        recorder.start();
        // _startTimer();

        recorder.addEventListener("dataavailable", (event) => {
          setRecordingBlob(event.data);
          recorder.stream.getTracks().forEach((t) => t.stop());
          setMediaRecorder(undefined);
        });
      })
      .catch((err: DOMException) => {
        console.error(err.name, err.message, err.cause);
        alert(`Error accessing microphone: ${err.message}`)
      });

  };
  // Function to stop recording
  const stopRecording = async () => {
    mediaRecorder?.stop();
    setRecording(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(isOpen) => onOpenChange(isOpen, result)}>
      <DialogContent
        className={cn(
          "flex flex-col border-transparent bg-transparent outline-none"
        )}
      >
        <div className="mt-10 flex justify-center">
          <button 
            className=" Button rounded-md bg-blue-500 w-60 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-400"
            onClick={recording ? stopRecording : startRecording} >
            {recording ? 'Stop Recording' : 'Start Recording'}
          </button>
        </div>
        {mediaRecorder && <LiveAudioVisualizer mediaRecorder={mediaRecorder} width={400} height={75}/>}
        <DialogDescription>{result}</DialogDescription>
        <div className="flex justify-end">
          <DialogClose asChild>
            <button className="Button green">Save</button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  )
}
    