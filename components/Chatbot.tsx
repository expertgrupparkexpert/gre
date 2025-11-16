
import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../types';
import { SendIcon, WandIcon } from './icons';

interface ChatbotProps {
  onSendMessage: (message: string) => void;
  onGetShoppingLinks: () => void;
  chatHistory: ChatMessage[];
  isLoading: boolean;
}

const Chatbot: React.FC<ChatbotProps> = ({ onSendMessage, onGetShoppingLinks, chatHistory, isLoading }) => {
  const [message, setMessage] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-gray-800 rounded-lg border border-gray-700">
      <div ref={chatContainerRef} className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
        {chatHistory.map((chat, index) => (
          <div key={index} className={`flex ${chat.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs md:max-w-md p-3 rounded-xl ${chat.sender === 'user' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-200'}`}>
              <p>{chat.text}</p>
              {chat.items && (
                <div className="mt-3 border-t border-gray-500 pt-2">
                  <h4 className="font-semibold mb-2">Önerilen Ürünler:</h4>
                  <ul className="space-y-2">
                    {chat.items.map((item, i) => (
                      <li key={i}>
                        <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-indigo-300 hover:underline">
                          {item.itemName} - {item.price}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && chatHistory.length > 0 && chatHistory[chatHistory.length - 1].sender === 'user' && (
             <div className="flex justify-start">
                <div className="max-w-xs md:max-w-md p-3 rounded-xl bg-gray-700 text-gray-200 flex items-center space-x-2">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse delay-75"></div>
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse delay-150"></div>
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse delay-300"></div>
                </div>
            </div>
        )}
      </div>
      <div className="p-4 border-t border-gray-700">
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="ör., 'Halıyı mavi yap'"
            className="flex-1 bg-gray-700 border border-gray-600 rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
            disabled={isLoading}
          />
          <button type="submit" className="bg-indigo-600 rounded-full p-2.5 text-white hover:bg-indigo-500 disabled:bg-gray-600 transition" disabled={isLoading}>
            <SendIcon className="w-5 h-5" />
          </button>
        </form>
         <button 
            onClick={onGetShoppingLinks}
            disabled={isLoading}
            className="w-full mt-3 flex items-center justify-center py-2 px-4 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-full transition duration-200"
          >
            <WandIcon className="w-5 h-5 mr-2" />
            Satın Alınabilir Ürünleri Bul
        </button>
      </div>
    </div>
  );
};

export default Chatbot;