'use client';

import { useLanguage } from '../LanguageContext';

const goalTranslations = {
  ru: ['🏋️ здоровье', '💑 отношения', '⏳ время', '🎯 цели', '💰 деньги', '💼 карьера', '🏠 дом', '🏖 путешествия', '🎨 хобби', '👪 семья', '🧠 навыки', '🏖 привычки', '💪 фитнес', '🏠 имущество', '💁‍♂️ персональное', '👨‍👩‍👦‍👦 социальное', '🗺 карта желаний', '🔮 рекомендации!'],
  en: ['🏋️ health', '💑 relationships', '⏳ time', '🎯 goals', '💰 money', '💼 career', '🏠 home', '🏖 travel', '🎨 hobbies', '👪 family', '🧠 skills', '🏖 habbits', '💪 fitness', '🏠 property', '💁‍♂️ personal', '👨‍👩‍👦‍👦 social', '🗺 wish map', '🔮 recommendations']
};

const pageTitle = {
  ru: 'Цели',
  en: 'Goals'
};

export default function GoalsPage() {
  const { language } = useLanguage();
  const goals = goalTranslations[language as keyof typeof goalTranslations] || goalTranslations.en;
  const title = pageTitle[language as keyof typeof pageTitle] || pageTitle.en;

  return (
    <main className="bg-dark-blue text-white h-screen flex flex-col">
      <h1 className="text-4xl font-bold text-center mb-8">{title}</h1>
      <div className="flex justify-center">
        <div className="flex flex-col">
          {goals.map((goal, index) => (
            <span key={index} className="hover:bg-gray-700 p-1 rounded cursor-pointer transition-colors">
              {goal}
            </span>
          ))}
        </div>
      </div>
    </main>
  );
}
