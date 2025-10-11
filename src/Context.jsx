import  { createContext, useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';

// AppContext
const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const { t, i18n } = useTranslation();
	const currentLanguage = localStorage.getItem("i18nextLng")
	const handleChange = (langCode) => {
		i18n.changeLanguage(langCode);
		localStorage.setItem('language', langCode);
	}


  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <AppContext.Provider value={{ theme, toggleTheme,handleChange,currentLanguage,t }}>
      {children}
    </AppContext.Provider>
  );
};

export const useGlobalContext = () =>{
    return useContext(AppContext)
}