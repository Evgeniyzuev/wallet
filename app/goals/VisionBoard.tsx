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

const saveData = async (items: VisionItem[], visibleSectors: string[]) => {
  if (!dbPromise) return;
  const db = await dbPromise;
  const currentData = await db.get('vision-items', 'vision-data');
  const allSectors = currentData?.allSectors || visibleSectors;
  
  const updatedAllSectors = Array.from(new Set([...allSectors, ...visibleSectors]));
  
  await db.put('vision-items', {
    items,
    sectors: visibleSectors,
    allSectors: updatedAllSectors
  }, 'vision-data');
};

const loadData = async () => {
  if (!dbPromise) return { items: [], sectors: [
    'доход', 
    'самореализация', 
    'семья', 
    'здоровье', 
    'богатство', 
    'друзья', 
    'любовь', 
    'гармония'
  ]};
  
  const db = await dbPromise;
  const data = await db.get('vision-items', 'vision-data');
  return data || { items: [], sectors: [
    'доход', 
    'самореализация', 
    'семья', 
    'здоровье', 
    'богатство', 
    'друзья', 
    'любовь', 
    'гармония'
  ]};
};

// Функция для сжатия изображения
const compressImage = async (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = document.createElement('img');
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 600;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        //  Уменьшаем качество до 0.7
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
        resolve(compressedDataUrl);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

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
    <div className="p-0 pb-20">
      <div className="mb-4 bg-gray-800 p-4 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Добавить новую цель</h2>
        
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
            placeholder="Описание цели"
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
              placeholder="Новая сфера"
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
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
        >
          Удалить сферу
        </button>

        <button
          onClick={handleUpload}
          disabled={!selectedFile || !caption}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Добавить
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {Array.from(new Set(items.map(item => item.sector))).map(sector => {
          const sectorItems = items.filter(item => item.sector === sector);
          if (sectorItems.length === 0) return null;

          return (
            <div key={sector} className="bg-gray-800 p-0 rounded-lg w-full">
              <div className="flex justify-between items-center mb-0 px-4 pt-0">
                <div className="flex justify-center items-center w-full mb-0 px-4 pt-0">
                  <h3 className="text-lg font-bold text-blue-400 text-center inline-block px-2 rounded-lg bg-black bg-opacity-50 mt-0 -mb-8 z-10">
                    {sector.charAt(0).toUpperCase() + sector.slice(1)}
                  </h3>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-0.5">
                {sectorItems.map(item => (
                  <div 
                    key={item.id} 
                    className="relative aspect-square cursor-pointer"
                    onClick={() => handleItemClick(item)}
                  >
                    <Image
                      src={item.imageUrl}
                      alt={item.caption}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="relative aspect-square w-full">
              <Image
                src={selectedItem.imageUrl}
                alt={selectedItem.caption}
                fill
                className="object-contain"
              />
            </div>
            <div className="p-4 space-y-4">
              <input
                type="text"
                value={editedCaption}
                onChange={(e) => setEditedCaption(e.target.value)}
                className="w-full p-2 rounded bg-gray-700 text-white"
                placeholder="Описание"
              />
              <textarea
                value={editedComment}
                onChange={(e) => setEditedComment(e.target.value)}
                className="w-full p-2 rounded bg-gray-700 text-white h-24"
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
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
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
      )}
    </div>
  );
} 