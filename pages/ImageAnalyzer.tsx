import React, { useState } from 'react';
import ImageUpload from '../components/ImageUpload';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import { ImageUploadData, ImagePart, ModelApiResponse } from '../types';
import { createImagePart } from '../utils/imageUtils';
import { analyzeImage } from '../services/geminiService';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const ImageAnalyzer: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<ImageUploadData[]>([]);
  const [prompt, setPrompt] = useState<string>('Describe this image in detail.');
  const [analysisResult, setAnalysisResult] = useState<ModelApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (images: ImageUploadData[]) => {
    setSelectedImage(images);
    setAnalysisResult(null); // Reset analysis on new upload
    setError(null);
  };

  const handleAnalyze = async () => {
    if (selectedImage.length === 0) {
      setError('Please upload an image to analyze.');
      return;
    }
    if (!prompt.trim()) {
      setError('Please enter an analysis prompt.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const imagePart: ImagePart = createImagePart(selectedImage[0].base64, selectedImage[0].file.type);
      const result = await analyzeImage(imagePart, prompt);
      setAnalysisResult(result);
    } catch (e: any) {
      setError(e.message || 'Failed to analyze image.');
    } finally {
      setIsLoading(false);
    }
  };

  const isReadyToAnalyze = selectedImage.length > 0 && prompt.trim() !== '' && !isLoading;

  return (
    <div className="container mx-auto p-4 md:p-8 bg-gray-800 rounded-xl shadow-lg mt-8 mb-8">
      <h2 className="text-3xl font-extrabold text-gray-100 mb-6 text-center">Image Analyzer</h2>
      <p className="text-gray-300 mb-8 text-center max-w-2xl mx-auto">
        Upload any photo and get detailed analysis and descriptions using <strong>Gemini 2.5 Flash</strong>.
        Ask about objects, scenes, or specific details within the image.
      </p>

      <div className="grid md:grid-cols-2 gap-8 items-start">
        {/* Input and Controls */}
        <div className="flex flex-col gap-6">
          <ImageUpload
            label="Upload Image to Analyze"
            onImagesChange={handleImageChange}
            maxFiles={1}
            minFiles={1}
            initialImages={selectedImage}
          />

          <div className="bg-gray-700 p-6 rounded-lg shadow-inner">
            <label htmlFor="analysis-prompt" className="block text-lg font-medium text-gray-100 mb-2">
              Analysis Prompt
            </label>
            <textarea
              id="analysis-prompt"
              className="w-full p-3 border border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-100 bg-gray-900"
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., What is happening in this picture? Describe the main subject."
              disabled={isLoading}
            ></textarea>
          </div>

          {error && (
            <div className="bg-red-900 border border-red-700 text-red-300 px-4 py-3 rounded-md relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <Button
            onClick={handleAnalyze}
            disabled={!isReadyToAnalyze}
            className="w-full py-3"
            size="lg"
          >
            {isLoading ? 'Analyzing...' : 'Analyze Image'}
          </Button>
        </div>

        {/* Output */}
        <div className="flex flex-col p-6 bg-gray-700 rounded-lg shadow-inner min-h-[300px]">
          <h3 className="text-xl font-semibold text-gray-100 mb-4">Analysis Result</h3>
          {isLoading ? (
            <LoadingSpinner message="Analyzing your image..." />
          ) : analysisResult?.text ? (
            <div className="prose max-w-none overflow-auto flex-grow text-gray-200">
              <Markdown remarkPlugins={[remarkGfm]}>{analysisResult.text}</Markdown>
            </div>
          ) : (
            <p className="text-gray-400 text-center flex-grow flex items-center justify-center">
              Upload an image and click "Analyze Image" to see the results here.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageAnalyzer;