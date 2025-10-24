import { createContext, useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

// AppContext
const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const { t, i18n } = useTranslation();
  const currentLanguage = localStorage.getItem("i18nextLng")
  // Language options
  const languages = [
    { code: 'ru', name: 'Русский', flag: '/images/russia.png' },
    { code: 'en', name: 'English', flag: '/images/us.png' }
  ]

  const currentLang = languages.find(lang => lang.code === currentLanguage)


  const handleChange = (langCode) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem('language', langCode);
  }
  const navigate = useNavigate()

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

  const [clientPage, setClientPage] = useState(false)

  // Loginga o'tish uchun




  const handleNavigateLogin = () => {
    localStorage.setItem("login", true)
    navigate('/login')
  }
  const cancelLogin = () => {
    localStorage.removeItem("login")
    navigate('/')
  }
  const handleLogin = ()=>{
    localStorage.removeItem("login")
    localStorage.setItem("logged",true)
    navigate('/transactions')
  }



  return (
    <AppContext.Provider value={{
      theme, toggleTheme,
      handleChange, currentLanguage,
      t, navigate, clientPage, setClientPage,
      handleNavigateLogin, currentLang, languages,
      cancelLogin,handleLogin
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useGlobalContext = () => {
  return useContext(AppContext)
}