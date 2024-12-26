import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { openDB, DBSchema } from 'idb';

interface VisionItem {
  id: string;
  imageUrl: string;
  caption: string;
  sector: string;
}

interface VisionBoardDB extends DBSchema {
  'vision-items': {
    key: string;
    value: {
      items: VisionItem[];
      sectors: string[];
    };
  };
}

const dbPromise = openDB<VisionBoardDB>('vision-board-db', 1, {
  upgrade(db) {
    // Создаем хранилище объектов, если его еще нет
    if (!db.objectStoreNames.contains('vision-items')) {
      db.createObjectStore('vision-items');
    }
  },
});

const saveData = async (items: VisionItem[], sectors: string[]) => {
  const db = await dbPromise;
  await db.put('vision-items', { items, sectors }, 'vision-data');
};

const loadData = async () => {
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

        // Сжимаем качество до 0.7
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

  const handleDeleteSector = async (sectorToDelete: string) => {
    if (confirm(`Удалить сферу "${sectorToDelete}" и все связанные с ней картинки?`)) {
      const updatedSectors = sectors.filter(s => s !== sectorToDelete);
      const updatedItems = items.filter(item => item.sector !== sectorToDelete);
      setSectors(updatedSectors);
      setItems(updatedItems);
      await saveData(updatedItems, updatedSectors);
    }
  };

  return (
    <div className="p-4">
      <div className="mb-8 bg-gray-800 p-4 rounded-lg">
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
          onClick={handleUpload}
          disabled={!selectedFile || !caption}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Добавить
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sectors.map(sector => {
          const sectorItems = items.filter(item => item.sector === sector);
          if (sectorItems.length === 0) return null;

          return (
            <div key={sector} className="bg-gray-800 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-bold text-blue-400">
                  {sector.charAt(0).toUpperCase() + sector.slice(1)}
                </h3>
                <button
                  onClick={() => handleDeleteSector(sector)}
                  className="bg-red-500 text-white p-1 rounded-full hover:bg-red-600 text-sm"
                >
                  ×
                </button>
              </div>
              <div className="space-y-4">
                {sectorItems.map(item => (
                  <div key={item.id} className="relative">
                    <div className="relative h-48 mb-2">
                      <Image
                        src={item.imageUrl}
                        alt={item.caption}
                        fill
                        className="rounded-lg object-cover"
                      />
                    </div>
                    <p className="text-sm text-gray-300">{item.caption}</p>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 