
import React, { useState } from 'react';

interface ImageComparatorProps {
  originalImage: string;
  generatedImage: string;
}

const ImageComparator: React.FC<ImageComparatorProps> = ({ originalImage, generatedImage }) => {
  const [sliderPosition, setSliderPosition] = useState(50);

  return (
    <div className="relative w-full aspect-video rounded-lg overflow-hidden group border-2 border-gray-700">
      <img
        src={originalImage}
        alt="Orijinal Oda"
        className="absolute inset-0 w-full h-full object-contain"
      />
      <div
        className="absolute inset-0 w-full h-full overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <img
          src={generatedImage}
          alt="Yapay Zeka ile Oluşturulan Oda"
          className="absolute inset-0 w-full h-full object-contain"
        />
      </div>
      <div
        className="absolute inset-0 cursor-ew-resize"
        style={{ left: `calc(${sliderPosition}% - 2px)` }}
      >
        <div className="absolute top-0 bottom-0 w-1 bg-white bg-opacity-80 backdrop-blur-sm">
          <div className="absolute top-1/2 -translate-y-1/2 -left-4 w-8 h-8 rounded-full bg-white bg-opacity-80 backdrop-blur-sm flex items-center justify-center shadow-lg">
            <svg className="w-4 h-4 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
            </svg>
          </div>
        </div>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value={sliderPosition}
        onChange={(e) => setSliderPosition(Number(e.target.value))}
        className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize"
      />
      <div className="absolute top-2 left-2 bg-black bg-opacity-60 px-2 py-1 rounded-md text-sm font-semibold">ÖNCE</div>
      <div className="absolute top-2 right-2 bg-black bg-opacity-60 px-2 py-1 rounded-md text-sm font-semibold" style={{ clipPath: `inset(0 0 0 ${100 - sliderPosition}%)` }}>SONRA</div>
    </div>
  );
};

export default ImageComparator;