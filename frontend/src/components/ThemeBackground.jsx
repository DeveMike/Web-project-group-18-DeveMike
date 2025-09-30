import React from "react";
import { useTheme } from "../contexts/ThemeContext";
import LetterGlitch from "./backgrounds/LetterGlitch";

export default function ThemeBackground() {
  const { activeTheme } = useTheme();

  if (activeTheme.special?.backgroundComponent === 'LetterGlitch') {
    return (
      <LetterGlitch
        active={true}
        fontSize={14}
        glitchSpeed={50}
        density={0.08}
        colors={['#00ff6a', '#00e676', '#1aff9c']}
        background="#000000"
      />
    );
  }

  return null;
}
