'use client';

import { useLanguage } from '../LanguageContext';
import { useState } from 'react';
import Roadmap from './Roadmap';

const goalTranslations = {
  ru: ['🏋️ здоровье', '💑 отношения', '⏳ время', '🎯 цели', '💰 деньги', '💼 карьера', '🏠 дом', '🏖 путешествия', '🎨 хобби', '👪 семья', '🧠 навыки', '🏖 привычки', '💪 фитнес', '🏠 имущество', '💁‍♂️ персональное', '👨‍👩‍👦‍👦 социальное', '🗺 карта желаний', '🔮 рекомендации!'],
  en: ['🏋️ health', '💑 relationships', '⏳ time', '🎯 goals', '💰 money', '💼 career', '🏠 home', '🏖 travel', '🎨 hobbies', '👪 family', '🧠 skills', '🏖 habbits', '💪 fitness', '🏠 property', '💁‍♂️ personal', '👨‍👩‍👦‍👦 social', '🗺 wish map', '🔮 recommendations']
};

const pageTitle = {
  ru: {
    goals: 'Цели',
    roadmap: 'Дорожная карта'
  },
  en: {
    goals: 'Goals',
    roadmap: 'Roadmap'
  }
};

export default function GoalsPage() {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'goals' | 'roadmap'>('goals');
  const goals = goalTranslations[language as keyof typeof goalTranslations] || goalTranslations.en;
  const titles = pageTitle[language as keyof typeof pageTitle] || pageTitle.en;

  return (
    <main className="bg-dark-blue text-white min-h-screen flex flex-col p-4">
      <div className="flex justify-center mb-8">
        <div className="flex space-x-4 bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('goals')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'goals' ? 'bg-blue-500 text-white' : 'text-gray-300 hover:bg-gray-700'
            }`}
          >
            {titles.goals}
          </button>
          <button
            onClick={() => setActiveTab('roadmap')}
            className={`px-4 py-2 rounded-lg transition-colors ${
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
      ) : (
        <Roadmap />
      )}
    </main>
  );
}
