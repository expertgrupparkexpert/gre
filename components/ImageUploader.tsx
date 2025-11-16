
import React, { useRef, useState } from 'react';
import { UploadIcon } from './icons';
import { LOGO_BASE64 } from '../assets/logo';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onImageUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageUpload(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center p-8">
      <img src={LOGO_BASE64} alt="Goods Real Estate Logo" className="h-24 mb-6" />
      <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-600 mb-2 text-center">
        Yapay Zeka Destekli İç Mimar
      </h1>
      <p className="text-gray-300 text-lg mb-4 text-center font-semibold">Goods Real Estate ile farkı görün..</p>
      <p className="text-gray-400 text-lg mb-8 text-center">Mekanınızı saniyeler içinde yeniden tasarlayın. Başlamak için bir fotoğraf yükleyin.</p>
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`w-full h-64 border-4 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${isDragging ? 'border-indigo-500 bg-gray-800' : 'border-gray-600 hover:border-indigo-500 hover:bg-gray-800'}`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/png, image/jpeg"
        />
        <UploadIcon className="w-16 h-16 text-gray-500 mb-4" />
        <p className="text-gray-400 text-center">
          <span className="font-semibold text-indigo-400">Yüklemek için tıklayın</span> veya sürükleyip bırakın
        </p>
        <p className="text-xs text-gray-500 mt-2">PNG veya JPG</p>
      </div>
    </div>
  );
};

export default ImageUploader;
