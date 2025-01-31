import { useState } from "react";

export const useToggleMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen((prev) => !prev);
  };
  const closeIfOpen = () => {
    if (!isOpen) {toggleMenu;}
  }

  return { isOpen, toggleMenu, closeIfOpen };
};