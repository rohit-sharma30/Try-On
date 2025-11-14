import React from 'react';
import { AppMode } from '../types';

interface HeaderProps {
  currentMode: AppMode;
  onSelectMode: (mode: AppMode) => void;
}

const Header: React.FC<HeaderProps> = ({ currentMode, onSelectMode }) => {
  const modes = [
    { label: 'Outfit Try-On', value: AppMode.OUTFIT_TRY_ON },
    { label: 'Image Generator', value: AppMode.IMAGE_GENERATOR },
    { label: 'Image Editor', value: AppMode.IMAGE_EDITOR },
    { label: 'Image Analyzer', value: AppMode.IMAGE_ANALYZER },
    { label: 'Video Generator', value: AppMode.VIDEO_GENERATOR },
  ];

  return (
    <header className="bg-gray-800 shadow-lg p-4 sticky top-0 z-50">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-50 mb-4 sm:mb-0">Gemini AI Studio</h1>
        <nav className="flex flex-wrap justify-center sm:justify-end gap-2">
          {modes.map((mode) => (
            <button
              key={mode.value}
              onClick={() => onSelectMode(mode.value)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200
                ${currentMode === mode.value
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-700 text-gray-200 hover:bg-gray-600'}
              `}
            >
              {mode.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Header;