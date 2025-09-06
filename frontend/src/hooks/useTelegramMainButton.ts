import { useEffect } from "react";

export function useTelegramMainButton({
  text,
  onClick,
  visible = true,
}: {
  text: string;
  onClick: () => void;
  visible?: boolean;
}) {
  useEffect(() => {
    const MainButton = window.Telegram?.WebApp?.MainButton;
    if (!MainButton) return;

    MainButton.text = text;

    if (visible) {
      MainButton.show();
    } else {
      MainButton.hide();
    }

    MainButton.onClick(onClick);

    return () => {
      // hide и очистка обработчика
      MainButton.hide();
    };
  }, [text, onClick, visible]);
}
