import React from 'react';
import ImageUpload from '../../components/ImageUpload';
import Button from '../../components/Button';
import { ImageUploadData } from '../../types';

interface RefImageUploadProps {
  onNext: () => void;
  onImagesChange: (images: ImageUploadData[]) => void;
  referenceImages: ImageUploadData[];
}

const RefImageUpload: React.FC<RefImageUploadProps> = ({ onNext, onImagesChange, referenceImages }) => {
  const isNextEnabled = referenceImages.length >= 1 && referenceImages.length <= 3;

  return (
    <div className="p-4 md:p-8 bg-gray-800 rounded-xl shadow-lg">
      <h2 className="text-2xl md:text-3xl font-extrabold text-gray-100 mb-6 text-center">Step 1: Upload Your Reference Images</h2>
      <p className="text-gray-300 mb-8 text-center max-w-2xl mx-auto">
        Please upload 1 to 3 images of yourself. These images will help us understand your facial features and body shape,
        which will be maintained in the generated try-on image.
      </p>
      <ImageUpload
        label="Your Reference Images (1-3)"
        onImagesChange={onImagesChange}
        maxFiles={3}
        minFiles={1}
        initialImages={referenceImages}
      />
      <div className="flex justify-center mt-8">
        <Button onClick={onNext} disabled={!isNextEnabled} size="lg">
          Next: Upload Outfit
        </Button>
      </div>
    </div>
  );
};

export default RefImageUpload;