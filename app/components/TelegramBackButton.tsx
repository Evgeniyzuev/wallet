import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        BackButton: {
          show: () => void;
          hide: () => void;
          onClick: (callback: () => void) => void;
        };
      };
    };
  }
}

const TelegramBackButton: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    const tg = window.Telegram?.WebApp;

    if (tg && tg.BackButton) {
      tg.BackButton.show();
      tg.BackButton.onClick(() => {
        router.back();
      });

      return () => {
        tg.BackButton.hide();
      };
    }
  }, [router]);

  return null;
};

export default TelegramBackButton;
