import React, { useState } from 'react';
import { generateVideo } from '../services/geminiService';
import { AspectRatio, VideoResolution } from '../types';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import AspectRatioSelector from '../components/AspectRatioSelector';
import { getPlaceholderImageUrl } from '../utils/imageUtils'; // Using for video thumbnail placeholder

const VideoGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string>('');
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<AspectRatio>(AspectRatio.ASPECT_RATIO_16_9);
  const [selectedResolution, setSelectedResolution] = useState<VideoResolution>(VideoResolution.R720P);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt for video generation.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedVideoUrl(''); // Clear previous video

    try {
      const videoUrl = await generateVideo(prompt, selectedAspectRatio, selectedResolution);
      setGeneratedVideoUrl(videoUrl);
    } catch (e: any) {
      setError(e.message || 'Failed to generate video.');
    } finally {
      setIsLoading(false);
    }
  };

  const videoResolutions = [
    { label: '720p', value: VideoResolution.R720P },
    { label: '1080p', value: VideoResolution.R1080P },
  ];

  return (
    <div className="container mx-auto p-4 md:p-8 bg-gray-800 rounded-xl shadow-lg mt-8 mb-8">
      <h2 className="text-3xl font-extrabold text-gray-100 mb-6 text-center">Video Generator</h2>
      <p className="text-gray-300 mb-8 text-center max-w-2xl mx-auto">
        Create captivating videos from text prompts using <strong>Veo 3.1 Fast Generate Preview</strong>.
        Select your desired aspect ratio and resolution, then describe your scene.
        Video generation can take a few minutes.
      </p>

      <div className="grid md:grid-cols-2 gap-8 items-start">
        {/* Input and Controls */}
        <div className="flex flex-col gap-6">
          <div className="bg-gray-700 p-6 rounded-lg shadow-inner">
            <label htmlFor="video-prompt" className="block text-lg font-medium text-gray-100 mb-2">
              Video Prompt
            </label>
            <textarea
              id="video-prompt"
              className="w-full p-3 border border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-100 bg-gray-900"
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., A futuristic car driving through a neon-lit city at night, rain on the windshield"
              disabled={isLoading}
            ></textarea>
          </div>

          <AspectRatioSelector
            selectedRatio={selectedAspectRatio}
            onSelectRatio={setSelectedAspectRatio}
            label="Video Aspect Ratio"
            excludeRatios={[AspectRatio.ASPECT_RATIO_1_1, AspectRatio.ASPECT_RATIO_3_4, AspectRatio.ASPECT_RATIO_4_3]} // Veo only supports 16:9 and 9:16 for prompt-based
          />

          <div className="mb-6 p-4 border border-gray-600 rounded-lg bg-gray-800 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-100 mb-4">Video Resolution</h3>
            <div className="grid grid-cols-2 gap-4">
              {videoResolutions.map((res) => (
                <button
                  key={res.value}
                  onClick={() => setSelectedResolution(res.value)}
                  className={`
                    p-3 rounded-lg border-2 text-sm font-medium transition-colors duration-200
                    ${selectedResolution === res.value
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                      : 'bg-gray-700 text-gray-200 border-gray-600 hover:bg-gray-600'}
                  `}
                >
                  {res.label}
                </button>
              ))}
            </div>
          </div>


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
            {isLoading ? 'Generating Video...' : 'Generate Video'}
          </Button>
          {isLoading && (
            <p className="text-center text-blue-400 text-sm mt-2">
              Video generation can take a few minutes. Please be patient.
              A link to the billing documentation (ai.google.dev/gemini-api/docs/billing) must be provided in the dialog.
            </p>
          )}
        </div>

        {/* Output */}
        <div className="flex flex-col items-center justify-center p-6 bg-gray-700 rounded-lg shadow-inner min-h-[300px]">
          <h3 className="text-xl font-semibold text-gray-100 mb-4">Generated Video</h3>
          {isLoading ? (
            <LoadingSpinner message="Your video is being created..." />
          ) : generatedVideoUrl ? (
            <div className="relative w-full h-auto max-w-[500px] border border-gray-700 rounded-lg overflow-hidden shadow-md bg-black">
              <video controls src={generatedVideoUrl} className="w-full h-full object-contain"></video>
              <p className="absolute bottom-2 left-2 right-2 text-white text-xs bg-black bg-opacity-50 p-1 rounded-sm">
                Aspect Ratio: {selectedAspectRatio}, Resolution: {selectedResolution}
              </p>
            </div>
          ) : (
            <div className="relative w-full h-auto max-w-[500px] border border-gray-700 rounded-lg overflow-hidden shadow-md bg-gray-700 flex items-center justify-center min-h-[250px]">
              <img
                src={getPlaceholderImageUrl(500, 300)} // Placeholder for video, adjust aspect ratio as needed
                alt="Video Placeholder"
                className="w-full h-full object-cover opacity-50"
              />
              <p className="absolute text-gray-400 text-center font-medium">No video generated yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoGenerator;