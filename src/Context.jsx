import { createContext, useState, useEffect, useContext } from 'react';
import { apiFetch } from './api';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  // Auth State
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // UI State
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });
  const [openIndex, setOpenIndex] = useState(null);
  const [selPayment, setSelPayment] = useState("currency");
  const [addCardModal,setAddCardModal] = useState(false)

  // Language State
  const currentLanguage = localStorage.getItem("i18nextLng");
  const languages = [
    { code: 'ru', name: 'Русский', flag: '/images/russia.png' },
    { code: 'en', name: 'English', flag: '/images/us.png' }
  ];
  const currentLang = languages.find(lang => lang.code === currentLanguage);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');

      if (token) {
        try {
          // Retry small number of times to absorb transient network/CORS blips
          const fetchProfileWithRetry = async (retries = 2) => {
            for (let i = 0; i <= retries; i++) {
              try {
                const res = await apiFetch('/api/profile', {
                  method: 'GET',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                  },
                  mode: 'cors',
                  cache: 'no-store'
                });
                return res;
              } catch (err) {
                if (i === retries) throw err;
                await new Promise(r => setTimeout(r, 500));
              }
            }
          };

          const res = await fetchProfileWithRetry();

          if (res.ok) {
            const userData = await res.json();
            setUser(userData);
            setIsAuthenticated(true);
          } else if (res.status === 401 || res.status === 403) {
            // Token invalid
            localStorage.removeItem('token');
            localStorage.removeItem('logged');
            setIsAuthenticated(false);
          } else {
            // Non-auth server error or CORS issue: keep session, avoid forced logout
            setIsAuthenticated(true);
          }
        } catch (error) {
          console.error('Auth verification failed:', error);
          // Network/CORS failure: keep token and session to avoid redirect loop
          setIsAuthenticated(true);
        }
      } else {
        setIsAuthenticated(false);
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // Theme Effect
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Language Handler
  const handleChange = (langCode) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem('language', langCode);
  };

  // Theme Toggle
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Navigate to Login
  const handleNavigateLogin = () => {
    localStorage.setItem("login", "true");
    navigate('/login');
  };

  // Cancel Login Flow
  const cancelLogin = () => {
    localStorage.removeItem("login");
    navigate('/');
  };

  // Login Handler
  const handleLogin = async (email, password) => {
    try {
      const res = await apiFetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        try {
          const { toast } = await import('react-toastify');
          toast.error(data.message || t('toast.login.error'));
        } catch { }
        return false;
      }

      // Set auth state
      localStorage.setItem('token', data.token);
      localStorage.setItem("logged", "true");
      localStorage.removeItem("login");
      
      setUser(data.user || { email });
      setIsAuthenticated(true);

      try {
        const { toast } = await import('react-toastify');
        toast.success(t('toast.login.success'));
      } catch { }

      navigate('/transactions');
      return true;
    } catch (err) {
      console.error('Login error:', err);
      try {
        const { toast } = await import('react-toastify');
        toast.error(t('toast.networkError'));
      } catch { }
      return false;
    }
  };

  // Logout Handler
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('logged');
    setUser(null);
    setIsAuthenticated(false);
    navigate('/');
    
    try {
      const { toast } = import('react-toastify');
      toast.then(module => module.toast.info(t('toast.logout.success')));
    } catch { }
  };

  // FAQ Data
  const faqData = [
    {
      question: "Как отправить деньги?",
      answer: "Pul o'tkazmasini amalga oshirish uchun ilovaga kiring, 'Pul yuborish' bo'limini tanlang, qabul qiluvchining ma'lumotlarini kiriting (telefon raqami yoki karta raqami), summani ko'rsating va to'lovni tasdiqlang."
    },
    {
      question: "Какая комиссия взимается за перевод?",
      answer: "Komissiya summasi o'tkazma turiga va miqdoriga bog'liq. Ichki o'tkazmalar uchun 0.5% dan 2% gacha, xalqaro o'tkazmalar uchun esa 2% dan 5% gacha komissiya olinadi. Aniq summani o'tkazma yuborishdan oldin ko'rishingiz mumkin."
    },
    {
      question: "Сколько денег получит адресат?",
      answer: "Qabul qiluvchi siz yuborgan summadan komissiya miqdorini ayirib tashlangandan keyingi summani oladi. Agar siz to'liq summani yubormoqchi bo'lsangiz, komissiyani o'zingiz to'lash variantini tanlashingiz mumkin."
    },
    {
      question: "Сколько времени занимает перевод?",
      answer: "O'tkazma tezligi yo'nalishga bog'liq. Bir bank ichidagi o'tkazmalar bir necha daqiqada, boshqa banklarga 10 daqiqadan 24 soatgacha, xalqaro o'tkazmalar esa 1-5 ish kuni ichida bajariladi."
    },
    {
      question: "Какие лимиты установлены на переводы?",
      answer: "Kunlik limit tasdiqlangan foydalanuvchilar uchun 50 million so'mgacha, oylik limit esa 200 million so'mgacha. Tasdiqlanmagan hisoblar uchun limitlar ancha pastroq bo'ladi. Xalqaro o'tkazmalar uchun alohida limitlar amal qiladi."
    }
  ];

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <AppContext.Provider value={{
      // Auth
      user,
      isAuthenticated,
      isLoading,
      handleLogin,
      handleLogout,
      
      // Navigation
      navigate,
      handleNavigateLogin,
      cancelLogin,
      
      // Theme
      theme,
      toggleTheme,
      
      // Language
      handleChange,
      currentLanguage,
      currentLang,
      languages,
      t,
      
      // UI State
      openIndex,
      toggleAccordion,
      selPayment,
      setSelPayment,
      addCardModal,
      setAddCardModal,
      
      // Data
      faqData
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useGlobalContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useGlobalContext must be used within AppProvider');
  }
  return context;
};