import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import './ThemeSwitcher.css'; // Tuo uusi CSS-tiedosto

const ThemeSwitcher = () => {
  const { currentTheme, changeTheme, themes } = useTheme();

  return (
    <div className="theme-switcher-container">
      <label htmlFor="theme-select" className="theme-switcher-label">
        Teema:
      </label>
      <select 
        id="theme-select"
        value={currentTheme} 
        onChange={(e) => changeTheme(e.target.value)}
        className="theme-switcher-select"
      >
        {Object.entries(themes).map(([themeKey, theme]) => (
          <option key={themeKey} value={themeKey}>{theme.name}</option>
        ))}
      </select>
    </div>
  );
};

export default ThemeSwitcher;