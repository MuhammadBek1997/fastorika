import { createContext, useState, useEffect, useContext } from 'react';
import { apiFetch, getUserCards } from './api';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, appleProvider } from './firebaseConfig';

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
  // Cards refresh signal (increment to force reloads)
  const [cardsRefreshKey, setCardsRefreshKey] = useState(0)
  const refreshCards = () => setCardsRefreshKey(prev => prev + 1)
  // Cards state
  const [cards, setCards] = useState([])
  const [cardsLoading, setCardsLoading] = useState(false)

  const loadUserCards = async (uid) => {
    const userId = uid || user?.userId
    if (!userId) return
    try {
      setCardsLoading(true)
      const data = await getUserCards(userId)
      setCards(Array.isArray(data) ? data : [])
    } catch (err) {
      console.warn('Load cards error:', err?.message || err)
      try {
        const { toast } = await import('react-toastify')
        toast.error(t('toast.networkError'))
      } catch {}
    } finally {
      setCardsLoading(false)
    }
  }




  // ================= Profile State (moved from Profile.jsx) =================
  const now = new Date()
  const [profileIsSelDate, setProfileIsSelDate] = useState('')
  const [profileIsDateOpen, setProfileIsDateOpen] = useState(false)
  const [profileCurMonth, setProfileCurMonth] = useState(new Date(now.getFullYear(), now.getMonth()))
  const [profileIsMonthDropOpen, setProfileIsMonthDropOpen] = useState(false)
  const [profileIsYearDropOpen, setProfileIsYearDropOpen] = useState(false)
  const [profileIsStateDropOpen, setProfileIsStateDropOpen] = useState(false)
  const [profileCurState, setProfileCurState] = useState('')
  const [profileCountryId, setProfileCountryId] = useState(null)
  const [profileBackendCountryName, setProfileBackendCountryName] = useState('')
  const [profileUserId, setProfileUserId] = useState(null)
  const [profileCountriesList, setProfileCountriesList] = useState([])
  const [profileFirstName, setProfileFirstName] = useState('')
  const [profileLastName, setProfileLastName] = useState('')
  const [profilePhone, setProfilePhone] = useState('')
  const [profileEmail, setProfileEmail] = useState('')
  const [profileInitial, setProfileInitial] = useState(null)
  const [profileStatus, setProfileStatus] = useState({ type: null, message: '' })

  const splitName = (full) => {
    const parts = (full || '').trim().split(/\s+/).filter(Boolean)
    const first = parts[0] || ''
    const last = parts.length > 1 ? parts.slice(1).join(' ') : ''
    return { firstName: first, lastName: last }
  }
  const isoToDisplay = (iso) => {
    if (!iso) return ''
    const [y, m, d] = String(iso || '').split('-')
    if (!y || !m || !d) return ''
    return `${String(d).padStart(2, '0')}.${String(m).padStart(2, '0')}.${y}`
  }

  const loadProfile = async () => {
    const token = sessionStorage.getItem('token')
    if (!token) return
    try {
      const res = await apiFetch('user/getOne', {
        headers: { Authorization: 'Bearer ' + token }
      })
      const data = await res.json()
      if (!res.ok) {
        console.warn('Profile load failed:', data?.message)
        setProfileStatus({ type: 'error', message: data?.message || '' })
        setProfileInitial({
          email: '', firstName: '', lastName: '', phone: '', country: '', birthDate: '', countryId: null
        })
        return
      }
      setProfileEmail(data.email || '')
      setProfileUserId(data?.userId ?? null)
      const parsed = splitName(data.name || '')
      setProfileFirstName(parsed.firstName)
      setProfileLastName(parsed.lastName)
      setProfilePhone(data.phone || '')
      const backendCountry = data?.countryResponse?.name ?? ''
      setProfileCurState(backendCountry)
      setProfileCountryId(data?.countryResponse?.countryId ?? null)
      setProfileBackendCountryName(backendCountry)
      const displayDate = isoToDisplay(data?.dateOfBirth)
      setProfileIsSelDate(displayDate)
      setProfileInitial({
        email: data.email || '',
        userId: data?.userId ?? null,
        firstName: parsed.firstName,
        lastName: parsed.lastName,
        phone: data.phone || '',
        country: backendCountry,
        birthDate: displayDate,
        countryId: data?.countryResponse?.countryId ?? null,
        backendCountryName: backendCountry
      })
      setProfileStatus({ type: null, message: '' })
    } catch (e) {
      console.warn('Profile load network error')
      setProfileStatus({ type: 'error', message: 'Profilni yuklashda tarmoq xatosi' })
      setProfileInitial({
        email: '', userId: null, firstName: '', lastName: '', phone: '', country: '', birthDate: '', countryId: null, backendCountryName: ''
      })
    }
  }

  const loadCountries = async () => {
    try {
      const res = await apiFetch('country/all', { method: 'GET' })
      const data = await res.json()
      if (!res.ok) {
        console.warn('Countries load failed:', data?.message)
        setProfileCountriesList([])
        return
      }
      const normalized = Array.isArray(data) ? data.map(c => ({
        countryId: c.countryId ?? c.id ?? null,
        name: c.name ?? ''
      })).filter(c => c.name) : []
      setProfileCountriesList(normalized)
    } catch (e) {
      console.warn('Countries load network error')
      setProfileCountriesList([])
    }
  }

  // Load profile and countries when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadProfile()
      loadCountries()
    }
  }, [isAuthenticated])

  // Language State
  const currentLanguage = localStorage.getItem("i18nextLng");
  const languages = [
    { code: 'ru', name: 'Русский', flag: 'https://img.icons8.com/color/96/russian-federation-circular.png' },
    { code: 'en', name: 'English', flag: 'https://img.icons8.com/color/96/usa-circular.png' }
  ];
  const currentLang = languages.find(lang => lang.code === currentLanguage);

  // Check authentication on mount - LOCALHOST MOCK VERSION (API disabled)
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      const logged = localStorage.getItem('logged');

      if (token && logged === 'true' && userStr) {
        try {
          const userData = JSON.parse(userStr);
          setUser(userData);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Failed to parse user data:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('logged');
          setIsAuthenticated(false);
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
    navigate('/login');
  };

  // Cancel Login Flow
  const cancelLogin = () => {
    navigate('/');
  };

  // Login Handler - LOCALHOST MOCK VERSION (API disabled)
  const handleLogin = async (email, password) => {
    try {
      // Simple validation
      if (!email || !password) {
        try {
          const { toast } = await import('react-toastify');
          toast.error('Email va parol kiriting');
        } catch { }
        return false;
      }

      // Mock user data
      const mockUserData = {
        id: 1,
        userId: 1,
        email: email,
        name: email.split('@')[0] || 'User',
        phone: '+998901234567',
        role: 'USER',
        status: 'ACTIVE'
      };

      // Store mock token in localStorage
      const mockToken = `mock_token_${Date.now()}`;
      localStorage.setItem('token', mockToken);
      localStorage.setItem('logged', 'true');
      localStorage.setItem('user', JSON.stringify(mockUserData));

      setUser(mockUserData);
      setIsAuthenticated(true);

      try {
        const { toast } = await import('react-toastify');
        toast.success('Muvaffaqiyatli kirdingiz (LocalStorage mode)');
      } catch { }

      navigate('/transactions');
      return true;
    } catch (err) {
      console.error('Login error:', err);
      try {
        const { toast } = await import('react-toastify');
        toast.error('Kirishda xatolik');
      } catch { }
      return false;
    }
  };


// Google Login Handler - DISABLED (LocalStorage mode)
const handleGoogleLogin = async () => {
  try {
    const { toast } = await import('react-toastify');
    toast.info('Google login vaqtincha o\'chirilgan (LocalStorage mode)');
  } catch { }
  return false;
};

// Apple Login - DISABLED (LocalStorage mode)
const handleAppleLogin = async () => {
  try {
    const { toast } = await import('react-toastify');
    toast.info('Apple login vaqtincha o\'chirilgan (LocalStorage mode)');
  } catch { }
  return false;
};


  // Logout Handler
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
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



  let countries = [
    {
      flag: 'https://img.icons8.com/color/96/russian-federation-circular.png',
      name:"Russia"
    },
    {
      flag:'https://img.icons8.com/color/96/uzbekistan-circular.png',
      name:"Uzbekistan"
    },
    {
      flag: 'https://img.icons8.com/color/96/usa-circular.png',
      name:"USA"
    },
  ]


let transactions = [
    {
      id: 1,
      date: "2023-08-15",
      time: "10:30 AM",
      amount: 1000,
      amountInOther: 850,
      currency: "USD",
      currencyInOther: "UZS",
      status: "success",
      type: "send",
      description: "Payment for services",
      senderState:"Uzbekistan",
      sanderName: "John Doe",
      senderCardNumber: "4567-8901-2345-6789",
      receiverState:"Russia",
      receiverName: "Jane Doe",
      receiverCardNumber: "1234-5678-9012-3456",
      receiverPhoneNumber: "+998901234567",
      transactionFee: 0,
    },
    {
      id: 2,
      date: "2023-08-16",
      time: "02:15 PM",
      amount: 500,
      amountInOther: 425,
      currency: "USD",
      currencyInOther: "UZS",
      status: "cancelled",
      type: "receive",
      description: "Refund for services",
      senderState:"Russia",
      sanderName: "Jane Doe",
      senderCardNumber: "1234-5678-9012-3456",
      receiverState:"Uzbekistan",
      receiverName: "John Doe",
      receiverCardNumber: "4567-8901-2345-6789",
      receiverPhoneNumber: "+998901234567",
      transactionFee: 0,
    },
    {
      id: 3,
      date: "2023-08-17",
      time: "08:45 AM",
      amount: 200,
      amountInOther: 170,
      currency: "USD",
      currencyInOther: "UZS",
      status: "waiting",
      type: "send",
      description: "Payment for services",
      senderState:"USA",
      sanderName: "John Doe",
      senderCardNumber: "4567-8901-2345-6789",
      receiverState:"Russia",
      receiverName: "Jane Doe",
      receiverCardNumber: "1234-5678-9012-3456",
      receiverPhoneNumber: "+998901234567",
      transactionFee: 0,
    },
    {
      id: 4,
      date: "2023-08-18",
      time: "11:30 PM",
      amount: 300,
      amountInOther: 260,
      currency: "USD",
      currencyInOther: "UZS",
      status: "support",
      type: "receive",
      description: "Payment for services",
      senderState:"Russia",
      sanderName: "Jane Doe",
      senderCardNumber: "1234-5678-9012-3456",
      receiverState:"Uzbekistan",
      receiverName: "John Doe",
      receiverCardNumber: "4567-8901-2345-6789",
      receiverPhoneNumber: "+998901234567",
      transactionFee: 0,
    },
    {
      id: 5,
      date: "2023-08-19",
      time: "09:20 AM",
      amount: 750,
      amountInOther: 640,
      currency: "USD",
      currencyInOther: "UZS",
      status: "success",
      type: "send",
      description: "Payment for products",
      senderState:"Uzbekistan",
      sanderName: "Alice Smith",
      senderCardNumber: "2345-6789-0123-4567",
      receiverState:"USA",
      receiverName: "Bob Johnson",
      receiverCardNumber: "8901-2345-6789-0123",
      receiverPhoneNumber: "+998901234568",
      transactionFee: 0,
    },
    {
      id: 6,
      date: "2023-08-20",
      time: "03:45 PM",
      amount: 1200,
      amountInOther: 1020,
      currency: "USD",
      currencyInOther: "UZS",
      status: "waiting",
      type: "receive",
      description: "Transfer from friend",
      senderState:"Russia",
      sanderName: "Maria Ivanova",
      senderCardNumber: "3456-7890-1234-5678",
      receiverState:"Uzbekistan",
      receiverName: "Kamol Karimov",
      receiverCardNumber: "7890-1234-5678-9012",
      receiverPhoneNumber: "+998901234569",
      transactionFee: 0,
    },
    {
      id: 7,
      date: "2023-08-21",
      time: "01:10 PM",
      amount: 450,
      amountInOther: 385,
      currency: "USD",
      currencyInOther: "UZS",
      status: "cancelled",
      type: "send",
      description: "Cancelled order",
      senderState:"USA",
      sanderName: "Mike Brown",
      senderCardNumber: "4567-8901-2345-6789",
      receiverState:"Russia",
      receiverName: "Elena Petrova",
      receiverCardNumber: "9012-3456-7890-1234",
      receiverPhoneNumber: "+998901234570",
      transactionFee: 0,
    },
    {
      id: 8,
      date: "2023-08-22",
      time: "07:30 AM",
      amount: 880,
      amountInOther: 750,
      currency: "USD",
      currencyInOther: "UZS",
      status: "support",
      type: "receive",
      description: "Under review",
      senderState:"Uzbekistan",
      sanderName: "Aziz Rahimov",
      senderCardNumber: "5678-9012-3456-7890",
      receiverState:"USA",
      receiverName: "Sarah Wilson",
      receiverCardNumber: "0123-4567-8901-2345",
      receiverPhoneNumber: "+998901234571",
      transactionFee: 0,
    },
    {
      id: 9,
      date: "2023-08-23",
      time: "12:00 PM",
      amount: 650,
      amountInOther: 555,
      currency: "USD",
      currencyInOther: "UZS",
      status: "success",
      type: "send",
      description: "Monthly payment",
      senderState:"Russia",
      sanderName: "Dmitry Smirnov",
      senderCardNumber: "6789-0123-4567-8901",
      receiverState:"Uzbekistan",
      receiverName: "Shohruh Toshmatov",
      receiverCardNumber: "1234-5678-9012-3456",
      receiverPhoneNumber: "+998901234572",
      transactionFee: 0,
    },
    {
      id: 10,
      date: "2023-08-24",
      time: "04:25 PM",
      amount: 950,
      amountInOther: 810,
      currency: "USD",
      currencyInOther: "UZS",
      status: "waiting",
      type: "receive",
      description: "Salary transfer",
      senderState:"USA",
      sanderName: "Jennifer Lee",
      senderCardNumber: "7890-1234-5678-9012",
      receiverState:"Russia",
      receiverName: "Olga Volkova",
      receiverCardNumber: "2345-6789-0123-4567",
      receiverPhoneNumber: "+998901234573",
      transactionFee: 0,
    },
    {
      id: 11,
      date: "2023-08-25",
      time: "10:15 AM",
      amount: 320,
      amountInOther: 275,
      currency: "USD",
      currencyInOther: "UZS",
      status: "success",
      type: "send",
      description: "Gift transfer",
      senderState:"Uzbekistan",
      sanderName: "Dilshod Umarov",
      senderCardNumber: "8901-2345-6789-0123",
      receiverState:"USA",
      receiverName: "David Martinez",
      receiverCardNumber: "3456-7890-1234-5678",
      receiverPhoneNumber: "+998901234574",
      transactionFee: 0,
    },
    {
      id: 12,
      date: "2023-08-26",
      time: "06:40 PM",
      amount: 1100,
      amountInOther: 940,
      currency: "USD",
      currencyInOther: "UZS",
      status: "cancelled",
      type: "receive",
      description: "Refund processed",
      senderState:"Russia",
      sanderName: "Anna Sokolova",
      senderCardNumber: "9012-3456-7890-1234",
      receiverState:"Uzbekistan",
      receiverName: "Jasur Nematov",
      receiverCardNumber: "4567-8901-2345-6789",
      receiverPhoneNumber: "+998901234575",
      transactionFee: 0,
    },
    {
      id: 13,
      date: "2023-08-27",
      time: "11:55 AM",
      amount: 580,
      amountInOther: 495,
      currency: "USD",
      currencyInOther: "UZS",
      status: "support",
      type: "send",
      description: "Pending verification",
      senderState:"USA",
      sanderName: "Chris Anderson",
      senderCardNumber: "0123-4567-8901-2345",
      receiverState:"Russia",
      receiverName: "Natasha Kuznetsova",
      receiverCardNumber: "5678-9012-3456-7890",
      receiverPhoneNumber: "+998901234576",
      transactionFee: 0,
    },
    {
      id: 14,
      date: "2023-08-28",
      time: "08:05 AM",
      amount: 420,
      amountInOther: 360,
      currency: "USD",
      currencyInOther: "UZS",
      status: "waiting",
      type: "receive",
      description: "Payment received",
      senderState:"Uzbekistan",
      sanderName: "Rustam Aliyev",
      senderCardNumber: "1234-5678-9012-3456",
      receiverState:"USA",
      receiverName: "Emily Davis",
      receiverCardNumber: "6789-0123-4567-8901",
      receiverPhoneNumber: "+998901234577",
      transactionFee: 0,
    }
  ]




  return (
    <AppContext.Provider value={{
      // Auth
      user,
      isAuthenticated,
      isLoading,
      handleLogin,
      handleLogout,
      handleAppleLogin,
      handleGoogleLogin,
      
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
      // Cards
      cardsRefreshKey,
      refreshCards,
      cards,
      cardsLoading,
      loadUserCards,

      // Profile state and setters
      profileIsSelDate, setProfileIsSelDate,
      profileIsDateOpen, setProfileIsDateOpen,
      profileCurMonth, setProfileCurMonth,
      profileIsMonthDropOpen, setProfileIsMonthDropOpen,
      profileIsYearDropOpen, setProfileIsYearDropOpen,
      profileIsStateDropOpen, setProfileIsStateDropOpen,
      profileCurState, setProfileCurState,
      profileCountryId, setProfileCountryId,
      profileBackendCountryName, setProfileBackendCountryName,
      profileUserId, setProfileUserId,
      profileCountriesList, setProfileCountriesList,
      profileFirstName, setProfileFirstName,
      profileLastName, setProfileLastName,
      profilePhone, setProfilePhone,
      profileEmail, setProfileEmail,
      profileInitial, setProfileInitial,
      profileStatus, setProfileStatus,
      loadProfile,
      loadCountries,

      // Data
      faqData,
      transactions,
      countries
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
