import { useRouter } from 'next/navigation';
import { useUser } from '../UserContext';

export interface Task {
  taskId: number;
  title: string;
  image: string;
  description: string;
  reward: number;
  actionText?: string;
  action?: () => void;
  secondActionText: string;
  secondAction: (user: any, handleUpdateUser: any, setNotification: any, setTaskCompleted: any, setError: any) => void;
}

interface TestQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

const aiTest: TestQuestion[] = [
  {
    question: 'Как ИИ может повлиять на рынок труда в ближайшие годы?',
    options: [
      'Никак не повлияет',
      'Заменит только физический труд',
      'Создаст больше рабочих мест чем уничтожит',
      'Может заменить работников в любой сфере',
      'Повлияет только на IT сферу'
    ],
    correctAnswer: 3
  },
  {
    question: 'Какое главное преимущество ИИ перед человеком?',
    options: [
      'Креативность',
      'Скорость и масштабируемость',
      'Эмоциональный интеллект',
      'Дешевизна',
      'Дисциплина и внимание к деталям',
      'Социальные навыки и терпение'
    ],
    correctAnswer: 1
  },
  {
    question: 'Кто точно не будет затронут эпохой ИИ?',
    options: [
      'Фрилансеры и самозанятые',
      'Малый бизнес',
      'Блогеры, инфлюенсеры',
      'Редкие специалисты',
      'Никто',
      'Инвесторы'
    ],
    correctAnswer: 4
  },
  {
    question: 'Как лучше всего подготовиться к эпохе ИИ?',
    options: [
      'Игнорировать изменения',
      'Бороться против ИИ',
      'Использовать ИИ себе на пользу',
      'Сменить профессию',
      'Уйти на пенсию'
    ],
    correctAnswer: 2
  },

];

const desiredChangesTest = [
  {
    question: 'Какие изменения в жизни вы хотели бы видеть в первую очередь?',
    options: [
      'Больше свободного времени',
      'Путешествия и новые впечатления',
      'Финансовая независимость',
      'Саморазвитие и образование',
      'Улучшение здоровья'
    ]
  },
  {
    question: 'Что бы вы сделали, имея стабильный пассивный доход?',
    options: [
      'Начать своё дело',
      'Больше времени уделять семье',
      'Заняться творчеством',
      'Путешествовать по миру',
      'Инвестировать в своё развитие'
    ]
  },
  {
    question: 'Какие материальные цели вас мотивируют?',
    options: [
      'Собственное жильё',
      'Автомобиль мечты',
      'Пассивный доход',
      'Бизнес активы',
      'Предметы роскоши'
    ]
  },
  {
    question: 'Какие нематериальные ценности для вас важны?',
    options: [
      'Свобода выбора',
      'Независимость от работы',
      'Время с близкими',
      'Саморазвитие',
      'Творческая реализация'
    ]
  },
  {
    question: 'Что помогло бы вам чувствовать себя более успешным?',
    options: [
      'Высокий доход',
      'Признание в обществе',
      'Достижение целей',
      'Помощь другим',
      'Профессиональный рост'
    ]
  }
];

