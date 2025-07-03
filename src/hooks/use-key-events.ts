import { useEffect } from "react";

type Keys =
  | "ArrowLeft"
  | "ArrowRight"
  | "ArrowDown"
  | "ArrowUp"
  | "Enter"
  | "Escape";

export function useKeysEvents(callback: (event: Keys) => void) {
  useEffect(() => {
    const keyboardEvents = (event: KeyboardEvent) => {
      const keyName = event.key as Keys;
      callback(keyName);
    };

    document.addEventListener("keydown", keyboardEvents);

    return () => {
      document.removeEventListener("keydown", keyboardEvents);
    };
  });
}
