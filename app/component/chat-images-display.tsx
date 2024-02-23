import Image from "next/image"
import { FC, useState } from "react"
import { ImagePreview } from "../ui/image-preview"
import { IconClose } from "../ui/icons"

interface ImagesDisplayProps {
    images: string[]
    setImages: React.Dispatch<React.SetStateAction<string[]>>;
}

export const ChatImagesDisplay: FC<ImagesDisplayProps> = ({images, setImages}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  return (
    <>
      {showPreview && selectedImage && (
        <ImagePreview
          url={selectedImage}
          isOpen={showPreview}
          onOpenChange={(isOpen: boolean) => {
            setShowPreview(isOpen)
            setSelectedImage(null)
          }}
        />
      )}

      <div className="space-y-2">
        <div className="overflow-auto">
          <div className="flex gap-2 overflow-auto pt-2">
            {images.map((image, index) => (
              <div
                key={index}
                className="relative flex h-[64px] cursor-pointer items-center space-x-4 rounded-xl hover:opacity-50"
              >
                <Image
                  className="rounded"
                  // Force the image to be 56px by 56px
                  style={{
                    minWidth: "56px",
                    minHeight: "56px",
                    maxHeight: "56px",
                    maxWidth: "56px"
                  }}
                  src={image} // Preview images will always be base64
                  alt="File image"
                  width={56}
                  height={56}
                  onClick={() => {
                    setSelectedImage(image)
                    setShowPreview(true)
                  }}
                />
                <IconClose
                  className="bg-muted-foreground border-primary absolute right-[-6px] top-[-2px] flex size-5 cursor-pointer items-center justify-center rounded-full border-[1px] text-[10px] hover:border-red-500 hover:bg-white hover:text-red-500"
                  onClick={e => {
                    e.stopPropagation()
                    setImages(
                      prevImages => prevImages.filter((image, i) => i !== index)
                    )
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}