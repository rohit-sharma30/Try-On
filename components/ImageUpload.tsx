import React, { useState, useEffect, useCallback } from 'react';
import { ImageUploadData } from '../types';
import { fileToBase64 } from '../utils/imageUtils';

interface ImageUploadProps {
  label: string;
  onImagesChange: (images: ImageUploadData[]) => void;
  maxFiles?: number; // Maximum number of files allowed, defaults to 1 for single upload
  minFiles?: number; // Minimum number of files required
  accept?: string; // e.g., "image/jpeg, image/png"
  initialImages?: ImageUploadData[];
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  label,
  onImagesChange,
  maxFiles = 1,
  minFiles = 0,
  accept = 'image/*',
  initialImages = [],
}) => {
  const [uploadedImages, setUploadedImages] = useState<ImageUploadData[]>(initialImages);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setUploadedImages(initialImages);
  }, [initialImages]);

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const files = Array.from(event.target.files || []);

    if (maxFiles > 1 && files.length + uploadedImages.length > maxFiles) {
      setError(`You can upload a maximum of ${maxFiles} images.`);
      event.target.value = ''; // Clear file input
      return;
    } else if (maxFiles === 1 && files.length > 1) {
      setError(`You can only upload one image.`);
      event.target.value = ''; // Clear file input
      return;
    }

    try {
      // Fix: Explicitly type 'file' to 'File' to resolve type inference issue.
      const newImagePromises = files.map(async (file: File) => {
        const base64 = await fileToBase64(file);
        return { file, base64 };
      });
      const newImages = await Promise.all(newImagePromises);

      const updatedImages = maxFiles === 1 ? newImages : [...uploadedImages, ...newImages];
      setUploadedImages(updatedImages);
      onImagesChange(updatedImages);
    } catch (err) {
      setError("Failed to process image(s). Please try again.");
      console.error("Image upload error:", err);
    } finally {
      event.target.value = ''; // Clear file input value to allow re-uploading the same file
    }
  }, [uploadedImages, maxFiles, onImagesChange]);

  const removeImage = useCallback((index: number) => {
    const updatedImages = uploadedImages.filter((_, i) => i !== index);
    setUploadedImages(updatedImages);
    onImagesChange(updatedImages);
    if (updatedImages.length < minFiles) {
      setError(`You must upload at least ${minFiles} image(s).`);
    } else {
      setError(null);
    }
  }, [uploadedImages, onImagesChange, minFiles]);

  return (
    <div className="mb-6 p-4 border border-gray-600 rounded-lg bg-gray-800 shadow-sm">
      <label className="block text-xl font-semibold text-gray-100 mb-4">{label}</label>
      <div className="flex flex-wrap gap-4 mb-4">
        {uploadedImages.map((img, index) => (
          <div key={index} className="relative w-32 h-32 md:w-48 md:h-48 rounded-lg overflow-hidden border border-gray-700 shadow-md">
            <img
              src={`data:${img.file.type};base64,${img.base64}`}
              alt={`Uploaded ${index + 1}`}
              className="w-full h-full object-cover"
            />
            <button
              onClick={() => removeImage(index)}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs leading-none"
              aria-label="Remove image"
            >
              &times;
            </button>
          </div>
        ))}
        {(maxFiles === 0 || uploadedImages.length < maxFiles) && (
          <div className="w-32 h-32 md:w-48 md:h-48 flex items-center justify-center border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 transition-colors duration-200">
            <label htmlFor={`file-upload-${label.replace(/\s/g, '-')}`} className="cursor-pointer text-blue-500 hover:text-blue-400 text-center p-2">
              <span className="block text-4xl mb-1">+</span>
              <span className="block text-sm">Upload Image</span>
              <input
                id={`file-upload-${label.replace(/\s/g, '-')}`}
                type="file"
                multiple={maxFiles > 1}
                accept={accept}
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>
        )}
      </div>
      {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
      {minFiles > 0 && uploadedImages.length < minFiles && (
        <p className="text-yellow-400 text-sm mt-2">
          Please upload at least {minFiles} image(s). Current: {uploadedImages.length}
        </p>
      )}
    </div>
  );
};

export default ImageUpload;