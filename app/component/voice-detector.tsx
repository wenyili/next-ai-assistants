import { cn } from "@/app/lib/utils"
import { useEffect } from "react"
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose } from "@/app/ui/dialog"
import { useRecorder } from "../lib/useRecorder"
import { LiveAudioVisualizer } from "./live-audio-visualizer"
import { Button } from "../ui/button"

interface VoiceDetectorProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean, result?: string) => void
}

export function VoiceDetector ({
  isOpen,
  onOpenChange,
}: VoiceDetectorProps) {
  const { recording, startRecoding, stopRecording, showText, analyser } = useRecorder();
  
  useEffect(() => {
    startRecoding()
  }, []);

  // close Dialog when recoding is closing
  useEffect(() => {
    if (recording === "CLOSED" && showText) {
      stopRecording()
      onOpenChange(false, showText);
    }
  }, [recording]);

  return (
    <Dialog open={isOpen} onOpenChange={(isOpen) => {
        stopRecording()
        onOpenChange(isOpen, showText)}
      }>
      <DialogContent
        className={cn(
          "flex flex-col border-transparent outline-none"
        )}
      >
        <DialogTitle>Recording...</DialogTitle>
        {analyser && <LiveAudioVisualizer analyser={analyser} width={400} height={75}/>}
        <DialogDescription className="mt-2">{showText}</DialogDescription>
        <div className="flex gap-3 justify-end">
          <DialogClose asChild>
            <Button>Save</Button>
          </DialogClose>
          <Button onClick={() => {
            stopRecording()
            onOpenChange(false);
          }}>Cancel</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
    