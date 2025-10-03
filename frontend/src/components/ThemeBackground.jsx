import React from "react";
import { useTheme } from "../contexts/ThemeContext";
import LetterGlitch from "./backgrounds/LetterGlitch";
import LiquidEther from "./backgrounds/LiquidEther"; // Tuo LiquidEther

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
  } else if (activeTheme.special?.backgroundComponent === 'LiquidEther') {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1
      }}>
        <LiquidEther style={{ width: '100%', height: '100%' }} />
      </div>
    );
  }

  return null;
}
