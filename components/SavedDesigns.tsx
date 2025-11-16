import React from 'react';
import type { SavedDesign } from '../types';
import { CloseIcon, TrashIcon } from './icons';
import ImageComparator from './ImageComparator';

interface SavedDesignsProps {
  designs: SavedDesign[];
  onDelete: (id: number) => void;
  onClose: () => void;
}

const SavedDesigns: React.FC<SavedDesignsProps> = ({ designs, onDelete, onClose }) => {
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-gray-800 rounded-lg w-full max-w-6xl h-[90vh] flex flex-col p-6 border border-gray-700 shadow-2xl">
        <div className="flex justify-between items-center mb-6 flex-shrink-0">
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-600">
            Kaydedilen Tasarımlarım
          </h2>
          <button 
            onClick={onClose} 
            className="p-2 rounded-full hover:bg-gray-700 transition-colors"
            aria-label="Kaydedilen tasarımlar görünümünü kapat"
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        
        {designs.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <p className="text-xl">Henüz hiçbir tasarım kaydetmediniz.</p>
            <p className="mt-2">Hadi harika bir şey yaratın!</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-8 pr-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
            {designs.map((design) => (
              <div key={design.id} className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-xl font-semibold text-gray-200">
                    Stil: <span className="text-indigo-400">{design.style}</span>
                  </h3>
                  <button 
                    onClick={() => onDelete(design.id)} 
                    className="flex items-center space-x-2 text-red-400 hover:text-red-300 font-semibold px-3 py-1.5 rounded-md hover:bg-red-500/10 transition-colors"
                    aria-label={`${design.style} stiline sahip tasarımı sil`}
                  >
                    <TrashIcon className="w-5 h-5" />
                    <span>Sil</span>
                  </button>
                </div>
                <ImageComparator
                  originalImage={`data:${design.originalMimeType};base64,${design.originalImage}`}
                  generatedImage={`data:${design.originalMimeType};base64,${design.generatedImage}`}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedDesigns;