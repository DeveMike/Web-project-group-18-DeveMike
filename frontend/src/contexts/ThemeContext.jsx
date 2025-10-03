import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/api';

// Teemojen määrittelyt
const themes = {
  default: {
    name: 'Oletus',
    colors: {
      primary: '#3498db',
      secondary: '#2c3e50',
      accent: '#e74c3c',
      background: '#ffffff',
      surface: '#f8f9fa',
      text: '#212529',
      textLight: '#6c757d'
    },
    fonts: {
      heading: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      body: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }
  },
  hacker: {
    name: 'Hacker',
    colors: {
      primary: '#00ff6a',
      secondary: '#00e676',
      accent: '#1aff9c',
      background: '#000000',
      surface: 'rgba(7, 12, 9, 0.85)',
      text: '#00ff6a',
      textLight: '#00e676'
    },
    fonts: {
      heading: "'Courier New', Courier, monospace",
      body: "'Courier New', Courier, monospace"
    },
    special: {
      backgroundComponent: 'LetterGlitch'
    }
  },
  liquidEther: {
    name: 'Liquid',
    colors: {
      primary: '#B19EEF',
      secondary: '#5227FF',
      accent: '#FF9FFC',
      background: '#000000',
      surface: '#1a1a1a',
      text: '#FFFFFF',
      textLight: '#E0E0E0'
    },
    fonts: {
      heading: "'Courier New', Courier, monospace",
      body: "'Courier New', Courier, monospace"
    },
    special: {
      backgroundComponent: 'LiquidEther'
    }
  }
};

// Context luonti
const ThemeContext = createContext();

// Theme Provider komponentti
export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('default');

  useEffect(() => {
    const user = authService.getCurrentUser();
    const initialTheme = user?.theme || localStorage.getItem('anonymousTheme') || 'default';
    if (themes[initialTheme]) {
      setCurrentTheme(initialTheme);
    }
  }, []);

  // Teeman vaihto funktio
  const changeTheme = (themeName) => {
    if (themes[themeName]) {
      setCurrentTheme(themeName);
      if (authService.isAuthenticated()) {
        authService.updateTheme(themeName).catch(error => {
          console.error("Failed to update theme:", error);
          // Optionally revert theme change on UI if API call fails
        });
      } else {
        localStorage.setItem('anonymousTheme', themeName);
      }
    }
  };

  // Päivitä CSS-muuttujat kun teema vaihtuu
  useEffect(() => {
    const theme = themes[currentTheme];
    if (!theme) return; // Varmistus, jos teemaa ei löydy

    const root = document.documentElement;
    
    // Aseta värit
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
    
    // Aseta fontit
    Object.entries(theme.fonts).forEach(([key, value]) => {
      root.style.setProperty(`--font-${key}`, value);
    });

    // Aseta special-ominaisuudet
    if (theme.special) {
      Object.entries(theme.special).forEach(([key, value]) => {
        root.style.setProperty(`--special-${key}`, value);
      });
    } else {
      // Puhdista vanhat special-ominaisuudet, jos vaihdetaan teemaan, jolla ei niitä ole
      // Esimerkki: poista --special-background-image
    }
    
    // Lisää teema-attribuutti body-elementtiin
    document.body.setAttribute('data-theme', currentTheme);
  }, [currentTheme]);

  const value = {
    currentTheme,
    changeTheme,
    themes,
    activeTheme: themes[currentTheme]
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook teeman käyttöön
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

