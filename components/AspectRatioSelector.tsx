import React from 'react';
import { AspectRatio } from '../types';

interface AspectRatioSelectorProps {
  selectedRatio: AspectRatio;
  onSelectRatio: (ratio: AspectRatio) => void;
  label?: string;
  excludeRatios?: AspectRatio[]; // Optional: Ratios to exclude from the selection
}

const AspectRatioSelector: React.FC<AspectRatioSelectorProps> = ({
  selectedRatio,
  onSelectRatio,
  label = 'Select Aspect Ratio',
  excludeRatios = [],
}) => {
  const ratios = Object.values(AspectRatio).filter(
    (ratio) => !excludeRatios.includes(ratio)
  );

  const getRatioDisplay = (ratio: AspectRatio) => {
    switch (ratio) {
      case AspectRatio.ASPECT_RATIO_1_1: return '1:1 Square';
      case AspectRatio.ASPECT_RATIO_3_4: return '3:4 Portrait';
      case AspectRatio.ASPECT_RATIO_4_3: return '4:3 Landscape';
      case AspectRatio.ASPECT_RATIO_9_16: return '9:16 Portrait';
      case AspectRatio.ASPECT_RATIO_16_9: return '16:9 Landscape';
      default: return ratio;
    }
  };

  return (
    <div className="mb-6 p-4 border border-gray-600 rounded-lg bg-gray-800 shadow-sm">
      <h3 className="text-xl font-semibold text-gray-100 mb-4">{label}</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {ratios.map((ratio) => (
          <button
            key={ratio}
            onClick={() => onSelectRatio(ratio)}
            className={`
              p-3 rounded-lg border-2 text-sm font-medium transition-colors duration-200
              ${selectedRatio === ratio
                ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                : 'bg-gray-700 text-gray-200 border-gray-600 hover:bg-gray-600'}
            `}
          >
            {getRatioDisplay(ratio)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AspectRatioSelector;