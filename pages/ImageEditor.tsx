import React, { useState } from 'react';
import ImageUpload from '../components/ImageUpload';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import { ImageUploadData, ImagePart } from '../types';
import { createImagePart, getPlaceholderImageUrl } from '../utils/imageUtils';
import { editImage } from '../services/geminiService';

const ImageEditor: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<ImageUploadData[]>([]);
  const [prompt, setPrompt] = useState<string>('');
  const [editedImageUrl, setEditedImageUrl] = useState<string>(getPlaceholderImageUrl(512, 512));
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (images: ImageUploadData[]) => {
    setSelectedImage(images);
    setEditedImageUrl(getPlaceholderImageUrl(512, 512)); // Reset edited image on new upload
    setError(null);
  };

  const handleEdit = async () => {
    if (selectedImage.length === 0) {
      setError('Please upload an image to edit.');
      return;
    }
    if (!prompt.trim()) {
      setError('Please enter a prompt for editing.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setEditedImageUrl(getPlaceholderImageUrl(512, 512)); // Reset to placeholder

    try {
      const baseImagePart: ImagePart = createImagePart(selectedImage[0].base64, selectedImage[0].file.type);
      const imageUrl = await editImage(baseImagePart, prompt);
      setEditedImageUrl(imageUrl);
    } catch (e: any) {
      setError(e.message || 'Failed to edit image.');
      setEditedImageUrl(getPlaceholderImageUrl(512, 512));
    } finally {
      setIsLoading(false);
    }
  };

  const isReadyToEdit = selectedImage.length > 0 && prompt.trim() !== '' && !isLoading;

  return (
    <div className="container mx-auto p-4 md:p-8 bg-gray-800 rounded-xl shadow-lg mt-8 mb-8">
      <h2 className="text-3xl font-extrabold text-gray-100 mb-6 text-center">Image Editor</h2>
      <p className="text-gray-300 mb-8 text-center max-w-2xl mx-auto">
        Upload an image and use text prompts to modify it using <strong>Gemini 2.5 Flash Image</strong>.
        Try "Add a retro filter" or "Remove the person in the background".
      </p>

      <div className="grid md:grid-cols-2 gap-8 items-start">
        {/* Input and Controls */}
        <div className="flex flex-col gap-6">
          <ImageUpload
            label="Upload Image to Edit"
            onImagesChange={handleImageChange}
            maxFiles={1}
            minFiles={1}
            initialImages={selectedImage}
          />

          <div className="bg-gray-700 p-6 rounded-lg shadow-inner">
            <label htmlFor="edit-prompt" className="block text-lg font-medium text-gray-100 mb-2">
              Editing Prompt
            </label>
            <textarea
              id="edit-prompt"
              className="w-full p-3 border border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-100 bg-gray-900"
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., Make the sky blue and add a dog in the foreground"
              disabled={isLoading}
            ></textarea>
          </div>

          {error && (
            <div className="bg-red-900 border border-red-700 text-red-300 px-4 py-3 rounded-md relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <Button
            onClick={handleEdit}
            disabled={!isReadyToEdit}
            className="w-full py-3"
            size="lg"
          >
            {isLoading ? 'Editing...' : 'Edit Image'}
          </Button>
        </div>

        {/* Output */}
        <div className="flex flex-col items-center justify-center p-6 bg-gray-700 rounded-lg shadow-inner min-h-[300px]">
          <h3 className="text-xl font-semibold text-gray-100 mb-4">Edited Image</h3>
          {isLoading ? (
            <LoadingSpinner message="Applying edits..." />
          ) : (
            <div className="relative w-full h-auto max-w-[500px] border border-gray-700 rounded-lg overflow-hidden shadow-md">
              <img
                src={editedImageUrl}
                alt="Edited result"
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.onerror = null; // prevents infinite loop
                  e.currentTarget.src = getPlaceholderImageUrl(512, 512);
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;