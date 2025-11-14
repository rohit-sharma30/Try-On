import React from 'react';
import ImageUpload from '../../components/ImageUpload';
import Button from '../../components/Button';
import { ImageUploadData } from '../../types';

interface ModelImageUploadProps {
  onNext: () => void;
  onBack: () => void;
  onImageChange: (images: ImageUploadData[]) => void;
  modelImage: ImageUploadData[];
}

const ModelImageUpload: React.FC<ModelImageUploadProps> = ({ onNext, onBack, onImageChange, modelImage }) => {
  const isNextEnabled = modelImage.length === 1;

  return (
    <div className="p-4 md:p-8 bg-gray-800 rounded-xl shadow-lg">
      <h2 className="text-2xl md:text-3xl font-extrabold text-gray-100 mb-6 text-center">Step 2: Upload Outfit/Look Image</h2>
      <p className="text-gray-300 mb-8 text-center max-w-2xl mx-auto">
        Upload a single image of the outfit or look you want to try on. This can be a screenshot from a website or any image of a model.
        We will focus only on the outfit, look, and pose, ignoring any background or extraneous elements.
      </p>
      <ImageUpload
        label="Outfit/Look Image (1)"
        onImagesChange={onImageChange}
        maxFiles={1}
        minFiles={1}
        initialImages={modelImage}
      />
      <div className="flex justify-between mt-8">
        <Button onClick={onBack} variant="secondary" size="lg">
          Back
        </Button>
        <Button onClick={onNext} disabled={!isNextEnabled} size="lg">
          Next: Configure Try-On
        </Button>
      </div>
    </div>
  );
};

export default ModelImageUpload;