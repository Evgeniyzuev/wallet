import { useEffect } from 'react'

export default function BackButton() {
  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.BackButton.show();
      tg.BackButton.onClick(() => {
        window.history.back();
      });

      return () => {
        tg.BackButton.hide();
        tg.BackButton.offClick();
      };
    }
  }, []);

  return null;
}
