import React, { useState } from 'react';
import Header from './components/Header';
import OutfitTryOn from './pages/OutfitTryOn';
import ImageGenerator from './pages/ImageGenerator';
import ImageEditor from './pages/ImageEditor';
import ImageAnalyzer from './pages/ImageAnalyzer';
import VideoGenerator from './pages/VideoGenerator';
import { AppMode } from './types';

const App: React.FC = () => {
  const [currentMode, setCurrentMode] = useState<AppMode>(AppMode.OUTFIT_TRY_ON);

  const renderContent = () => {
    switch (currentMode) {
      case AppMode.OUTFIT_TRY_ON:
        return <OutfitTryOn />;
      case AppMode.IMAGE_GENERATOR:
        return <ImageGenerator />;
      case AppMode.IMAGE_EDITOR:
        return <ImageEditor />;
      case AppMode.IMAGE_ANALYZER:
        return <ImageAnalyzer />;
      case AppMode.VIDEO_GENERATOR:
        return <VideoGenerator />;
      default:
        return <OutfitTryOn />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-gray-100 font-sans">
      <Header currentMode={currentMode} onSelectMode={setCurrentMode} />
      <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8">
        {renderContent()}
      </main>
      <footer className="bg-gray-800 text-white text-center p-4 mt-auto">
        <p>&copy; {new Date().getFullYear()} Gemini AI Studio. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;