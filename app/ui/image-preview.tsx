import { cn } from "@/app/lib/utils"
import Image from "next/image"
import { FC } from "react"
import { Dialog, DialogContent } from "./dialog"

interface ImagePreviewProps {
  url: string
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

export const ImagePreview: FC<ImagePreviewProps> = ({
  url,
  isOpen,
  onOpenChange
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "flex items-center justify-center outline-none",
          "border-transparent bg-transparent"
        )}
      >
        <Image
          className="rounded"
          src={url}
          alt="File image"
          width={2000}
          height={2000}
          style={{
              maxHeight: "67vh",
              maxWidth: "67vw"
          }}
        />
      </DialogContent>
    </Dialog>
  )
}
