import {
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button";

export function ImageUpload({ images, handleImageUpload, handleRemoveImage }: { images: File[], handleImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void, handleRemoveImage: (index: number) => void }) {
  return (
    <div className="flex flex-col items-center">
      <label
        htmlFor="image-upload"
        className="flex items-center justify-center w-32 h-32 border-2 border-dashed border-gray-400 rounded-lg cursor-pointer"
      >
        <span className="text-gray-500">add foto</span>
        <input
          id="image-upload"
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleImageUpload}
        />
      </label>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {images.map((image, index) => (
          <div key={image.name ?? index} className="relative w-16 h-16">
            <img
              src={URL.createObjectURL(image)}
              alt={`Upload Preview ${index}`}
              className="w-full h-full object-cover rounded"
            />
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => handleRemoveImage(index)}
              className="absolute -top-2 -right-2 bg-red-300 rounded-full p-0 h-4 w-4 flex items-center justify-center"
            >
              <X size={12} />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}