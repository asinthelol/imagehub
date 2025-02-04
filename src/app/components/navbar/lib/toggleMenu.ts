import { useState } from "react";

export const useToggleMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen((prev) => !prev);
  };
  const closeIfOpen = () => {
    if (!isOpen) {
      setIsOpen(false);
    }
  }

  return { isOpen, toggleMenu, closeIfOpen };
};