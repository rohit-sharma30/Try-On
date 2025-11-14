import React, { useState, useEffect, useCallback } from 'react';
import Button from '../../components/Button';
import AspectRatioSelector from '../../components/AspectRatioSelector';
import LoadingSpinner from '../../components/LoadingSpinner';
import { ImageUploadData, AspectRatio, ImagePart, ModelApiResponse } from '../../types';
import { createImagePart } from '../../utils/imageUtils';
import { analyzeImage, generateOutfitTryOn } from '../../services/geminiService';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface TryOnConfigProps {
  onNext: (imageUrl: string, prompt: string, ratio: AspectRatio) => void;
  onBack: () => void;
  referenceImages: ImageUploadData[];
  modelImage: ImageUploadData[];
  initialUserPrompt?: string;
  initialSelectedRatio?: AspectRatio;
}

const TryOnConfig: React.FC<TryOnConfigProps> = ({
  onNext,
  onBack,
  referenceImages,
  modelImage,
  initialUserPrompt,
  initialSelectedRatio,
}) => {
  const [outfitAnalysis, setOutfitAnalysis] = useState<string | null>(null); // Renamed state to reflect editability
  const [userPrompt, setUserPrompt] = useState<string>(initialUserPrompt || '');
  // AspectRatioSelector removed from UI as gemini-2.5-flash-image does not support it in config
  // However, `initialSelectedRatio` is still passed down and can be used for logging or future model iterations.
  const [selectedRatio, setSelectedRatio] = useState<AspectRatio>(initialSelectedRatio || AspectRatio.ASPECT_RATIO_1_1);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState<boolean>(false);
  const [isLoadingGeneration, setIsLoadingGeneration] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const performAnalysis = useCallback(async () => {
    if (modelImage.length === 0) return;

    setIsLoadingAnalysis(true);
    setError(null);
    setOutfitAnalysis(null); // Clear previous analysis

    try {
      const modelImgPart: ImagePart = createImagePart(modelImage[0].base64, modelImage[0].file.type);
      const analysisPrompt = `Analyze this image in detail and describe the outfit (style, color, fit, length, material), the model's pose, the overall style, and any visible body parts. Be concise but thorough. Ignore any buttons or anything else found in the image, focus ONLY on the outfit, look, and pose of the model.`;
      const result: ModelApiResponse = await analyzeImage(modelImgPart, analysisPrompt);
      setOutfitAnalysis(result.text); // Update editable state
    } catch (e: any) {
      setError(`Failed to analyze model image: ${e.message}`);
    } finally {
      setIsLoadingAnalysis(false);
    }
  }, [modelImage]);

  useEffect(() => {
    // Only perform analysis if modelImage changes or if analysis hasn't been done yet
    if (modelImage.length > 0 && !outfitAnalysis) {
      performAnalysis();
    }
  }, [performAnalysis, modelImage, outfitAnalysis]); // Added outfitAnalysis to dependency array

  useEffect(() => {
    // Update user prompt if initialUserPrompt changes (e.g., when returning from result page)
    if (initialUserPrompt !== undefined && initialUserPrompt !== userPrompt) {
      setUserPrompt(initialUserPrompt);
    }
  }, [initialUserPrompt, userPrompt]);

  useEffect(() => {
    // Update selected ratio if initialSelectedRatio changes (though not used in API, keep state consistent)
    if (initialSelectedRatio !== undefined && initialSelectedRatio !== selectedRatio) {
      setSelectedRatio(initialSelectedRatio);
    }
  }, [initialSelectedRatio, selectedRatio]);


  const handleGenerateTryOn = async () => {
    if (referenceImages.length === 0 || modelImage.length === 0 || !outfitAnalysis) {
      setError('Missing necessary images or analysis for generation.');
      return;
    }

    setIsLoadingGeneration(true);
    setError(null);

    try {
      const userRefImageParts: ImagePart[] = referenceImages.map(img => createImagePart(img.base64, img.file.type));
      const modelOutfitImagePart: ImagePart = createImagePart(modelImage[0].base64, modelImage[0].file.type);

      // Construct combined prompt using the potentially user-edited outfitAnalysis
      const combinedPromptForGeneration = `Based on the following user description and outfit details, generate an image of the user wearing the described outfit in a realistic setting.
User Features: [Detailed description of user features derived from reference images, processed internally by generateOutfitTryOn]
Outfit and Pose Details from Model (potentially refined by user): ${outfitAnalysis}
Additional user modifications/preferences: ${userPrompt}
Critically, maintain the user's exact facial and body features as closely as possible from the provided reference image. Focus on seamless integration of the outfit onto the user's body while preserving their identity.`;

      const generatedImageUrl = await generateOutfitTryOn(
        userRefImageParts,
        modelOutfitImagePart,
        combinedPromptForGeneration, // Pass the combined prompt including user-edited analysis
      );
      onNext(generatedImageUrl, userPrompt, selectedRatio); // Pass prompt and ratio back to parent
    } catch (e: any) {
      setError(`Failed to generate try-on image: ${e.message}`);
    } finally {
      setIsLoadingGeneration(false);
    }
  };

  const isReadyToGenerate = !isLoadingAnalysis && outfitAnalysis && !isLoadingGeneration && referenceImages.length > 0 && modelImage.length > 0;

  return (
    <div className="p-4 md:p-8 bg-gray-800 rounded-xl shadow-lg">
      <h2 className="text-2xl md:text-3xl font-extrabold text-gray-100 mb-6 text-center">Step 3: Analyze & Configure Try-On</h2>
      <p className="text-gray-300 mb-8 text-center max-w-2xl mx-auto">
        Review and refine the AI's analysis of your chosen outfit, then specify any additional modifications or preferences for the generated image.
        Remember, the app will strive to maintain your exact facial and body features.
      </p>

      <div className="grid md:grid-cols-2 gap-8 items-start mb-8">
        {/* Model Image and Analysis */}
        <div className="flex flex-col gap-4 bg-gray-700 p-6 rounded-lg shadow-inner">
          <h3 className="text-xl font-semibold text-gray-100 mb-2">Outfit Image Analysis (Editable)</h3>
          {modelImage.length > 0 && (
            <div className="w-full max-w-sm mx-auto rounded-lg overflow-hidden border border-gray-700 shadow-md mb-4">
              <img
                src={`data:${modelImage[0].file.type};base64,${modelImage[0].base64}`}
                alt="Model Outfit"
                className="w-full h-auto object-contain"
              />
            </div>
          )}
          {isLoadingAnalysis ? (
            <LoadingSpinner message="Analyzing outfit details..." />
          ) : (
            <textarea
              id="outfit-analysis"
              className="w-full p-3 border border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-100 bg-gray-900"
              rows={6}
              value={outfitAnalysis || ''}
              onChange={(e) => setOutfitAnalysis(e.target.value)}
              placeholder="AI analysis of the outfit will appear here, and you can edit it to refine the generation."
              disabled={isLoadingAnalysis || isLoadingGeneration}
            ></textarea>
          )}
        </div>

        {/* Configuration */}
        <div className="flex flex-col gap-6">
          <div className="bg-gray-700 p-6 rounded-lg shadow-inner">
            <label htmlFor="user-prompt" className="block text-lg font-medium text-gray-100 mb-2">
              Additional Modifications / Preferences (Optional)
            </label>
            <textarea
              id="user-prompt"
              className="w-full p-3 border border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-100 bg-gray-900"
              rows={4}
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              placeholder="e.g., Change the environment to a beach, modify the pose to a relaxed standing, make the style more casual."
              disabled={isLoadingGeneration}
            ></textarea>
            <p className="text-sm text-gray-400 mt-2">
              You can modify environment, pose, or style. Your facial and body features will be preserved.
            </p>
          </div>

          {/* AspectRatioSelector removed as gemini-2.5-flash-image does not support this config */}
          <p className="text-gray-400 text-sm italic">
            Note: Aspect ratio selection is not actively applied by the current outfit try-on model for editing, as it focuses on seamless outfit integration onto a given reference. This will be considered in future model iterations for finer control.
          </p>

          {error && (
            <div className="bg-red-900 border border-red-700 text-red-300 px-4 py-3 rounded-md relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <Button onClick={onBack} variant="secondary" size="lg" disabled={isLoadingGeneration}>
          Back
        </Button>
        <Button onClick={handleGenerateTryOn} disabled={!isReadyToGenerate} size="lg">
          {isLoadingGeneration ? 'Generating Try-On...' : 'Generate Try-On Image'}
        </Button>
      </div>
    </div>
  );
};

export default TryOnConfig;