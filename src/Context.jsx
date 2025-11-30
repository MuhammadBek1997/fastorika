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

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = sessionStorage.getItem('token');

      if (token) {
        try {
          // Retry small number of times to absorb transient network/CORS blips
          const fetchProfileWithRetry = async (retries = 2) => {
            for (let i = 0; i <= retries; i++) {
              try {
                const res = await apiFetch('user/getOne', {
                  method: 'GET',
                  headers: {
                    'Authorization': `Bearer ${token}`,  // <-- Qo'lda Bearer token qo'shildi
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
            sessionStorage.removeItem('token');
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
    navigate('/login');
  };

  // Cancel Login Flow
  const cancelLogin = () => {
    navigate('/');
  };

  // Login Handler
  const handleLogin = async (email, password) => {
    try {
      const res = await apiFetch('auth/login', {
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
      sessionStorage.setItem('token', data.token);
      localStorage.setItem("logged", "true");
      
      // Fetch full profile to get stable userId immediately
      let fullUser = null;
      try {
        const profileRes = await apiFetch('user/getOne', { method: 'GET' });
        if (profileRes.ok) {
          fullUser = await profileRes.json();
        }
      } catch (e) {
        // Ignore and fallback to login payload
      }
      const nextUser = fullUser || (data.user || { email });
      setUser(nextUser);
      setIsAuthenticated(true);
      // Preload cards on successful login using resolved userId
      try { await loadUserCards(nextUser?.userId) } catch {}

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


 // Google Login Handler - verification modal bilan
const handleGoogleLogin = async () => {
  try {
    // Firebase bilan Google login
    const result = await signInWithPopup(auth, googleProvider);
    const firebaseUser = result.user;
    
    const email = firebaseUser.email;
    const name = firebaseUser.displayName || '';
    
    console.log('Firebase User:', { email, name, uid: firebaseUser.uid });
    
    // 1. Avval login qilib ko'ramiz (agar user avval ro'yxatdan o'tgan bo'lsa)
    try {
      const loginRes = await apiFetch('auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: email, 
          password: firebaseUser.uid
        })
      });

      if (loginRes.ok) {
        const data = await loginRes.json();
        console.log('Login muvaffaqiyatli:', data);
        
        sessionStorage.setItem('token', data.token);
        localStorage.setItem("logged", "true");
        
        let fullUser = null;
        try {
          const profileRes = await apiFetch('user/getOne', { method: 'GET' });
          if (profileRes.ok) {
            fullUser = await profileRes.json();
          }
        } catch (e) {
          console.error('Profile fetch error:', e);
        }
        
        const nextUser = fullUser || { email, name };
        setUser(nextUser);
        setIsAuthenticated(true);
        
        try { 
          await loadUserCards(nextUser?.userId);
        } catch {}

        try {
          const { toast } = await import('react-toastify');
          toast.success(t('toast.login.success'));
        } catch { }

        navigate('/transactions');
        return true;
      }
    } catch (loginError) {
      console.log('Login failed, user not registered. Trying register...', loginError);
    }
    
    // 2. Login ishlamasa - yangi user, register qilamiz
    console.log('Starting registration for new Google user');
    
    try {
      const registerRes = await apiFetch('auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          name: name,
          password: firebaseUser.uid,
          // phone: '' // agar backend talab qilsa
        })
      });

      if (!registerRes.ok) {
        const errorData = await registerRes.json();
        console.error('Register error:', errorData);
        try {
          const { toast } = await import('react-toastify');
          toast.error(errorData.message || "Ro'yxatdan o'tishda xatolik");
        } catch { }
        return false;
      }

      console.log('Register successful, verification code sent to email');
      
      // 3. Register muvaffaqiyatli - verification modal ochish
      // Register sahifasiga yo'naltirish va verification modal ko'rsatish
      try {
        const { toast } = await import('react-toastify');
        toast.success("Tasdiqlash kodi emailingizga yuborildi");
      } catch { }
      
      navigate('/register', { 
        state: { 
          email: email,
          name: name,
          photoURL: firebaseUser.photoURL || '',
          firebaseUid: firebaseUser.uid,
          fromGoogle: true,
          needsVerification: true // Verification modal ochish uchun
        } 
      });
      
      return true;

    } catch (err) {
      console.error('Register network error:', err);
      try {
        const { toast } = await import('react-toastify');
        toast.error('Tarmoq xatosi');
      } catch { }
      return false;
    }

  } catch (err) {
    console.error('Google login error:', err);
    try {
      const { toast } = await import('react-toastify');
      toast.error('Google bilan kirishda xatolik');
    } catch { }
    return false;
  }
};

// Apple Login - xuddi shunday
const handleAppleLogin = async () => {
  try {
    const result = await signInWithPopup(auth, appleProvider);
    const firebaseUser = result.user;
    
    const email = firebaseUser.email;
    const name = firebaseUser.displayName || 'Apple User';
    
    // 1. Login urinish
    try {
      const loginRes = await apiFetch('auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: email, 
          password: firebaseUser.uid
        })
      });

      if (loginRes.ok) {
        const data = await loginRes.json();
        
        sessionStorage.setItem('token', data.token);
        localStorage.setItem("logged", "true");
        
        let fullUser = null;
        try {
          const profileRes = await apiFetch('user/getOne', { method: 'GET' });
          if (profileRes.ok) {
            fullUser = await profileRes.json();
          }
        } catch (e) {
          console.error('Profile fetch error:', e);
        }
        
        const nextUser = fullUser || { email, name };
        setUser(nextUser);
        setIsAuthenticated(true);
        
        try { 
          await loadUserCards(nextUser?.userId);
        } catch {}

        try {
          const { toast } = await import('react-toastify');
          toast.success(t('toast.login.success'));
        } catch { }

        navigate('/transactions');
        return true;
      }
    } catch (loginError) {
      console.log('Login failed, trying register...', loginError);
    }
    
    // 2. Register
    try {
      const registerRes = await apiFetch('auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          name: name,
          password: firebaseUser.uid,
        })
      });

      if (!registerRes.ok) {
        const errorData = await registerRes.json();
        try {
          const { toast } = await import('react-toastify');
          toast.error(errorData.message || "Ro'yxatdan o'tishda xatolik");
        } catch { }
        return false;
      }
      
      try {
        const { toast } = await import('react-toastify');
        toast.success("Tasdiqlash kodi emailingizga yuborildi");
      } catch { }
      
      navigate('/register', { 
        state: { 
          email: email,
          name: name,
          firebaseUid: firebaseUser.uid,
          fromApple: true,
          needsVerification: true
        } 
      });
      
      return true;

    } catch (err) {
      console.error('Register error:', err);
      try {
        const { toast } = await import('react-toastify');
        toast.error('Tarmoq xatosi');
      } catch { }
      return false;
    }

  } catch (err) {
    console.error('Apple login error:', err);
    try {
      const { toast } = await import('react-toastify');
      toast.error('Apple bilan kirishda xatolik');
    } catch { }
    return false;
  }
};


  // Logout Handler
  const handleLogout = () => {
    sessionStorage.removeItem('token');
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
