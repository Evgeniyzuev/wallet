'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
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

const cleanupData = (data: { items: VisionItem[], sectors: string[], allSectors: string[] }) => {
  // Удаляем дубликаты
  const uniqueItems = data.items.filter((item, index, self) =>
    index === self.findIndex((t) => t.id === item.id)
  );

  // Удаляем items с невалидными URL или отсутствующими обязательными полями
  const validItems = uniqueItems.filter(item => 
    item.id && 
    item.imageUrl && 
    item.sector && 
    typeof item.imageUrl === 'string'
  );

  // Получаем список реально используемых секторов
  const usedSectors = Array.from(new Set(validItems.map(item => item.sector)));

  return {
    items: validItems,
    sectors: data.sectors.filter(s => s), // Удаляем пустые значения
    allSectors: usedSectors // Обновляем список всех секторов
  };
};

const saveData = async (items: VisionItem[], sectors: string[]) => {
  if (!dbPromise) return;
  const db = await dbPromise;
  
  // Очищаем данные перед сохранением
  const cleanedData = cleanupData({ items, sectors, allSectors: sectors });
  
  await db.put('vision-items', cleanedData, 'vision-data');
};

const loadData = async () => {
  if (!dbPromise) return { 
    items: [], 
    sectors: defaultSectors,
    allSectors: defaultSectors 
  };
  
  const db = await dbPromise;
  const data = await db.get('vision-items', 'vision-data');
  
  if (!data) return {
    items: [],
    sectors: defaultSectors,
    allSectors: defaultSectors
  };

  // Очищаем данные при загрузке
  const cleanedData = cleanupData(data);
  
  // Если данные были очищены, сохраняем очищенную версию
  if (JSON.stringify(cleanedData) !== JSON.stringify(data)) {
    await saveData(cleanedData.items, cleanedData.sectors);
  }

  return cleanedData;
};

// Функция для сжатия изображения
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

        // Сохраняем с максимальным качеством
        const dataUrl = canvas.toDataURL('image/jpeg', 1.0);
        resolve(dataUrl);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

const defaultSectors = [
  'доход', 
  'самореализация', 
  'семья', 
  'здоровье', 
  'богатство', 
  'друзья', 
  'любовь', 
  'гармония'
];

export default function VisionBoard() {
  const [items, setItems] = useState<VisionItem[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  
  const [sectors, setSectors] = useState([
    'доход', 
    'самореализация', 
    'семья', 
    'здоровье', 
    'богатство', 
    'друзья', 
    'любовь', 
    'гармония'
  ]);
  const [selectedSector, setSelectedSector] = useState(sectors[0]);
  const [newSector, setNewSector] = useState('');
  const [selectedItem, setSelectedItem] = useState<VisionItem | null>(null);
  const [editedCaption, setEditedCaption] = useState('');
  const [editedComment, setEditedComment] = useState('');

  useEffect(() => {
    const loadSavedData = async () => {
      const data = await loadData();
      setItems(data.items);
      setSectors(data.sectors);
    };
    loadSavedData();
  }, []);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
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
      setSelectedFile(null);
      setCaption('');
      setSelectedSector(sectors[0]);
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  const handleDelete = async (id: string) => {
    const updatedItems = items.filter(item => item.id !== id);
    setItems(updatedItems);
    await saveData(updatedItems, sectors);
  };


  const handleItemClick = (item: VisionItem) => {
    setSelectedItem(item);
    setEditedCaption(item.caption);
    setEditedComment(item.comment || '');
  };

  const handleSaveEdits = async () => {
    if (!selectedItem) return;
    
    const updatedItems = items.map(item => 
      item.id === selectedItem.id 
        ? { ...item, caption: editedCaption, comment: editedComment }
        : item
    );
    
    setItems(updatedItems);
    await saveData(updatedItems, sectors);
    setSelectedItem(null);
  };

  const handleDeleteSector = async (sectorToDelete: string) => {
    if (confirm(`Скрыть сферу "${sectorToDelete}" из списка?`)) {
      const updatedSectors = sectors.filter(s => s !== sectorToDelete);
      setSectors(updatedSectors);
      await saveData(items, updatedSectors);
    }
  };

  return (
    <div className="bg-white text-gray-800 min-h-screen">
      {/* Instagram-like grid layout */}
      <div className="grid grid-cols-3 gap-1">
        {/* Show all items in a single grid, grouped by sectors with headers */}
        {items.map(item => (
          <div 
            key={item.id} 
            className="relative aspect-square cursor-pointer border-b border-r border-gray-100"
            onClick={() => handleItemClick(item)}
          >
            <div className="absolute top-0 left-0 bg-black bg-opacity-50 text-white text-xs px-2 py-0.5 z-10">
              {item.sector}
            </div>
            <Image
              src={item.imageUrl}
              alt={item.caption}
              fill
              className="object-cover"
            />
          </div>
        ))}
      </div>

      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex flex-col md:flex-row">
              <div className="relative aspect-square w-full md:w-1/2">
                <Image
                  src={selectedItem.imageUrl}
                  alt={selectedItem.caption}
                  fill
                  className="object-contain"
                />
              </div>
              <div className="p-4 space-y-4 md:w-1/2">
                <div className="text-sm text-gray-500">{selectedItem.sector}</div>
                <input
                  type="text"
                  value={editedCaption}
                  onChange={(e) => setEditedCaption(e.target.value)}
                  className="w-full p-2 rounded border border-gray-300 text-gray-800"
                  placeholder="Описание"
                />
                <textarea
                  value={editedComment}
                  onChange={(e) => setEditedComment(e.target.value)}
                  className="w-full p-2 rounded border border-gray-300 text-gray-800 h-24"
                  placeholder="Комментарий"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      handleDelete(selectedItem.id);
                      setSelectedItem(null);
                    }}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Удалить
                  </button>
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={handleSaveEdits}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Сохранить
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 