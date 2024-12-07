export interface Task {
  taskId: number;
  title: string;
  image: string;
  description: string;
  reward: number;
  actionText?: string; // Make actionText optional
  action?: () => void; // Make action optional
  secondActionText: string;
  secondAction: (user: any, handleUpdateUser: any, setNotification: any, setTaskCompleted: any, setError: any) => void;
  isSecondActionEnabled?: () => boolean; // Add new optional property
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
      'Физическая сила',
      'Социальные навыки'
    ],
    correctAnswer: 1
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
  }
];

export const tasks: Task[] = [
    {
        taskId: 1,
        title: 'Желаемый размер дохода',
        image: '/images/core-xs.jpg',
        description: 
        'Давайте сначала определим первую цель по доходу.<br/><br/>' +
        'Представьте, что вы каждое утро получаете определённую сумму денег.<br/><br/>' +
        'Всегда. Независимо ни от чего.<br/><br/>' +
        'Какая сумма минимально необходима, чтобы улучшить вашу жизнь?',
        reward: 1,
        actionText: 'Выбрать сумму',
        action: () => {
            const options = [
                { value: 10, label: '10$ в день' },
                { value: 30, label: '30$ в день' },
                { value: 100, label: '100$ в день' },
                { value: 300, label: '300$ в день' },
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
        },
        isSecondActionEnabled: () => {
            return localStorage.getItem('selectedDailyIncome') !== null;
        },
    },
  {
    taskId: 2,
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
    },
    isSecondActionEnabled: () => {
        return localStorage.getItem('task2Completed') === 'true';
    }
  },
  // Add more tasks here as needed, each with their own action and secondAction
  // 3 обучение тест
  // 4 пополнить кошелек
  // 5 качнуть ядро
  // 6 получить код у ассистента
  // 7 определить размер убд для: 1безопасности 2независимости 3свободы
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
    'Любой кто больше не ну��ен корпорации, становится конкурентом в борьбе за ресурсы.<br/><br/>' +
    'Как противостоять корпорациям и малочисленным элитам, которые больше не нуждаются в людях?<br/><br/>' +
    'Можно не зависеть от них и не поддерживать их. Можно развивать и поддерживать ИИ который будет работать на нас.<br/><br/>' +
    'ИИ который безусловно признает ценность людей независимо от статуса и богатства или каких либо других факторов.<br/><br/>' +
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
    },
    isSecondActionEnabled: () => {
      return localStorage.getItem('task3Completed') === 'true';
    }
  },
  {
    taskId: 4,
    title: 'Top up the wallet',
    image: '/images/top_wallet.jpg',
    description: 'Top up the wallet',
    reward: 1,
    actionText: 'Do it',
    action: () => {
      window.open('https://t.me/WeAi_ch', '_blank');
    },
    secondActionText: 'Done',
    secondAction: async function(user, handleUpdateUser, setNotification, setTaskCompleted, setError) {
        await completeTask(this.taskId, this.reward, user, handleUpdateUser, setNotification, setTaskCompleted, setError);
    },
  },
  {
    taskId: 5,
    title: 'Upgrade the core',
    image: '/images/aichip.jpg',
    description: 'Upgrade the core',
    reward: 1,  
    actionText: 'Do it',
    action: () => {
      window.open('https://t.me/WeAi_ch', '_blank');
    },
    secondActionText: 'Done',
    secondAction: async function(user, handleUpdateUser, setNotification, setTaskCompleted, setError) {
      await completeTask(this.taskId, this.reward, user, handleUpdateUser, setNotification, setTaskCompleted, setError);
    },
  },
  {
    taskId: 6,
    title: 'Get the code from the assistant',
    image: '/images/cyber.png',
    description: 'Get the code from the assistant',
    reward: 1,
    actionText: 'Do it',
    action: () => {
      window.open('https://t.me/WeAi_ch', '_blank');
    },
    secondActionText: 'Done',
    secondAction: async function(user, handleUpdateUser, setNotification, setTaskCompleted, setError) {

      await completeTask(this.taskId, this.reward, user, handleUpdateUser, setNotification, setTaskCompleted, setError);
    },
  },
  {
    taskId: 7,
    title: 'UBI size',
    image: '/images/core-xs.jpg',
    description: 'What size of the UBI for:/n1. safety /n2. independence /n3. freedom',
    reward: 1,
    actionText: 'Do it',  
    action: () => {
      window.open('https://t.me/WeAi_ch', '_blank');
    },
    secondActionText: 'Done',
    secondAction: async function(user, handleUpdateUser, setNotification, setTaskCompleted, setError) {
      await completeTask(this.taskId, this.reward, user, handleUpdateUser, setNotification, setTaskCompleted, setError);
    },
  },
  {
    taskId: 8,
    title: 'Set your goals',
    image: '/images/deal.jpg',
    description: 'Set your personal goals in different areas of life',
    reward: 1,
    actionText: 'Set Goals',
    action: () => {
      window.open('/goals', '_blank');
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
      window.open('https://t.me/WeAiBot_bot', '_blank');
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
