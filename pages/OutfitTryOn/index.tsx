
import React, { useState } from 'react';
import RefImageUpload from './RefImageUpload';
import ModelImageUpload from './ModelImageUpload';
import TryOnConfig from './TryOnConfig';
// Fix: Changed import from default to named as per the error message.
import { TryOnResult } from './TryOnResult'; 
// Fix: Added AspectRatio import as it's now used in state and passed to child components.
import { ImageUploadData, AspectRatio } from '../../types';

type TryOnStep = 'uploadRefs' | 'uploadModel' | 'configure' | 'result';

const OutfitTryOn: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<TryOnStep>('uploadRefs');
  const [referenceImages, setReferenceImages] = useState<ImageUploadData[]>([]);
  const [modelImage, setModelImage] = useState<ImageUploadData[]>([]);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  // Fix: Added state to persist the last user prompt for re-generation.
  const [lastUserPrompt, setLastUserPrompt] = useState<string>('');
  // Fix: Added state to persist the last selected aspect ratio for re-generation.
  const [lastSelectedRatio, setLastSelectedRatio] = useState<AspectRatio>(AspectRatio.ASPECT_RATIO_1_1);

  const handleRefImagesChange = (images: ImageUploadData[]) => {
    setReferenceImages(images);
  };

  const handleModelImageChange = (images: ImageUploadData[]) => {
    setModelImage(images);
  };

  const handleNextStep = () => {
    if (currentStep === 'uploadRefs') setCurrentStep('uploadModel');
    else if (currentStep === 'uploadModel') setCurrentStep('configure');
  };

  const handleBackStep = () => {
    if (currentStep === 'uploadModel') setCurrentStep('uploadRefs');
    else if (currentStep === 'configure') setCurrentStep('uploadModel');
  };

  // Fix: Updated signature to accept prompt and ratio, and save them to state.
  const handleGenerationComplete = (imageUrl: string, prompt: string, ratio: AspectRatio) => {
    setGeneratedImageUrl(imageUrl);
    setLastUserPrompt(prompt); // Save the prompt
    setLastSelectedRatio(ratio); // Save the ratio
    setCurrentStep('result');
  };

  const handleReset = () => {
    setCurrentStep('uploadRefs');
    setReferenceImages([]);
    setModelImage([]);
    setGeneratedImageUrl(null);
    // Fix: Clear last prompt and reset ratio on full reset.
    setLastUserPrompt('');
    setLastSelectedRatio(AspectRatio.ASPECT_RATIO_1_1);
  };

  // Fix: New handler to return to the configuration step for re-generation.
  const handleGenerateAgain = () => {
    setCurrentStep('configure');
  };

  return (
    <div className="container mx-auto p-4 md:p-8 bg-white rounded-xl shadow-lg mt-8 mb-8">
      {currentStep === 'uploadRefs' && (
        <RefImageUpload
          onNext={handleNextStep}
          onImagesChange={handleRefImagesChange}
          referenceImages={referenceImages}
        />
      )}
      {currentStep === 'uploadModel' && (
        <ModelImageUpload
          onNext={handleNextStep}
          onBack={handleBackStep}
          onImageChange={handleModelImageChange}
          modelImage={modelImage}
        />
      )}
      {currentStep === 'configure' && (
        <TryOnConfig
          onNext={handleGenerationComplete}
          onBack={handleBackStep}
          referenceImages={referenceImages}
          modelImage={modelImage}
          // Fix: Pass last prompt and ratio to TryOnConfig for re-use.
          initialUserPrompt={lastUserPrompt}
          initialSelectedRatio={lastSelectedRatio}
        />
      )}
      {currentStep === 'result' && (
        <TryOnResult
          generatedImageUrl={generatedImageUrl}
          onReset={handleReset}
          onGenerateAgain={handleGenerateAgain} // Fix: Pass the new handler
        />
      )}
    </div>
  );
};

export default OutfitTryOn;