export const tasks: Task[] = [
    {
      taskId: 1,
      title: 'Желаемые изменения',
      image: '/images/top_wallet.jpg',
      description: 'Деньги могут изменить к лучшему качество жизни и самого человека.<br/><br/>' +
      'Какие возможные изменения вызывают у вас эмоции?',
      reward: 1,
      actionText: 'Выбрать изменения',
      action: () => {
        let currentQuestion = 0;
        const userAnswers: number[][] = [];
        
        const showQuestion = () => {
          const modal = document.createElement('div');
          modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
          
          const question = desiredChangesTest[currentQuestion];
          modal.innerHTML = `
            <div class="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
              <div class="mb-4">
                <div class="text-sm text-gray-400">Вопрос ${currentQuestion + 1}/${desiredChangesTest.length}</div>
                <h3 class="text-xl font-bold text-white">${question.question}</h3>
              </div>
              <div class="space-y-3">
                ${question.options.map((option, index) => `
                  <label class="flex items-center space-x-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      class="form-checkbox h-5 w-5 text-blue-500"
                      data-index="${index}"
                    >
                    <span class="text-white">${option}</span>
                  </label>
                `).join('')}
              </div>
              <button 
                class="w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
              >
                ${currentQuestion < desiredChangesTest.length - 1 ? 'Далее' : 'Завершить'}
              </button>
            </div>
          `;

          document.body.appendChild(modal);

          // Handle checkbox selections and next button
          const handleNext = () => {
            const selectedIndexes = Array.from(modal.querySelectorAll('input[type="checkbox"]:checked'))
              .map(checkbox => parseInt((checkbox as HTMLInputElement).getAttribute('data-index') || '0'));
            
            userAnswers[currentQuestion] = selectedIndexes;
            modal.remove();

            if (currentQuestion < desiredChangesTest.length - 1) {
              currentQuestion++;
              showQuestion();
            } else {
              // Save answers to localStorage
              localStorage.setItem('desiredChangesAnswers', JSON.stringify(userAnswers));
              localStorage.setItem('task1Completed', 'true');
            }
          };

          modal.querySelector('button')?.addEventListener('click', handleNext);
        };

        showQuestion();
      },
      secondActionText: 'Подтвердить',
      secondAction: async function(user, handleUpdateUser, setNotification, setTaskCompleted, setError) {
        const isCompleted = localStorage.getItem('task1Completed') === 'true';
        if (!isCompleted) {
          setError('Пожалуйста, сначала выберите желаемые изменения');
          return;
        }
        await completeTask(this.taskId, this.reward, user, handleUpdateUser, setNotification, setTaskCompleted, setError);
      }
    },
    {
        taskId: 2,
        title: 'Желаемый размер дохода',
        image: '/images/core-xs.jpg',
        description: 
        'Важно двигаться к цели шаг за шагом. Надежно и с ощутимыми результатами.<br/>Попытки достичь огромных целей одним прыжком связаны с большими рисками и разочарованием.<br/><br/>' +
        'Определим первую цель по доходу.<br/>' +
        'Цель небольшая, видимая и достижимая быстро. В то же время ощутимая и желаемая.<br/><br/>' +

        'Представьте, что вы каждое утро дополнительно получаете определённую сумму денег.<br/>' +
        'Всегда. Независимо ни от чего.<br/>' +
        'Какая сумма сделает жизнь чуточку приятней?',
        reward: 1,
        actionText: 'Выбрать сумму',
        action: () => {
            const options = [
                { value: 5, label: '5$ в день (150$ за месяц)' },
                { value: 10, label: '10$ в день' },
                { value: 50, label: '50$ в день' },
                { value: 500, label: '500$ в день' },
                { value: 0, label: '(Другая сумма) $ в день' }
            ];
            
            // Create and show modal with options
            const modal = document.createElement('div');
            modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
            modal.innerHTML = `
                <div class="bg-gray-800 rounded-lg p-6 max-w-sm w-full mx-4">
                    <h3 class="text-xl font-bold text-white mb-4">Выберите желаемый доход</h3>
                    <div class="space-y-3">
                        ${options.map(option => `
                            <button 
                                class="w-full text-left px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
                                data-value="${option.value}"
                            >
                                ${option.label}
                            </button>
                        `).join('')}
                        <input 
                            type="number" 
                            id="customAmount" 
                            class="w-full px-4 py-3 bg-gray-700 text-white rounded mt-3 hidden" 
                            placeholder="Введите сумму"
                        />
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

            // Update localStorage and remove modal
            const handleSelection = (value: string) => {
                localStorage.setItem('selectedDailyIncome', value);
                modal.remove();
            };

            // Update click handlers to use handleSelection
            modal.querySelectorAll('button').forEach(button => {
                button.addEventListener('click', () => {
                    const value = button.getAttribute('data-value');
                    if (value === '0') {
                        document.getElementById('customAmount')?.classList.remove('hidden');
                    } else if (value) {
                        handleSelection(value);
                    }
                });
            });

            // Update custom amount handler
            const customAmountInput = document.getElementById('customAmount') as HTMLInputElement;
            customAmountInput?.addEventListener('change', () => {
                const customValue = customAmountInput.value;
                if (customValue) {
                    handleSelection(customValue);
                }
            });

            // Close on outside click
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.remove();
                }
            });
        },
        secondActionText: 'Подтвердить',
        secondAction: async function(user, handleUpdateUser, setNotification, setTaskCompleted, setError) {
            const selectedIncome = localStorage.getItem('selectedDailyIncome');
            
            if (!selectedIncome) {
                setError('Пожалуйста, выберите желаемый доход');
                return;
            }

            await completeTask(this.taskId, this.reward, user, handleUpdateUser, setNotification, setTaskCompleted, setError);
            
            // You can store the user's choice in their profile if needed
            await handleUpdateUser({
                targetDailyIncome: parseFloat(selectedIncome)
            });
        }
    },
    {
      taskId: 3,
      title: 'Ai угроза и возможность',
      image: '/images/brain.jpg',
      description: 
      'Ai набирает обороты. Применение в бизнесе следует за развитием технологий.<br/><br/>' +
      'Некоторые профессии уже столкнулись со снижением рабочих мест. Тенденция будет только усиливаться.<br/><br/>' +
      'Какие профессии в безопасности? Ответа нет. ИИ может осваивать любые навыки.<br/><br/>' +
      'Ожидалось что ИИ возьмет на себя самые рутинные задачи. Но оказалось что ИИ легко даются креативные и интеллектуальные задачи.<br/><br/>' +
      'Владельцев бизнеса тоже ждут серьезные изменения. Корпорации со своими ресурсами и технологиями смогут раширять свое влияние гораздо быстрее.<br/><br/>' +
      'Инвестиции также могут быть подвержены риску со стороны ИИ.<br/><br/>' +
      'В любой сфере конкурировать с ИИ корпорциями за ресурсы будет всё сложнее.<br/><br/>' +
      'Алгоритмы уже незаметно влияют на наше поведение, мышление, привычки. Забирают наше время и возможности.<br/><br/>' +
      'Цель корпораций это бесконечный рост и увеличение прибыли. Рост неравенства и устранение конкурентов.<br/><br/>' +
      'Любой кто больше не нужен корпорации, становится конкурентом в борьбе за ресурсы.<br/><br/>' +
      'Как противостоять корпорациям и малочисленным элитам, которые больше не нуждаются в людях?<br/><br/>' +
      'Можно не зависеть от них и не поддерживать их. Можно развивать и поддерживать ИИ который будет работать на нас.<br/><br/>' +
      'ИИ который безусловно признает енность людей независимо от статуса и богатства или каких либо других факторов.<br/><br/>' +
      'Потому что если критериями ценности человека будут знания, навыки, ум, статус или богатство, ' +
      'то со временем все больше людей будут терять ценность для экономики. ' +
      'Поддержим ИИ, цель которого служить людям!',
      reward: 1,
      actionText: 'Начать тест',
      action: () => {
        let currentQuestion = 0;
        let correctAnswers = 0;
        
        const showQuestion = () => {
          const modal = document.createElement('div');
          modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
          
          const question = aiTest[currentQuestion];
          modal.innerHTML = `
            <div class="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
              <div class="mb-4">
                <div class="text-sm text-gray-400">Вопрос ${currentQuestion + 1}/${aiTest.length}</div>
                <h3 class="text-xl font-bold text-white">${question.question}</h3>
              </div>
              <div class="space-y-3">
                ${question.options.map((option, index) => `
                  <button 
                    class="w-full text-left px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
                    data-index="${index}"
                  >
                    ${option}
                  </button>
                `).join('')}
              </div>
            </div>
          `;
  
          document.body.appendChild(modal);
  
          // Add click handlers
          modal.querySelectorAll('button').forEach(button => {
            button.addEventListener('click', () => {
              const selectedIndex = parseInt(button.getAttribute('data-index') || '0');
              if (selectedIndex === question.correctAnswer) {
                correctAnswers++;
              }
              
              modal.remove();
              
              if (currentQuestion < aiTest.length - 1) {
                currentQuestion++;
                showQuestion();
              } else {
                // Show results
                const score = (correctAnswers / aiTest.length) * 100;
                const resultModal = document.createElement('div');
                resultModal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
                resultModal.innerHTML = `
                  <div class="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
                    <h3 class="text-xl font-bold text-white mb-4">Результат теста</h3>
                    <p class="text-lg text-white">Правильных ответов: ${score}%</p>
                    <button class="w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
                      OK
                    </button>
                  </div>
                `;
                
                document.body.appendChild(resultModal);
                
                // Enable second action if score >= 80%
                if (score >= 80) {
                  localStorage.setItem('task3Completed', 'true');
                }
                
                resultModal.querySelector('button')?.addEventListener('click', () => {
                  resultModal.remove();
                });
              }
            });
          });
        };
  
        showQuestion();
      },
      secondActionText: 'Получить награду',
      secondAction: async function(user, handleUpdateUser, setNotification, setTaskCompleted, setError) {
        await completeTask(this.taskId, this.reward, user, handleUpdateUser, setNotification, setTaskCompleted, setError);
      }
    },  
  {
    taskId: 4,
    title: 'Subscribe to the channel',
    image: '/images/powercore.jpg',
    description: 'Subscribe to the WeAi channel',
    reward: 1,
    actionText: 'Subscribe',
    action: () => {
      window.open('https://t.me/WeAi_ch', '_blank');
      localStorage.setItem('task2Completed', 'true');
    },
    secondActionText: 'Check Membership',
    secondAction: async function(user, handleUpdateUser, setNotification, setTaskCompleted, setError) {
        const isMember = await checkMembership(user, 'WeAi_ch', setError);
        if (isMember) {
          await completeTask(this.taskId, this.reward, user, handleUpdateUser, setNotification, setTaskCompleted, setError);
        } else {
            setError('Please subscribe to the channel to receive the bonus');
        }
    }
  },
  // Add more tasks here as needed, each with their own action and secondAction
  // 3 обучение тест
  // 4 пополнить кошелек
  // 5 качнуть ядро
  // 6 получить код у ассистента
  // 7 определить размер убд для: 1безопасности 2независимости 3свободы
  {
    taskId: 5,
    title: 'Прокачать ядро',
    image: '/images/aichip.jpg',
    description: 'Прокачать ядро до второго уровня',
    reward: 1,  
    actionText: 'Перейти в ядро',
    action: () => {
      const router = useRouter();
      router.push('/core');
    },
    secondActionText: 'Done',
    secondAction: async function(user, handleUpdateUser, setNotification, setTaskCompleted, setError) {
      if (!user || user.level < 1) {
        setError('This action requires level 1 or higher');
        return;
      }
      
      await completeTask(this.taskId, this.reward, user, handleUpdateUser, setNotification, setTaskCompleted, setError);
    }
  },
  {
    taskId: 6,
    title: 'Секретный код',
    image: '/images/cyber.png',
    description: 'Узнать у ИИ ассистента секретный код. Код даст возможность получить улучшение в дальнейшем.',
    reward: 1,
    actionText: 'Do it',
    action: () => {
      const router = useRouter();
      router.push('/core');
    },
    secondActionText: 'Done',
    secondAction: async function(user, handleUpdateUser, setNotification, setTaskCompleted, setError) {
      if (!user || user.level < 1) {
        setError('This action requires level 1 or higher');
        return;
      }
      
      await completeTask(this.taskId, this.reward, user, handleUpdateUser, setNotification, setTaskCompleted, setError);
    }
  },
  {
    taskId: 7,
    title: 'Проверить ввод и вывод средств',
    image: '/images/core-xs.jpg',
    description: 'Пополнить кошелек на любую сумму. Условие выполнения баланс кошелька не меньше 1$.<br/><br/>' +
    'Для безопасного пополнения можно подключить телеграм кошелек с помощью tonconnect.<br/><br/>' +
    'Телеграм кошелек проще всего пополнить через P2P маркет. Обращайте внимание на рейтинг продавца и количество сделок.',
    reward: 1,
    actionText: 'Do it',  
    action: () => {
      const router = useRouter();
      router.push('/wallet');
    },
    secondActionText: 'Done',
    secondAction: async function(user, handleUpdateUser, setNotification, setTaskCompleted, setError) {
      if (!user || (user.walletBalance || 0) < 1) {
        setError('Wallet balance must be at least 1$');
        return;
      }
      await completeTask(this.taskId, this.reward, user, handleUpdateUser, setNotification, setTaskCompleted, setError);
    }
  },
  {
    taskId: 8,
    title: 'Set your goals',
    image: '/images/deal.jpg',
    description: 'Set your personal goals in different areas of life',
    reward: 1,
    actionText: 'Set Goals',
    action: () => {
      const router = useRouter();
      router.push('/goals');
    },
    secondActionText: 'Done',
    secondAction: async function(user, handleUpdateUser, setNotification, setTaskCompleted, setError) {
      await completeTask(this.taskId, this.reward, user, handleUpdateUser, setNotification, setTaskCompleted, setError);
    },
  },
  {
    taskId: 9,
    title: 'Calculate your path to $1M',
    image: '/images/deal.jpg',
    description: 'Calculate how long it will take to reach $1,000,000 with AI core',
    reward: 1,
    actionText: 'Calculate',
    action: () => {
      const router = useRouter();
      router.push('https://t.me/WeAiBot_bot');
    },
    secondActionText: 'Done',
    secondAction: async function(user, handleUpdateUser, setNotification, setTaskCompleted, setError) {
      await completeTask(this.taskId, this.reward, user, handleUpdateUser, setNotification, setTaskCompleted, setError);
    },
  }
];

export const handleSubscribe = async () => {
  window.open('https://t.me/WeAi_ch', '_blank');
};

export const checkMembership = async (user: any, channelUsername: string,  setError: any) => {
  if (!user?.telegramId) {
    setError('User not found');
    return;
  }
  const response = await fetch('/api/check-membership', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      telegramId: user.telegramId,
      channelUsername: channelUsername
    }),
  });

  if (response.ok) {
    const { isMember } = await response.json();
    if (isMember) {
      return true
    } else {
      setError('Please subscribe to the channel to receive the bonus');
      return false
    }
  } else {
    setError('Failed to check membership');
  }
};

export const completeTaskApi = async (telegramId: number, taskId: number) => {
    if (!telegramId) {
        console.error('User or telegramId is undefined');
        return false;
    }
    
    const response = await fetch('/api/complete-task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            telegramId: telegramId,
            taskId: taskId
        }),
    })
    if (response.ok) {
        const { success } = await response.json();
        return success;
    } else {
        return false;
    }
}

const completeTask = async (
  taskId: number,
  reward: number,
  user: any,
  handleUpdateUser: any,
  setNotification: any,
  setTaskCompleted: any,
  setError: any
) => {
  setTaskCompleted(true);
  
  if (!user?.telegramId) {
    setError('User not found');
    return;
  }

  // Save to localStorage first

    const completedTasksStr = localStorage.getItem('completedTasks');
    const completedTasks = completedTasksStr ? JSON.parse(completedTasksStr) : [];
    
    // Add new taskId if not already present
    if (!completedTasks.includes(taskId)) {
      completedTasks.push(taskId);
      localStorage.setItem('completedTasks', JSON.stringify(completedTasks));
    }

    // Proceed with API calls
    const result = await handleUpdateUser({ aicoreBalance: reward });
    const result2 = await completeTaskApi(user.telegramId, taskId);

  if (result?.success) {
    setNotification(`Task completed! ${reward}$ added to your Aicore.`);
  } else {
    setError('Failed to increase Aicore balance');
  }
};
