import { createContext, useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

// AppContext
const AppContext = createContext();

export const AppProvider = ({ children }) => {
  
  
  const [openIndex, setOpenIndex] = useState(null);
  

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
  const handleLogin = async (email, password) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data.message || 'Login failed')
        return
      }
      localStorage.setItem('token', data.token)
      localStorage.removeItem("login")
      localStorage.setItem("logged", true)
      navigate('/transactions')
    } catch (err) {
      alert('Network error')
    }
  }

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
      theme, toggleTheme,
      handleChange, currentLanguage,
      t, navigate, clientPage, setClientPage,
      handleNavigateLogin, currentLang, languages,
      cancelLogin, handleLogin,faqData,toggleAccordion,
      openIndex
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useGlobalContext = () => {
  return useContext(AppContext)
}