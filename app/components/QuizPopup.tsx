import React, { useState } from 'react';

interface QuizPopupProps {
  isOpen: boolean;
  onClose: () => void;
  questions: {
    question: string;
    options: string[];
    correctAnswer: number;
  }[];
  reward: string;
}

const QuizPopup: React.FC<QuizPopupProps> = ({ isOpen, onClose, questions, reward }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);

  if (!isOpen) return null;

  const handleAnswerSelect = (index: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = index;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Quiz completed
      const correctAnswers = selectedAnswers.filter((answer, index) => answer === questions[index].correctAnswer).length;
      alert(`Quiz completed! You got ${correctAnswers} out of ${questions.length} correct. Reward: ${reward}`);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-purple-900 p-6 rounded-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Daily Quiz</h2>
        <p className="mb-4">{questions[currentQuestion].question}</p>
        <div className="space-y-2">
          {questions[currentQuestion].options.map((option, index) => (
            <label key={index} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedAnswers[currentQuestion] === index}
                onChange={() => handleAnswerSelect(index)}
                className="form-checkbox h-5 w-5 text-purple-600"
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
        <button
          onClick={handleNext}
          className="mt-4 bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
        >
          {currentQuestion < questions.length - 1 ? 'Next' : 'Finish'}
        </button>
      </div>
    </div>
  );
};

export default QuizPopup;
