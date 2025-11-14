import React, { useState } from 'react';
import { generateImage } from '../services/geminiService';
import { AspectRatio } from '../types';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import AspectRatioSelector from '../components/AspectRatioSelector';
import { getPlaceholderImageUrl } from '../utils/imageUtils';

const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string>(getPlaceholderImageUrl(512, 512));
  const [selectedRatio, setSelectedRatio] = useState<AspectRatio>(AspectRatio.ASPECT_RATIO_1_1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt for image generation.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImageUrl(getPlaceholderImageUrl(512, 512)); // Reset to placeholder

    try {
      const imageUrl = await generateImage(prompt, selectedRatio);
      setGeneratedImageUrl(imageUrl);
    } catch (e: any) {
      setError(e.message || 'Failed to generate image.');
      setGeneratedImageUrl(getPlaceholderImageUrl(512, 512));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8 bg-gray-800 rounded-xl shadow-lg mt-8 mb-8">
      <h2 className="text-3xl font-extrabold text-gray-100 mb-6 text-center">Image Generator</h2>
      <p className="text-gray-300 mb-8 text-center max-w-2xl mx-auto">
        Create stunning images from text prompts using the <strong>Imagen 4.0</strong> model. Describe your vision, select an aspect ratio, and watch it come to life!
      </p>

      <div className="grid md:grid-cols-2 gap-8 items-start">
        {/* Input and Controls */}
        <div className="flex flex-col gap-6">
          <div className="bg-gray-700 p-6 rounded-lg shadow-inner">
            <label htmlFor="image-prompt" className="block text-lg font-medium text-gray-100 mb-2">
              Image Prompt
            </label>
            <textarea
              id="image-prompt"
              className="w-full p-3 border border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-100 bg-gray-900"
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., A futuristic cityscape at sunset with flying cars and neon signs, digital art"
              disabled={isLoading}
            ></textarea>
          </div>

          <AspectRatioSelector
            selectedRatio={selectedRatio}
            onSelectRatio={setSelectedRatio}
            label="Image Aspect Ratio"
          />

          {error && (
            <div className="bg-red-900 border border-red-700 text-red-300 px-4 py-3 rounded-md relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <Button
            onClick={handleGenerate}
            disabled={isLoading || !prompt.trim()}
            className="w-full py-3"
            size="lg"
          >
            {isLoading ? 'Generating...' : 'Generate Image'}
          </Button>
        </div>

        {/* Output */}
        <div className="flex flex-col items-center justify-center p-6 bg-gray-700 rounded-lg shadow-inner min-h-[300px]">
          <h3 className="text-xl font-semibold text-gray-100 mb-4">Generated Image</h3>
          {isLoading ? (
            <LoadingSpinner message="Generating your image..." />
          ) : (
            <div className="relative w-full h-auto max-w-[500px] border border-gray-700 rounded-lg overflow-hidden shadow-md">
              <img
                src={generatedImageUrl}
                alt="Generated result"
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.onerror = null; // prevents infinite loop
                  e.currentTarget.src = getPlaceholderImageUrl(512, 512);
                }}
              />
              <p className="absolute bottom-2 left-2 right-2 text-white text-xs bg-black bg-opacity-50 p-1 rounded-sm">
                Aspect Ratio: {selectedRatio}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageGenerator;