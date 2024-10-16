import { useEffect } from 'react'

export default function BackButton() {
  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.BackButton.show();
      tg.BackButton.onClick(() => {
        // window.history.back();
        // go to home page
        window.location.href = '/';
      });

      return () => {
        tg.BackButton.hide();
        tg.BackButton.offClick();
      };
    }
  }, []);

  return null;
}
