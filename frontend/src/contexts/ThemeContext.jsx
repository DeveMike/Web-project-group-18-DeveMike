import React, { createContext, useState, useContext, useEffect } from 'react';

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
  got: {
    name: 'Game of Thrones',
    colors: {
      primary: '#8B4513',
      secondary: '#1a1a1a',
      accent: '#FFD700',
      background: '#0a0a0a',
      surface: '#1a1a1a',
      text: '#d4af37',
      textLight: '#a08d5d'
    },
    fonts: {
      heading: "'Cinzel', serif",
      body: "'Crimson Text', serif"
    },
    special: {
      backgroundImage: 'linear-gradient(rgba(0,0,0,0.9), rgba(0,0,0,0.9))',
      borderStyle: '2px solid #8B4513'
    }
  },
  hacker: {
    name: 'Hacker',
    colors: {
      primary: '#00ff6a',
      secondary: '#00e676',
      accent: '#1aff9c',
      background: '#000000',
      surface: '#0a0a0a',
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
  }
  };

// Context luonti
const ThemeContext = createContext();

// Theme Provider komponentti
export const ThemeProvider = ({ children }) => {
  // Haetaan tallennettu teema localStoragesta
  const [currentTheme, setCurrentTheme] = useState(() => {
    const savedTheme = localStorage.getItem('userTheme');
    return themes[savedTheme] ? savedTheme : 'default';
  });

  // Teeman vaihto funktio
  const changeTheme = (themeName) => {
    if (themes[themeName]) {
      setCurrentTheme(themeName);
      localStorage.setItem('userTheme', themeName);
    }
  };

  // Päivitä CSS-muuttujat kun teema vaihtuu
  useEffect(() => {
    const theme = themes[currentTheme];
    const root = document.documentElement;
    
    // Aseta värit
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
    
    // Aseta fontit
    Object.entries(theme.fonts).forEach(([key, value]) => {
      root.style.setProperty(`--font-${key}`, value);
    });
    
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

