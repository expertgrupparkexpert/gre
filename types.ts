export interface Style {
  name: string;
  imageUrl: string;
  description: string;
}

export interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
  items?: ShoppingItem[];
}

export interface ShoppingItem {
  itemName: string;
  url: string;
  price: string;
}

export interface SavedDesign {
  id: number;
  style: string;
  originalImage: string;
  generatedImage: string;
  originalMimeType: string;
}

export interface AutoSavedDesign {
  originalImageBase64: string;
  generatedImageBase64: string;
  currentStyle: string;
  chatHistory: ChatMessage[];
  mimeType: string;
}