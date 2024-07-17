import { useState } from "react";


function useImageUpload() {
  const [images, setImages] = useState<File[]>([]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setImages([...images, ...Array.from(event.target.files)]);
    }
  };

  return {
    images,
    handleImageUpload,
  };
}

export function ImageUpload() {
  const { images, handleImageUpload } = useImageUpload();

  return (
    <div className="flex flex-col items-center">
      <label
        htmlFor="image-upload"
        className="flex items-center justify-center w-32 h-32 border-2 border-dashed border-gray-400 rounded-lg cursor-pointer"
      >
        <span className="text-gray-500">Click to upload</span>
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
          <img
            key={image.name ?? index}
            src={URL.createObjectURL(image)}
            alt={`Upload Preview ${index}`}
            className="w-16 h-16 object-cover rounded"
          />
        ))}
      </div>
    </div>
  );
}