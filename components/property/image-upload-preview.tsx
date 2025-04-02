'use client'

import { X } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

interface ImageUploadPreviewProps {
  images: string[]
  onRemove: (index: number) => void
}

export function ImageUploadPreview({ images, onRemove }: ImageUploadPreviewProps) {
  if (images.length === 0) {
    return (
      <div className="border-2 border-dashed rounded-lg p-12 text-center">
        <p className="text-muted-foreground">No images added yet</p>
        <p className="text-sm text-muted-foreground mt-2">
          Add image URLs to showcase your property
        </p>
      </div>
    )
  }

  return (
    <ScrollArea className="h-[400px] rounded-md border">
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {images.map((url, index) => (
          <div key={index} className="relative group rounded-lg overflow-hidden border">
            <div className="aspect-video relative">
              <Image
                src={url || "/placeholder.svg"}
                alt={`Property image ${index + 1}`}
                fill
                className="object-cover"
              />
            </div>
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => onRemove(index)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}
