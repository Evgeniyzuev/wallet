'use client';

import { useLanguage } from '../LanguageContext';
import { useState } from 'react';
import Roadmap from './Roadmap';
import VisionBoard from '../goals/VisionBoard';
import AddGoal from './AddGoal';

const goalTranslations = {
  ru: ['🏋️ здоровье', '💑 отношения', '⏳ время', '🎯 цели', '💰 деньги', '💼 карьера', '🏠 дом', '✈️ путешествия', '🎨 хобби', '👪 семья', '🧠 навыки', '🧘‍♀️ привычки', '💪 фитнес', '🏠 имущество', '💁‍♂️ персональное', '👨‍👩‍👦‍👦 социальное', '🌐 карта желаний', '🔮 рекомендации!'],
  en: ['🏋️ health', '💑 relationships', '⏳ time', '🎯 goals', '💰 money', '💼 career', '🏠 home', '✈️ travel', '🎨 hobbies', '👪 family', '🧠 skills', '🧘‍♀️ habbits', '💪 fitness', '🏠 property', '💁‍♂️ personal', '👨‍👩‍👦‍👦 social', '🌐 wish map', '🔮 recommendations']
};

const pageTitle = {
  ru: {
    goals: 'Цели',
    roadmap: 'Дорожная карта',
    visionBoard: 'Карта желаний'
  },
  en: {
    goals: 'Goals',
    roadmap: 'Roadmap',
    visionBoard: 'Vision board'
  }
};

export default function GoalsPage() {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'goals' | 'roadmap' | 'visionBoard' | 'addGoal'>('goals');
  const goals = goalTranslations[language as keyof typeof goalTranslations] || goalTranslations.en;
  const titles = pageTitle[language as keyof typeof pageTitle] || pageTitle.en;

  return (
    <main className={`${activeTab === 'visionBoard' ? 'bg-white' : 'bg-dark-blue'} text-white min-h-screen flex flex-col p-0`}>
      <div className="flex justify-center">
        <div className="flex space-x-2 bg-gray-800 rounded-lg p-0.5">
          <button
            onClick={() => setActiveTab('visionBoard')}
            className={`px-3 py-1 rounded-lg text-sm transition-colors ${
              activeTab === 'visionBoard' ? 'bg-blue-500 text-white' : 'text-gray-300 hover:bg-gray-700'
            }`}
          >
            {titles.visionBoard}
          </button>
          <button
            onClick={() => setActiveTab('addGoal')}
            className={`px-3 py-1 rounded-lg text-sm transition-colors ${
              activeTab === 'addGoal' ? 'bg-green-500 text-white' : 'bg-green-500 text-white hover:bg-green-600'
            }`}
          >
            +
          </button>
          <button
            onClick={() => setActiveTab('goals')}
            className={`px-3 py-1 rounded-lg text-sm transition-colors ${
              activeTab === 'goals' ? 'bg-blue-500 text-white' : 'text-gray-300 hover:bg-gray-700'
            }`}
          >
            {titles.goals}
          </button>
          <button
            onClick={() => setActiveTab('roadmap')}
            className={`px-3 py-1 rounded-lg text-sm transition-colors ${
              activeTab === 'roadmap' ? 'bg-blue-500 text-white' : 'text-gray-300 hover:bg-gray-700'
            }`}
          >
            {titles.roadmap}
          </button>

        </div>
      </div>

      {activeTab === 'goals' ? (
        <div className="flex justify-center">
          <div className="flex flex-col">
            {goals.map((goal, index) => (
              <span key={index} className="hover:bg-gray-700 p-1 rounded cursor-pointer transition-colors">
                {goal}
              </span>
            ))}
          </div>
        </div>
      ) : activeTab === 'visionBoard' ? (
        <VisionBoard />
      ) : activeTab === 'addGoal' ? (
        <AddGoal />
      ) : (
        <Roadmap />
      )}
    </main>
  );
}
