
import React, { useState, useCallback, useEffect, useRef } from 'react';
import ImageUploader from './components/ImageUploader';
import StyleCarousel from './components/StyleCarousel';
import ImageComparator from './components/ImageComparator';
import Chatbot from './components/Chatbot';
import Loader from './components/Loader';
import SavedDesigns from './components/SavedDesigns';
import { fileToBase64, editImage, getShoppingLinks, refinePromptForImageEditing } from './services/geminiService';
import { FolderIcon, SaveIcon, CheckIcon, NewDesignIcon } from './components/icons';
import type { Style, ChatMessage, SavedDesign, AutoSavedDesign } from './types';

const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<File | null>(null);
  const [originalImageBase64, setOriginalImageBase64] = useState<string | null>(null);
  const [generatedImageBase64, setGeneratedImageBase64] = useState<string | null>(null);
  const [currentStyle, setCurrentStyle] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  
  const [savedDesigns, setSavedDesigns] = useState<SavedDesign[]>([]);
  const [showSavedDesigns, setShowSavedDesigns] = useState<boolean>(false);
  const [justSaved, setJustSaved] = useState<boolean>(false);

  const [isAutoSaveEnabled, setIsAutoSaveEnabled] = useState<boolean>(true);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const autoSaveTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    // Kaydedilen tasarımları yükle
    try {
      const storedDesigns = localStorage.getItem('savedDesigns');
      if (storedDesigns) {
        setSavedDesigns(JSON.parse(storedDesigns));
      }
    } catch (e) {
      console.error("Kaydedilen tasarımlar localStorage'dan ayrıştırılamadı", e);
      localStorage.removeItem('savedDesigns');
    }

    // Otomatik kaydetme ayarını yükle
    const storedAutoSaveSetting = localStorage.getItem('isAutoSaveEnabled');
    if (storedAutoSaveSetting) {
      setIsAutoSaveEnabled(JSON.parse(storedAutoSaveSetting));
    }
    
    // Otomatik kaydedilen oturumu geri yükle
    const autoSavedData = localStorage.getItem('autoSavedDesign');
    if (autoSavedData) {
      try {
        const design: AutoSavedDesign = JSON.parse(autoSavedData);
        const file = new File([], "restored_image.jpg", { type: design.mimeType });
        setOriginalImage(file);
        setOriginalImageBase64(design.originalImageBase64);
        setGeneratedImageBase64(design.generatedImageBase64);
        setCurrentStyle(design.currentStyle);
        setChatHistory(design.chatHistory);
      } catch (e) {
        console.error("Otomatik kaydedilen tasarım ayrıştırılamadı", e);
        localStorage.removeItem('autoSavedDesign');
      }
    }
  }, []);
  
  useEffect(() => {
    localStorage.setItem('isAutoSaveEnabled', JSON.stringify(isAutoSaveEnabled));
  }, [isAutoSaveEnabled]);
  
  useEffect(() => {
    if (!isAutoSaveEnabled || !generatedImageBase64 || !originalImageBase64 || !originalImage || !currentStyle) {
      return;
    }

    if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
    setAutoSaveStatus('saving');

    autoSaveTimeoutRef.current = window.setTimeout(() => {
      const designToSave: AutoSavedDesign = {
        originalImageBase64,
        generatedImageBase64,
        currentStyle,
        chatHistory,
        mimeType: originalImage.type,
      };
      localStorage.setItem('autoSavedDesign', JSON.stringify(designToSave));
      setAutoSaveStatus('saved');
      
      setTimeout(() => setAutoSaveStatus('idle'), 2000);
    }, 2500);

    return () => {
      if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
    }
  }, [isAutoSaveEnabled, generatedImageBase64, originalImageBase64, originalImage, currentStyle, chatHistory]);

  const handleImageUpload = async (file: File) => {
    setOriginalImage(file);
    const base64 = await fileToBase64(file);
    setOriginalImageBase64(base64);
    setGeneratedImageBase64(null);
    setCurrentStyle(null);
    setChatHistory([{ sender: 'ai', text: "Hoş geldiniz! Ben sizin Yapay Zeka İç Mimarınızım. Başlamak için aşağıdan bir stil seçin veya tasarımı iyileştirmek için benimle sohbet edin." }]);
    localStorage.removeItem('autoSavedDesign');
  };

  const handleStyleSelect = useCallback(async (style: Style) => {
    if (!originalImageBase64 || !originalImage) return;
    
    setCurrentStyle(style.name);
    setIsLoading(true);
    setLoadingMessage(`${style.name} stilinde yeniden tasarlanıyor...`);
    setError(null);
    
    try {
      const prompt = `Redesign this room in a ${style.name} style.`;
      const newImageBase64 = await editImage(originalImageBase64, originalImage.type, prompt);
      setGeneratedImageBase64(newImageBase64);
    } catch (e) {
      setError('Görüntü oluşturulamadı. Lütfen başka bir stil deneyin.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [originalImageBase64, originalImage]);
  
  const handleSendMessage = useCallback(async (message: string) => {
      if (!originalImageBase64 || !originalImage) return;

      setChatHistory(prev => [...prev, { sender: 'user', text: message }]);
      setIsLoading(true);
      setLoadingMessage('İsteğiniz yorumlanıyor...');
      setError(null);

      const imageToEdit = generatedImageBase64 || originalImageBase64;

      try {
          const refinedPrompt = await refinePromptForImageEditing(message);
          setLoadingMessage('Değişiklikleriniz uygulanıyor...');
          
          const newImageBase64 = await editImage(imageToEdit, originalImage.type, refinedPrompt);
          setGeneratedImageBase64(newImageBase64);
          setChatHistory(prev => [...prev, { sender: 'ai', text: `Elbette! İşte isteğinizin uygulanmış hali: "${refinedPrompt}". Başka bir değişiklik isterseniz söylemeniz yeterli.` }]);
      } catch(e) {
          setError('Değişiklikler uygulanamadı. Lütfen tekrar deneyin.');
          setChatHistory(prev => [...prev, { sender: 'ai', text: 'Üzgünüm, bu değişikliği uygulayamadım. Lütfen isteğinizi farklı bir şekilde ifade etmeyi deneyin.' }]);
          console.error(e);
      } finally {
          setIsLoading(false);
      }
  }, [originalImage, originalImageBase64, generatedImageBase64]);

  const handleGetShoppingLinks = useCallback(async () => {
    const imageForShopping = generatedImageBase64 || originalImageBase64;
    if (!imageForShopping || !originalImage) return;

    setChatHistory(prev => [...prev, { sender: 'user', text: "Benim için satın alınabilir ürünler bulabilir misin?" }]);
    setIsLoading(true);
    setLoadingMessage('Benzer ürünler bulunuyor...');
    setError(null);

    try {
        const items = await getShoppingLinks(imageForShopping, originalImage.type);
        setChatHistory(prev => [...prev, { sender: 'ai', text: 'İşte tasarımdan ilham alan bazı ürünler:', items }]);
    } catch(e) {
        setError('Alışveriş bağlantıları bulunamadı. Lütfen tekrar deneyin.');
        setChatHistory(prev => [...prev, { sender: 'ai', text: 'Üzgünüm, bu tasarım için ürün bulmakta zorlandım. Daha fazla düzenleme yaptıktan sonra tekrar deneyebilirsiniz.' }]);
        console.error(e);
    } finally {
        setIsLoading(false);
    }
  }, [generatedImageBase64, originalImageBase64, originalImage]);

  const handleSaveDesign = useCallback(() => {
    if (!generatedImageBase64 || !currentStyle || !originalImageBase64 || !originalImage) return;

    const newDesign: SavedDesign = {
      id: Date.now(),
      style: currentStyle,
      originalImage: originalImageBase64,
      generatedImage: generatedImageBase64,
      originalMimeType: originalImage.type,
    };
    const updatedDesigns = [...savedDesigns, newDesign];
    setSavedDesigns(updatedDesigns);
    localStorage.setItem('savedDesigns', JSON.stringify(updatedDesigns));
    localStorage.removeItem('autoSavedDesign');
    
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  }, [generatedImageBase64, currentStyle, originalImageBase64, originalImage, savedDesigns]);

  const handleDeleteDesign = (id: number) => {
    const updatedDesigns = savedDesigns.filter(design => design.id !== id);
    setSavedDesigns(updatedDesigns);
    localStorage.setItem('savedDesigns', JSON.stringify(updatedDesigns));
  };

  const handleNewDesign = () => {
    setOriginalImage(null);
    setOriginalImageBase64(null);
    setGeneratedImageBase64(null);
    setCurrentStyle(null);
    setChatHistory([]);
    setError(null);
    setAutoSaveStatus('idle');
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    localStorage.removeItem('autoSavedDesign');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center p-4">
      {showSavedDesigns && (
        <SavedDesigns 
          designs={savedDesigns}
          onDelete={handleDeleteDesign}
          onClose={() => setShowSavedDesigns(false)}
        />
      )}
      <header className="w-full max-w-7xl mx-auto flex justify-between items-center py-2 md:py-4">
        <div className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-600">
           {originalImageBase64 ? 'Tasarım Paneli' : 'Yapay Zeka İç Mimar'}
        </div>
        <div className="flex items-center space-x-4">
            {originalImageBase64 && (
                <>
                    <div className="text-sm text-gray-400 w-24 text-right transition-opacity duration-300">
                    {autoSaveStatus === 'saving' && 'Kaydediliyor...'}
                    {autoSaveStatus === 'saved' && (
                        <span className="flex items-center justify-end text-green-400">
                            <CheckIcon className="w-4 h-4 mr-1"/> Kaydedildi
                        </span>
                    )}
                    </div>
                    <div className="flex items-center space-x-2">
                    <label htmlFor="autosave-toggle" className="text-sm text-gray-300 cursor-pointer select-none">Oto. Kayıt</label>
                    <button
                        id="autosave-toggle"
                        role="switch"
                        aria-checked={isAutoSaveEnabled}
                        onClick={() => setIsAutoSaveEnabled(prev => !prev)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 ${isAutoSaveEnabled ? 'bg-indigo-600' : 'bg-gray-600'}`}
                    >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${isAutoSaveEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                    </div>
                     <button 
                        onClick={handleNewDesign}
                        className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 border border-gray-700"
                      >
                        <NewDesignIcon className="w-5 h-5" />
                        <span>Yeni Tasarım</span>
                      </button>
                </>
            )}
            <button 
              onClick={() => setShowSavedDesigns(true)}
              className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 border border-gray-700"
            >
              <FolderIcon className="w-5 h-5" />
              <span>Tasarımlarım ({savedDesigns.length})</span>
            </button>
        </div>
      </header>
      
      <main className="w-full flex-1 flex flex-col items-center justify-center">
        {!originalImageBase64 ? (
          <div className="w-full flex-1 flex items-center justify-center">
            <ImageUploader onImageUpload={handleImageUpload} />
          </div>
        ) : (
          <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 lg:gap-8 mt-4">
            {/* Left Column: Image and Styles */}
            <div className="w-full lg:w-2/3 flex-shrink-0">
              <div className="relative aspect-video bg-gray-800 rounded-lg flex items-center justify-center border-2 border-gray-700">
                {isLoading && <Loader message={loadingMessage} />}
                {error && <div className="p-4 text-red-400">{error}</div>}
                {generatedImageBase64 ? (
                  <ImageComparator 
                    originalImage={`data:${originalImage?.type};base64,${originalImageBase64}`}
                    generatedImage={`data:${originalImage?.type};base64,${generatedImageBase64}`}
                  />
                ) : (
                  !isLoading && <img src={`data:${originalImage?.type};base64,${originalImageBase64}`} alt="Odanız" className="max-h-full max-w-full object-contain rounded-lg"/>
                )}
              </div>
              <StyleCarousel onStyleSelect={handleStyleSelect} selectedStyle={currentStyle} disabled={isLoading} />
              <div className="px-4 md:px-0">
                <button
                  onClick={handleSaveDesign}
                  disabled={!generatedImageBase64 || isLoading || justSaved}
                  className="w-full mt-2 flex items-center justify-center py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-full transition duration-200"
                >
                  <SaveIcon className="w-5 h-5 mr-2" />
                  {justSaved ? 'Kaydedildi!' : 'Mevcut Tasarımı Kaydet'}
                </button>
              </div>
            </div>

            {/* Right Column: Chatbot */}
            <div className="w-full lg:w-1/3 h-[70vh] lg:h-auto">
               <Chatbot 
                  onSendMessage={handleSendMessage} 
                  onGetShoppingLinks={handleGetShoppingLinks} 
                  chatHistory={chatHistory} 
                  isLoading={isLoading} 
                />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
