'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '../LanguageContext';
import { openDB, DBSchema } from 'idb';

interface VisionItem {
  id: string;
  imageUrl: string;
  caption: string;
  sector: string;
  comment?: string;
}

interface VisionBoardDB extends DBSchema {
  'vision-items': {
    key: string;
    value: {
      items: VisionItem[];
      sectors: string[];
      allSectors: string[];
    };
  };
}

const dbPromise = typeof window !== 'undefined' 
  ? openDB<VisionBoardDB>('vision-board-db', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('vision-items')) {
          db.createObjectStore('vision-items');
        }
      },
    })
  : null;

// Function to compress image
const compressImage = async (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = document.createElement('img');
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, img.width, img.height);

        // Save with maximum quality
        const dataUrl = canvas.toDataURL('image/jpeg', 1.0);
        resolve(dataUrl);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

// Load data from IndexedDB
const loadData = async () => {
  if (!dbPromise) return { 
    items: [], 
    sectors: ['доход', 'самореализация', 'семья', 'здоровье', 'богатство', 'друзья', 'любовь', 'гармония']
  };
  
  const db = await dbPromise;
  const data = await db.get('vision-items', 'vision-data');
  
  if (!data) return {
    items: [],
    sectors: ['доход', 'самореализация', 'семья', 'здоровье', 'богатство', 'друзья', 'любовь', 'гармония']
  };

  return {
    items: data.items || [],
    sectors: data.sectors || ['доход', 'самореализация', 'семья', 'здоровье', 'богатство', 'друзья', 'любовь', 'гармония']
  };
};

// Save data to IndexedDB
const saveData = async (items: VisionItem[], sectors: string[]) => {
  if (!dbPromise) return;
  const db = await dbPromise;
  
  await db.put('vision-items', { 
    items, 
    sectors, 
    allSectors: sectors 
  }, 'vision-data');
};

export default function AddGoal() {
  const { language } = useLanguage();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [sectors, setSectors] = useState<string[]>(['доход', 'самореализация', 'семья', 'здоровье', 'богатство', 'друзья', 'любовь', 'гармония']);
  const [selectedSector, setSelectedSector] = useState(sectors[0]);
  const [newSector, setNewSector] = useState('');
  const [items, setItems] = useState<VisionItem[]>([]);

  useEffect(() => {
    // Load existing data on component mount
    const loadSavedData = async () => {
      const data = await loadData();
      setItems(data.items);
      setSectors(data.sectors);
      
      if (data.sectors.length > 0) {
        setSelectedSector(data.sectors[0]);
      }
    };
    loadSavedData();
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !caption) return;

    try {
      const compressedImageUrl = await compressImage(selectedFile);
      const newItem: VisionItem = {
        id: Date.now().toString(),
        imageUrl: compressedImageUrl,
        caption,
        sector: selectedSector
      };
      
      const updatedItems = [...items, newItem];
      setItems(updatedItems);
      await saveData(updatedItems, sectors);
      
      // Reset form
      setSelectedFile(null);
      setCaption('');
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  const handleDeleteSector = async (sectorToDelete: string) => {
    if (sectors.length <= 1) return;
    
    const updatedSectors = sectors.filter(sector => sector !== sectorToDelete);
    setSectors(updatedSectors);
    setSelectedSector(updatedSectors[0]);
    
    await saveData(items, updatedSectors);
  };

  const formLabels = {
    ru: {
      addNewGoal: 'Добавить новую цель',
      goalDescription: 'Описание цели',
      newSector: 'Новая сфера',
      deleteSector: 'Удалить сферу',
      add: 'Добавить'
    },
    en: {
      addNewGoal: 'Add new goal',
      goalDescription: 'Goal description',
      newSector: 'New sector',
      deleteSector: 'Delete sector',
      add: 'Add'
    }
  };

  const labels = formLabels[language as keyof typeof formLabels] || formLabels.en;

  return (
    <div className="flex justify-center mt-4">
      <div className="mb-4 bg-gray-800 p-4 rounded-lg max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">{labels.addNewGoal}</h2>
        
        <div className="mb-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="mb-2 text-sm text-gray-300"
          />
        </div>

        <div className="mb-4">
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder={labels.goalDescription}
            className="w-full p-2 rounded bg-gray-700 text-white"
          />
        </div>

        <div className="mb-4">
          <select
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 text-white"
          >
            {sectors.map(sector => (
              <option key={sector} value={sector}>
                {sector.charAt(0).toUpperCase() + sector.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newSector}
              onChange={(e) => setNewSector(e.target.value)}
              placeholder={labels.newSector}
              className="flex-1 p-2 rounded bg-gray-700 text-white"
            />
            <button
              onClick={async () => {
                if (newSector.trim()) {
                  const updatedSectors = [...sectors, newSector.trim()];
                  setSectors(updatedSectors);
                  await saveData(items, updatedSectors);
                  setNewSector('');
                }
              }}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
            >
              +
            </button>
          </div>
        </div>
        <button
          onClick={() => handleDeleteSector(selectedSector)}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded mr-2"
        >
          {labels.deleteSector}
        </button>

        <button
          onClick={handleUpload}
          disabled={!selectedFile || !caption}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {labels.add}
        </button>
      </div>
    </div>
  );
} 