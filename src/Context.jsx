import { createContext, useState, useEffect, useContext } from 'react';
import { apiFetch, getUserCards } from './api';
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
    { code: 'ru', name: 'Русский', flag: '/images/russia.png' },
    { code: 'en', name: 'English', flag: '/images/us.png' }
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