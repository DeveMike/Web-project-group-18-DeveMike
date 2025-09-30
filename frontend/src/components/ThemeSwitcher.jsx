import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import '../styles/theme-styles.css';

const ThemeSwitcher = () => {
  const { currentTheme, changeTheme, themes } = useTheme();

  return (
    <div className="theme-switcher">
      <label htmlFor="theme-select" className="theme-label">
        Teema:
      </label>
      <select 
        id="theme-select"
        value={currentTheme} 
        onChange={(e) => changeTheme(e.target.value)}
        className="theme-select"
      >
        <option value="default">Oletus</option>
        <option value="got">Game of Thrones</option>
        <option value="hacker">Hacker</option>
      </select>
    </div>
  );
};

export default ThemeSwitcher;