
import React from 'react';
import type { Style } from '../types';
import { DESIGN_STYLES } from '../constants';
import { InfoIcon } from './icons';

interface StyleCarouselProps {
  onStyleSelect: (style: Style) => void;
  selectedStyle: string | null;
  disabled: boolean;
}

const StyleCarousel: React.FC<StyleCarouselProps> = ({ onStyleSelect, selectedStyle, disabled }) => {
  return (
    <div className="w-full py-4">
      <h3 className="text-lg font-semibold text-gray-300 mb-4 px-4 md:px-0">Odanızı Yeniden Tasarlamak İçin Bir Stil Seçin</h3>
      <div className="flex space-x-4 overflow-x-auto pb-4 px-4 md:px-0 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800">
        {DESIGN_STYLES.map((style) => (
          <button
            key={style.name}
            onClick={() => onStyleSelect(style)}
            disabled={disabled}
            className={`flex-shrink-0 w-40 h-28 rounded-lg overflow-hidden relative group transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <img src={style.imageUrl} alt={style.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
            <div className={`absolute inset-0 flex items-center justify-center p-2 text-center transition-all duration-300 ${selectedStyle === style.name ? 'bg-indigo-600 bg-opacity-80' : 'bg-black bg-opacity-60 group-hover:bg-opacity-70'}`}>
              <div className="flex items-center">
                <span className="text-white font-bold">{style.name}</span>
                <div className="relative flex items-center group/tooltip ml-1.5">
                    <InfoIcon className="w-4 h-4 text-gray-300" />
                    <div className="absolute bottom-full mb-2 w-44 p-2 text-xs leading-tight text-left text-white bg-gray-900 border border-gray-700 rounded-lg shadow-xl opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-300 pointer-events-none left-1/2 -translate-x-1/2 z-10">
                        {style.description}
                    </div>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default StyleCarousel;