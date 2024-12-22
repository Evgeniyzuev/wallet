export interface Task {
  taskId: number;
  title: string;
  image: string;
  description: string | ((user?: any) => string);
  reward: number;
  actionText?: string;
  action?: (navigate: (path: string) => void) => void;
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
      taskId: -1,
      title: 'Качать ядро',
      image: '/images/powercore.jpg',
      description: 'Пополните ядро на любую сумму.<br/><br/>' +
      'Бонус до 5$.<br/><br/>',
      reward: 0,
      actionText: 'Пополнить',
      action: () => {
        window.open('/balance', '_blank');
      },
      secondActionText: 'OK',
      secondAction: () => {}
    },
    {
      taskId: -2,
      title: 'Пригласить рефералов',
      image: '/images/cyber.png',
      description: () => {
        const paidCount = localStorage.getItem('paidReferrals') || '0';
        return `Пригласите рефералов и получите 1$ за каждого.<br/><br/>` +
              `Оплаченные рефералы: ${paidCount}`;
    },
    reward: 1,
    actionText: 'Пригласить',
    action: () => {
      window.open('/friends', '_blank');
    },
    secondActionText: 'Проверить рефералов',
    secondAction: async function(user, handleUpdateUser, setNotification, setTaskCompleted, setError) {
      if (!user?.telegramId) {
        setError('Пользователь не найден');
        return;
      }
      try {
        const response = await fetch('/api/check-referrals', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            telegramId: user.telegramId
          })
        });
        
        if (response.ok) {
          const { newReferrals, totalReferrals } = await response.json();
          if (newReferrals > 0) {
            localStorage.setItem('paidReferrals', totalReferrals.toString());
            const newBalance = (user.aicoreBalance || 0) + newReferrals;
            setNotification(`🚀 Ядро +${newReferrals}$!`);
            await handleUpdateUser({ 
              aicoreBalance: { increment: newReferrals },
              paidReferrals: totalReferrals
            });
            user.aicoreBalance = newBalance;
            setNotification(`Получено ${newReferrals}$ за новых рефералов!`);
          } else {
            setNotification('Новых рефералов не найдено');
          }
        }
      } catch (error) {
        console.error('Error checking referrals:', error);
        setError('Ошибка при проверке рефералов');
      }
    }
    },
    {
      taskId: 1,
      title: 'Желаемые изменения',
      image: '/images/top_wallet.jpg',
      description: 'Деньги могут изменить человека к лучшему и повысить качество жизни.<br/><br/>' +
      'Какие возможные изменения откликаются у вас и вызывают эмоции?',
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
        title: 'Первая цель',
        image: '/images/core-xs.jpg',
        description: 
        'Важно двигаться к цели шаг за шагом. Надежно и с ощутимыми результатами.<br/>Попытки достичь больших целей одним прыжком связаны с большими рисками и разочарованием.<br/><br/>' +
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
      'К��кие профессии в безопасности? Ответа нет. ИИ может осваивать любые навыки.<br/><br/>' +
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
    title: 'Подписаться на канал',
    image: '/images/powercore.jpg',
    description: 'Подпишитесь на канал WeAi_ch',
    reward: 1,
    actionText: 'Подписаться',
    action: () => {
      window.open('https://t.me/WeAi_ch', '_blank');
      localStorage.setItem('task2Completed', 'true');
    },
    secondActionText: 'Проверить подписку',
    secondAction: async function(user, handleUpdateUser, setNotification, setTaskCompleted, setError) {
        const isMember = await checkMembership(user, 'WeAi_ch', setError);
        if (isMember) {
          await completeTask(this.taskId, this.reward, user, handleUpdateUser, setNotification, setTaskCompleted, setError);
        } else {
            setError('Пожалуйста, подпишитесь на канал для получения награды');
        }
    }
  },
  // Add more tasks here as needed, each with their own action and secondAction
  // 3 обучение тест
  // 4 пополнить кошелек
  // 5 качнуть ядро
  // 6 получить код у ассистента
  // 7 определить размер убд для: 1безопасности 2независимости 3свобод��
  {
    taskId: 5,
    title: 'Прокачать ядро',
    image: '/images/aichip.jpg',
    description: 'Прокачать ядро до третьего уровня',
    reward: 1,  
    secondActionText: 'Готово',
    secondAction: async function(user, handleUpdateUser, setNotification, setTaskCompleted, setError) {
      if (!user || user.level < 3) {
        setError('Это действие требует уровня 3 или выше');
        return;
      }
      
      await completeTask(this.taskId, this.reward, user, handleUpdateUser, setNotification, setTaskCompleted, setError);
    }
  },
  {
    taskId: 6,
    title: 'Пригласить реферала',
    image: '/images/cyber.png',
    description: () => {
      const paidCount = localStorage.getItem('paidReferrals') || '0';
      return `Пригласите рефералов и получите 1$ за каждого.<br/><br/>` +
             `Оплаченные рефералы: ${paidCount}`;
    },
    reward: 1,
    actionText: 'Пригласить',
    action: () => {
      window.open('/friends', '_blank');
    },
    secondActionText: 'Проверить рефералов',
    secondAction: async function(user, handleUpdateUser, setNotification, setTaskCompleted, setError) {
      if (!user?.telegramId) {
        setError('Пользователь не найден');
        return;
      }
      // ... rest of the check referrals logic ...
    }
  },
  {
    taskId: 7,
    title: 'Проверить ввод и вывод средств',
    image: '/images/core-xs.jpg',
    description: 'Перейти в кошелек и пополнить баланс на любую сумму. Условие выполнения баланс кошелька не меньше 1$.<br/><br/>' +
    'Для безопасного пополнения можно подключить телеграм кошелек с помощью tonconnect.<br/><br/>' +
    'Телеграм кошелек проще всего пополнить через P2P маркет. Обращайте внимание на рейтинг продавца и количество сделок.',
    reward: 1,
    // actionText: 'Сделать',  
    // action: () => {
    //     window.open('/wallet', '_blank');
    // },
    secondActionText: 'Готово',
    secondAction: async function(user, handleUpdateUser, setNotification, setTaskCompleted, setError) {
      if (!user || (user.walletBalance || 0) < 1) {
        setError('Баланс кошелька должен быть не меньше 1$');
        return;
      }
      await completeTask(this.taskId, this.reward, user, handleUpdateUser, setNotification, setTaskCompleted, setError);
    }
  },
  {
    taskId: 8,
    title: 'Вопрос времени',
    image: '/images/deal.jpg',
    description: 'Рассчитайте, сколько времени потребуется для достижения желаемой суммы капитала с помощью ИИ Ядра<br/><br/>' +
    '1. Перейти в ядро<br/>' +
    '2. Выбрать цель (написать желаемую стоимость вашего ядра в $)<br/>' +
    '3. Выбрать размер ежедневных наград (сколько заданий выполнять в день)<br/>' +
    '4. Нажать кнопку "Рассчитать <br/><br/>' +
    'Ниже появится время до цели.<br/>' +
    'Можно рассчитать для стартового ядра другого размера.' +
    // вставить картинку с расчетом
    '<img src="/images/task8.jpg" alt="Task calculation example" class="w-full rounded-lg my-4" />' +
    'Выше показан размер ядра через любое количество лет и соответствующий ежедневный доход.<br/><br/>' +
    'Сложный процент работает эффективнее с каждым годом.<br/>' +
    'Даже без выполнения заданий, ядро гарантированно приносит 26% годовых.<br/>'+
    'Размер ядра удваивается каждые 3 года и увеличивается в 10 раз за 10 лет.<br/><br/>' +
    'Меняйте параметры и смотрите как меняется срок<br/>' +
    '✅Выполняйте задания и получайте ежедневные награды в выбранном количестве чтобы достичь цели в срок',
    reward: 1,
    // actionText: 'Рассчитать',
    // action: () => {
    //     window.open('/goals', '_blank');
    // },
    secondActionText: 'Готово',
    secondAction: async function(user, handleUpdateUser, setNotification, setTaskCompleted, setError) {
      await completeTask(this.taskId, this.reward, user, handleUpdateUser, setNotification, setTaskCompleted, setError);
    },
  },
  {
    taskId: 9,
    title: 'Пополнить ядро',
    image: '/images/deal.jpg',
    description: 'Пополнить ядро на любую сумму не меньше 1$.<br/><br/>' +
    'Условие выполнения: <br/><br/>' +
    '.<br/><br/>',
    reward: 1,
    // actionText: 'Рассчитать',
    // action: () => {
    //   window.open('https://t.me/WeAiBot_bot', '_blank');
    // },
    secondActionText: 'Готово',
    secondAction: async function(user, handleUpdateUser, setNotification, setTaskCompleted, setError) {
      await completeTask(this.taskId, this.reward, user, handleUpdateUser, setNotification, setTaskCompleted, setError);
    },
  },
  {
    taskId: 10,
    title: 'Точка А',
    image: '/images/deal.jpg',
    description: 'Чем заниматься если вопрос денег решен?<br/><br/>' +
    'ответить себе на вопросы: <br/><br/>' +
    'Чем я занимаюсь сейчас?<br/>' +
    'Хочу ли я сменить/найти новое дело?<br/>' +
    'Что заряжает меня энергией?<br/>' +
    'Чем я могу заниматься?<br/>' +
    'Определить интересы?<br/>' +
    'Выбрать интересное дело?<br/>' +
    'Пройти профессиональное обучение?<br/><br/>',
    reward: 1,
    // actionText: 'Рассчитать',
    // action: () => {
    //   window.open('https://t.me/WeAiBot_bot', '_blank');
    // },
    secondActionText: 'Готово',
    secondAction: async function(user, handleUpdateUser, setNotification, setTaskCompleted, setError) {
      await completeTask(this.taskId, this.reward, user, handleUpdateUser, setNotification, setTaskCompleted, setError);
    },
  },
  {
    taskId: 11,
    title: 'личное знакомство',
    image: '/images/deal.jpg',
    description: 'Ядро не может уменьшаться, оно постоянно растет.<br/><br/>' +
    'Ядро нельзя передать, отнять, украсть, потерять и т.д. <br/><br/>' +
    'Если привязать его к человеку лично, то оно всегда будет с ним.<br/><br/>' +
    'Пройти подтверждение личности. Это анонимно и безопасно.<br/><br/>' +
    '<br/><br/>',
    reward: 1,
    // actionText: 'Рассчитать',
    // action: () => {
    //   window.open('https://t.me/WeAiBot_bot', '_blank');
    // },
    secondActionText: 'Готово',
    secondAction: async function(user, handleUpdateUser, setNotification, setTaskCompleted, setError) {
      await completeTask(this.taskId, this.reward, user, handleUpdateUser, setNotification, setTaskCompleted, setError);
    },
  },
  {
    taskId: 12,
    title: 'Создать канал в ТГ',
    image: '/images/deal.jpg',
    description: 'Постить мысли об WeAi и как ИИ изменит мир.<br/><br/>' +
    'Личная трансформация и инсайты <br/><br/>' +
    'Взаимоподписки.<br/><br/>',
    reward: 1,
    // actionText: 'Рассчитать',
    // action: () => {
    //   window.open('https://t.me/WeAiBot_bot', '_blank');
    // },
    secondActionText: 'Готово',
    secondAction: async function(user, handleUpdateUser, setNotification, setTaskCompleted, setError) {
      await completeTask(this.taskId, this.reward, user, handleUpdateUser, setNotification, setTaskCompleted, setError);
    },
  },
  
];

// export const handleSubscribe = async () => {
//   window.open('https://t.me/WeAi_ch', '_blank');
// };

export const checkMembership = async (user: any, channelUsername: string,  setError: any) => {
  if (!user?.telegramId) {
    setError('Пользователь не найден');
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
      setError('Пожалуйста, подпишитесь на ��анал для получения награды');
      return false
    }
  } else {
    setError('Не удалось проверить подписку');
  }
};

export const completeTaskApi = async (telegramId: number, taskId: number) => {
    if (!telegramId) {
        console.error('Пользователь или telegramId не определены');
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
    setError('Пользователь не найден');
    return;
  }

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
    setNotification(`Задание выполнено! ${reward}$ добавлено в ваш Aicore.`);
  } else {
    setError('Не удалось увеличить баланс Aicore');
  }
};

export interface PermanentTask {
  taskId: number;
  title: string;
  image: string;
  reward: number;
  description: string | ((user?: any) => string);
  actionText?: string;
  action?: (navigate: (path: string) => void) => void;
  secondActionText?: string;
  secondAction?: (user: any, handleUpdateUser: any, setNotification: any, setTaskCompleted: any, setError: any) => void;
}

// export const permanentTasks: PermanentTask[] = [
 
// ];

