import { useState } from 'react';
import { useLanguage } from '../LanguageContext';

interface RoadmapItemProps {
  name: string;
  date: string;
  description: string;
}

const roadmapTranslations = {
  ru: {
    title: 'Дорожная карта',
    items: [
        
    //   {
    //     name: 'Беспроцентный кредит',
    //     date: 'январь 2025',
    //     description: 'Кредитные карты беспроцентные. Партнерские программы банков. График перекидывания средств. <br/>' +
    //     'Беспроцентный кредит на 1000000 рублей. <br/>' +

    //   },
      {
        name: 'Внутренние транзакции',
        date: '2025',
        description: 'Возможность переводить средства контактам.<br/> Возможность создавать счета на оплату.<br/> История всех операций пользователя.<br/> Блокчейн.<br/> Чеки.'
      },
      {
        name: 'ИИ-ассистент по целям',
        date: '2025',
        description: 'Обучение ИИ-ассистента выполнять цели пользователя.<br/> Декомпозиция цели на задачи.<br/> Использование лучших практик.<br/> Нетворкинг. Создание связей. <br/> Менеджмент ресурсов.'
      },
      {
        name: 'Доходы от партнерских программ',
        date: '2025',
        description: '100% доходов получают пользователи.'
      },
      {
        name: 'Планы',
        date: '2025',
        description: 'Пожизненная гарантия дохода, привязка ядра. Анонимное биометрическое подтверждение личности. <br/>' +
        'Френдли интерфейс. Перенос потребления контента на платформу. <br/>' +
        'На других платформах пользователь тратит время на просмотр контента, но зарабатывают на нем другие. С WeAi Пользователь может сам монетезировать свое время помощью Ai-mate/companion. <br/>' +
        'ИИ платежи по всему миру.  Любые банки и платежные системы. <br/>' +
        'Децентрализованное управление платформой. Проверяемое голосование. <br/>' +
        'Базовый доход от платформы. <br/>' +
        'Физические товары. 2026 <br/>'
      }
    ]
  }, 
  en: {
    title: 'Roadmap',
    items: [
      {
        name: 'Internal Transactions',
        date: '2025',
        description: 'Ability to transfer funds to contacts.<br/> Ability to create invoices.<br/> User transaction history.<br/> Blockchain.<br/> Receipts.'
      },
      {
        name: 'AI Assistant for Goals',
        date: '2025',
        description: 'Training the AI assistant to achieve user goals.<br/> Decomposition of goals into tasks.<br/> Use of best practices.<br/> Networking. Creating connections.<br/> Resource management.'
      },
      {
        name: 'Income from partner programs',
        date: '2025',
        description: '100% of income goes to users.'
      },
      {
        name: 'Plans',
        date: '2025',
        description: 'Lifetime income guarantee, binding core. Anonymous biometric identity verification. <br/>' +
        'Frendly interface. Transfer of content consumption to the platform. <br/>' +
        'Other platforms users spend time on content, but others earn from it. With WeAi, the user can monetize their time themselves using Ai-mate/companion. <br/>' +
        'AI payments worldwide. Any banks and payment systems. <br/>' +
        'Decentralized platform management. Verifiable voting. <br/>' +
        'Basic income from the platform. <br/>' +
        'Physical goods. 2026 <br/>'
      }
    ]
  }
};

function RoadmapItem({ name, date, description }: RoadmapItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="mb-2">
      <div 
        className="flex justify-between items-center p-3 bg-gray-800 rounded cursor-pointer hover:bg-gray-700"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span>{name}</span>
        <span className="text-gray-400">{date}</span>
      </div>
      {isExpanded && (
        <div 
          className="p-3 bg-gray-900 rounded-b text-gray-300"
          dangerouslySetInnerHTML={{ __html: description }}
        />
      )}
    </div>
  );
}

export default function Roadmap() {
  const { language } = useLanguage();
  const roadmap = roadmapTranslations[language as keyof typeof roadmapTranslations] || roadmapTranslations.en;

  return (
    <div>
      <h2 className="text-3xl font-bold text-center mb-6">{roadmap.title}</h2>
      <div className="max-w-2xl mx-auto w-full">
        {roadmap.items.map((item, index) => (
          <RoadmapItem
            key={index}
            name={item.name}
            date={item.date}
            description={item.description}
          />
        ))}
      </div>
    </div>
  );
} 