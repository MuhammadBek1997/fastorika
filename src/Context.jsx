import { createContext, useState, useEffect, useContext } from 'react';
import { apiFetch, getUserCards, fetchMyTransactions, fetchMyTransactionDetails, startKycVerification, refreshKycAccessToken, getKycStatus } from './api';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, appleProvider } from './firebaseConfig';
import { authenticateWithGoogle, authenticateWithApple } from './services/authService';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  // Auth State
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isVerificationRequired, setIsVerificationRequired] = useState(false);

  // UI State
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });
  const [openIndex, setOpenIndex] = useState(null);
  const [selPayment, setSelPayment] = useState("currency");
  const [addCardModal,setAddCardModal] = useState(false)

  // Global Dropdown Coordination - closes all dropdowns across components
  const [globalDropdownKey, setGlobalDropdownKey] = useState(0)
  const closeAllDropdowns = () => setGlobalDropdownKey(prev => prev + 1)

  // Transfer Flow State - persists data across transfer steps
  const [transferData, setTransferData] = useState({
    // Step 1: Currency/Amount (UnRegCur)
    sendAmount: '',
    receiveAmount: '',
    fromCurrency: 'USD',
    toCurrency: 'UZS',
    fromFlag: 'https://img.icons8.com/color/96/usa-circular.png',
    toFlag: 'https://img.icons8.com/color/96/uzbekistan-circular.png',
    paymentMethod: '',
    exchangeRate: null,
    feeCalculation: null,
    transferFeePercentage: 10,
    exchangeRateFeePercentage: 2,
    senderCard: null,
    // Crypto specific
    cryptoCurrency: null,
    cryptoIcon: null,
    cryptoName: null,
    // Step 2: Recipient (UnRegCardNum)
    recipientCardNumber: '',
    recipientName: '',
    recipientCountry: '',
    recipientPhone: '',
    // Crypto recipient
    walletAddress: '',
    selectedNetwork: null,
    // Step 3: Provider (UnRegSelProvide)
    selectedProvider: null,
    // Validation flags
    step1Completed: false,
    step2Completed: false,
    step3Completed: false
  })

  // Update transfer data (merge with existing)
  const updateTransferData = (newData) => {
    setTransferData(prev => ({ ...prev, ...newData }))
  }

  // Reset transfer data
  const resetTransferData = () => {
    setTransferData({
      sendAmount: '',
      receiveAmount: '',
      fromCurrency: 'USD',
      toCurrency: 'UZS',
      fromFlag: 'https://img.icons8.com/color/96/usa-circular.png',
      toFlag: 'https://img.icons8.com/color/96/uzbekistan-circular.png',
      paymentMethod: '',
      exchangeRate: null,
      feeCalculation: null,
      transferFeePercentage: 10,
      exchangeRateFeePercentage: 2,
      senderCard: null,
      cryptoCurrency: null,
      cryptoIcon: null,
      cryptoName: null,
      recipientCardNumber: '',
      recipientName: '',
      recipientCountry: '',
      recipientPhone: '',
      walletAddress: '',
      selectedNetwork: null,
      selectedProvider: null,
      step1Completed: false,
      step2Completed: false,
      step3Completed: false
    })
  }
  // Cards refresh signal (increment to force reloads)
  const [cardsRefreshKey, setCardsRefreshKey] = useState(0)
  const refreshCards = () => setCardsRefreshKey(prev => prev + 1)
  // Cards state
  const [cards, setCards] = useState([])
  const [cardsLoading, setCardsLoading] = useState(false)

  const loadUserCards = async () => {
    // Now using /cards/my endpoint - no userId needed
    const token = sessionStorage.getItem('token')
    if (!token) {
      setCards([])
      return
    }
    try {
      setCardsLoading(true)
      const data = await getUserCards()
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
      const res = await apiFetch('users/me', {
        headers: { Authorization: 'Bearer ' + token }
      })
      const responseData = await res.json()
      if (!res.ok) {
        console.warn('Profile load failed:', responseData?.message)
        setProfileStatus({ type: 'error', message: responseData?.message || '' })
        setProfileInitial({
          email: '', firstName: '', lastName: '', phone: '', country: '', birthDate: '', countryId: null
        })
        return
      }
      // Backend returns: { success: true, data: { id, email, phone, status, role, createdAt, name, surname } }
      const data = responseData?.data || responseData
      setProfileEmail(data.email || '')
      setProfileUserId(data?.id ?? null)
      // Backend sends name and surname separately
      setProfileFirstName(data.name || '')
      setProfileLastName(data.surname || '')
      setProfilePhone(data.phone || '')
      // Backend sends countryId, countryName, countryCode directly (not in countryResponse object)
      const backendCountry = data?.countryName || ''
      setProfileCurState(backendCountry)
      setProfileCountryId(data?.countryId ?? null)
      setProfileBackendCountryName(backendCountry)
      const displayDate = isoToDisplay(data?.dateOfBirth)
      setProfileIsSelDate(displayDate)
      setProfileInitial({
        email: data.email || '',
        userId: data?.id ?? null,
        firstName: data.name || '',
        lastName: data.surname || '',
        phone: data.phone || '',
        country: backendCountry,
        birthDate: displayDate,
        countryId: data?.countryId ?? null,
        backendCountryName: backendCountry
      })
      setProfileStatus({ type: null, message: '' })
    } catch (e) {
      console.warn('Profile load network error', e)
      setProfileStatus({ type: 'error', message: 'Profilni yuklashda tarmoq xatosi' })
      setProfileInitial({
        email: '', userId: null, firstName: '', lastName: '', phone: '', country: '', birthDate: '', countryId: null, backendCountryName: ''
      })
    }
  }

  const loadCountries = async () => {
    try {
      const res = await apiFetch('countries', { method: 'GET' })
      const responseData = await res.json()
      if (!res.ok) {
        console.warn('Countries load failed:', responseData?.message)
        setProfileCountriesList([])
        return
      }
      // Backend returns: { success: true, data: [...] }
      const dataArray = responseData?.data || responseData
      const normalized = Array.isArray(dataArray) ? dataArray.map(c => ({
        countryId: c.countryId ?? c.id ?? null,
        name: c.name ?? ''
      })).filter(c => c.name) : []
      setProfileCountriesList(normalized)
    } catch (e) {
      console.warn('Countries load network error', e)
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

  // Check authentication on mount - Backend API version
  useEffect(() => {
    const checkAuth = async () => {
      // Read token from sessionStorage (where handleLogin stores it)
      const token = sessionStorage.getItem('token');

      if (!token) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      try {
        // Validate token with backend API using new endpoint
        const response = await apiFetch('users/me', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Token validation failed');
        }

        const responseData = await response.json();

        // Backend returns: { success: true, data: { id, email, phone, status, role, createdAt } }
        const userData = responseData?.data || responseData;

        // Store user data and set authenticated
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('logged', 'true');
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Auth check failed:', error);
        // Token invalid or expired - clear everything
        sessionStorage.removeItem('token');
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('tokenType');
        localStorage.removeItem('user');
        localStorage.removeItem('logged');
        setUser(null);
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

  // Login Handler - Backend API version
  const handleLogin = async (email, password) => {
    try {
      // Simple validation
      if (!email || !password) {
        try {
          const { toast } = await import('react-toastify');
          toast.error(t('fillAllFields') || 'Email va parol kiriting');
        } catch { }
        return false;
      }

      // Call backend /auth/login endpoint
      const response = await apiFetch('auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const responseData = await response.json();

      if (!response.ok) {
        // Handle error response
        const errorMessage = responseData?.message || responseData?.error || 'Login failed';

        if (errorMessage === "Account is not verified. Please verify your email first.") {
          // Try to extract token if available for partial auth (KYC)
          const data = responseData?.data || responseData;
          if (data?.accessToken) {
            sessionStorage.setItem('token', data.accessToken);
            if (data.user) {
              setUser(data.user);
              setProfileUserId(data.user.id);
            }
          }

          setIsVerificationRequired(true);
          navigate('/kyc');
          return false;
        }

        try {
          const { toast } = await import('react-toastify');
          toast.error(errorMessage);
        } catch { }
        return false;
      }

      // Backend returns: { success: true, data: { accessToken, refreshToken, tokenType, user } }
      const data = responseData?.data || responseData;
      const { accessToken, refreshToken, tokenType, user: userData } = data;

      if (!accessToken) {
        try {
          const { toast } = await import('react-toastify');
          toast.error('Token not received from server');
        } catch { }
        return false;
      }

      // Store tokens in sessionStorage and localStorage (as per api.js convention)
      sessionStorage.setItem('token', accessToken);
      localStorage.setItem('token', accessToken);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      if (tokenType) {
        localStorage.setItem('tokenType', tokenType);
      }
      localStorage.setItem('logged', 'true');
      localStorage.setItem('user', JSON.stringify(userData));

      setUser(userData);
      setIsAuthenticated(true);

      try {
        const { toast } = await import('react-toastify');
        toast.success(t('loginSuccess') || 'Muvaffaqiyatli kirdingiz');
      } catch { }

      navigate('/transactions');
      return true;
    } catch (err) {
      console.error('Login error:', err);
      try {
        const { toast } = await import('react-toastify');
        toast.error(t('loginError') || 'Kirishda xatolik');
      } catch { }
      return false;
    }
  };


// Google Login Handler - OAuth via intermediate backend
const handleGoogleLogin = async (googleResponse) => {
  try {
    const { toast } = await import('react-toastify');

    // If no response provided, show info message
    if (!googleResponse || !googleResponse.credential) {
      toast.info('Google login funksiyasi ishlamoqda');
      return false;
    }

    // Authenticate with our intermediate backend
    const result = await authenticateWithGoogle(googleResponse);

    if (!result.success) {
      toast.error(result.error || 'Google login xatolik');
      return false;
    }

    // Store tokens in sessionStorage (same as handleLogin)
    if (result.token) {
      sessionStorage.setItem('token', result.token);
      localStorage.setItem('token', result.token);
    }

    // Set user data
    setUser(result.user);
    setIsAuthenticated(true);
    localStorage.setItem('logged', 'true');
    localStorage.setItem('user', JSON.stringify(result.user));

    toast.success(t('loginSuccess') || 'Google orqali muvaffaqiyatli kirdingiz');
    navigate('/transactions');
    return true;
  } catch (error) {
    console.error('Google login error:', error);
    try {
      const { toast } = await import('react-toastify');
      toast.error(t('loginError') || 'Google login xatolik');
    } catch { }
    return false;
  }
};

// Apple Login Handler - OAuth via intermediate backend
const handleAppleLogin = async (appleResponse) => {
  try {
    const { toast } = await import('react-toastify');

    // If no response provided, show info message
    if (!appleResponse || (!appleResponse.authorization && !appleResponse.id_token)) {
      toast.info('Apple login funksiyasi ishlamoqda');
      return false;
    }

    // Authenticate with our intermediate backend
    const result = await authenticateWithApple(appleResponse);

    if (!result.success) {
      toast.error(result.error || 'Apple login xatolik');
      return false;
    }

    // Store tokens in sessionStorage (same as handleLogin)
    if (result.token) {
      sessionStorage.setItem('token', result.token);
      localStorage.setItem('token', result.token);
    }

    // Set user data
    setUser(result.user);
    setIsAuthenticated(true);
    localStorage.setItem('logged', 'true');
    localStorage.setItem('user', JSON.stringify(result.user));

    toast.success(t('loginSuccess') || 'Apple orqali muvaffaqiyatli kirdingiz');
    navigate('/transactions');
    return true;
  } catch (error) {
    console.error('Apple login error:', error);
    try {
      const { toast } = await import('react-toastify');
      toast.error(t('loginError') || 'Apple login xatolik');
    } catch { }
    return false;
  }
};


  // Logout Handler
  const handleLogout = () => {
    // Clear both sessionStorage (token) and localStorage (user data)
    sessionStorage.removeItem('token');
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

  // FAQ Data - using i18n translations
  const faqData = [
    {
      question: t('faqItems.q1.question'),
      answer: t('faqItems.q1.answer')
    },
    {
      question: t('faqItems.q2.question'),
      answer: t('faqItems.q2.answer')
    },
    {
      question: t('faqItems.q3.question'),
      answer: t('faqItems.q3.answer')
    },
    {
      question: t('faqItems.q4.question'),
      answer: t('faqItems.q4.answer')
    },
    {
      question: t('faqItems.q5.question'),
      answer: t('faqItems.q5.answer')
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

// Mock users for Fastorika ID search
let mockUsers = [
  {
    id: '123423',
    firstName: 'Тимур',
    lastName: 'К.',
    fullName: 'Тимур К.',
    verified: true
  },
  {
    id: '1234-1432-1234',
    firstName: 'Тимур',
    lastName: 'К.',
    fullName: 'Тимур К.',
    verified: true
  },
  {
    id: '567890',
    firstName: 'Алексей',
    lastName: 'Петров',
    fullName: 'Алексей Петров',
    verified: true
  },
  {
    id: '789456',
    firstName: 'Мария',
    lastName: 'Иванова',
    fullName: 'Мария Иванова',
    verified: true
  },
  {
    id: '321654',
    firstName: 'Дмитрий',
    lastName: 'Смирнов',
    fullName: 'Дмитрий Смирнов',
    verified: false
  }
]

  // Transactions State
  const [transactions, setTransactions] = useState([])
  const [transactionsLoading, setTransactionsLoading] = useState(false)

  // Load transactions from backend using paginated API
  const loadTransactions = async (page = 0, size = 20) => {
    const token = sessionStorage.getItem('token')
    if (!token) {
      setTransactions([])
      return
    }

    try {
      setTransactionsLoading(true)
      const responseData = await fetchMyTransactions(page, size)

      // Backend returns paginated: { content: [...], pageable: {...}, totalElements, ... }
      const dataArray = responseData?.content || responseData

      // Transform backend structure to UI format
      const transformedTransactions = (Array.isArray(dataArray) ? dataArray : []).map(tx => {
        // Parse createdAt into date and time
        const createdDate = tx.createdAt ? new Date(tx.createdAt) : new Date()
        const dateStr = createdDate.toISOString().split('T')[0]
        const timeStr = createdDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

        // Keep backend status as-is (TO_PAY, PROCESSING, DELIVERED, REJECTED, SUPPORT)
        // UI components handle the mapping

        // Determine type based on isSender/isReceiver
        const type = tx.isSender ? 'send' : 'receive'

        return {
          id: tx.transactionId || tx.id,
          internalTransactionId: tx.internalTransactionId || '',
          date: dateStr,
          time: timeStr,
          amount: tx.amountSent || tx.amount || 0,
          amountInOther: tx.amountReceived || tx.amountInOther || 0,
          currency: tx.sourceCurrency || tx.currency || 'USD',
          currencyInOther: tx.destinationCurrency || tx.currencyInOther || 'UZS',
          status: tx.status || 'PROCESSING',
          type: type,
          isSender: tx.isSender || false,
          isReceiver: tx.isReceiver || false,
          counterpartyName: tx.counterpartyName || '',
          receiverName: tx.counterpartyName || tx.receiverName || '',
          receiverCardNumber: tx.receiverCard || tx.receiverCardNumber || null,
          receiverPhoneNumber: tx.receiverPhoneNumber || '',
          receiverState: tx.destinationCountry || tx.receiverCountryName || '',
          senderName: tx.senderName || tx.sanderName || '',
          sanderName: tx.senderName || tx.sanderName || '',
          senderCardNumber: tx.senderCardNumber || '****-****-****-****',
          senderState: tx.senderCountryName || '',
          transactionFee: tx.feeAmount || 0,
          exchangeRate: tx.exchangeRate || 0,
          feePercentage: tx.feePercentage || 0
        }
      })

      setTransactions(transformedTransactions)
    } catch (e) {
      console.warn('Transactions load error:', e?.message || e)
      setTransactions([])
    } finally {
      setTransactionsLoading(false)
    }
  }

  // Load transactions when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadTransactions()
    } else {
      setTransactions([])
    }
  }, [isAuthenticated])

  // Get transaction details by ID from backend API
  const getTransactionDetails = async (transactionId) => {
    const token = sessionStorage.getItem('token')
    if (!token) {
      throw new Error('Not authenticated')
    }

    try {
      const tx = await fetchMyTransactionDetails(transactionId)

      // Parse createdAt into date and time
      const createdDate = tx.createdAt ? new Date(tx.createdAt) : new Date()
      const dateStr = createdDate.toISOString().split('T')[0]
      const timeStr = createdDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

      // Map backend status to UI status
      const statusMap = {
        'TO_PAY': 'waiting',
        'PROCESSING': 'waiting',
        'DELIVERED': 'success',
        'COMPLETED': 'success',
        'REJECTED': 'cancel',
        'CANCELLED': 'cancel',
        'IN_REVIEW': 'support',
        'SUPPORT': 'support'
      }

      // Determine type based on isSender/isReceiver
      const type = tx.isSender ? 'send' : 'receive'

      return {
        id: tx.transactionId || tx.id,
        internalTransactionId: tx.internalTransactionId || '',
        date: dateStr,
        time: timeStr,
        amount: tx.amountSent || tx.amount || 0,
        amountInOther: tx.amountReceived || tx.amountInOther || 0,
        currency: tx.sourceCurrency || tx.currency || 'USD',
        currencyInOther: tx.destinationCurrency || tx.currencyInOther || 'UZS',
        status: statusMap[tx.status] || 'waiting',
        type: type,
        isSender: tx.isSender || false,
        isReceiver: tx.isReceiver || false,
        senderName: tx.senderName || '',
        receiverName: tx.receiverName || '',
        receiverCardNumber: tx.receiverCard?.maskedCardNumber || '****-****-****-****',
        receiverCardNetwork: tx.receiverCard?.cardNetwork || '',
        receiverCardHolderName: tx.receiverCard?.cardHolderName || '',
        receiverPhoneNumber: tx.receiverPhoneNumber || '',
        receiverState: tx.receiverCountry || '',
        receiverCountryCode: tx.receiverCountryCode || '',
        sanderName: tx.senderName || '',
        senderCardNumber: tx.senderCardNumber || '****-****-****-****',
        senderState: tx.senderCountryName || '',
        transactionFee: tx.feeAmount || 0,
        exchangeRate: tx.exchangeRate || 0,
        feePercentage: tx.feePercentage || 0,
        paymentInfo: tx.paymentInfo || null,
        createdAt: tx.createdAt,
        updatedAt: tx.updatedAt
      }
    } catch (e) {
      console.error('Get transaction details error:', e?.message || e)
      throw e
    }
  }

  // ============== KYC VERIFICATION ==============
  const [kycStatus, setKycStatus] = useState(null) // PENDING, VERIFIED, NOT_VERIFIED
  const [kycLoading, setKycLoading] = useState(false)
  const [kycAccessToken, setKycAccessToken] = useState(null)
  const [kycApplicantId, setKycApplicantId] = useState(null)

  // Load KYC status when authenticated
  const loadKycStatus = async () => {
    const token = sessionStorage.getItem('token')
    if (!token) {
      setKycStatus(null)
      return
    }

    try {
      setKycLoading(true)
      const statusData = await getKycStatus()
      setKycStatus(statusData?.verificationStatus || statusData?.status || null)
    } catch (e) {
      console.warn('KYC status load error:', e?.message || e)
      setKycStatus(null)
    } finally {
      setKycLoading(false)
    }
  }

  // Start KYC verification process
  const initiateKyc = async (userId) => {
    try {
      setKycLoading(true)
      const result = await startKycVerification(userId)
      setKycAccessToken(result.accessToken)
      setKycApplicantId(result.applicantId)
      setKycStatus('PENDING')
      return result
    } catch (e) {
      console.error('KYC initiation error:', e?.message || e)
      throw e
    } finally {
      setKycLoading(false)
    }
  }

  // Refresh KYC access token (for Sumsub WebSDK)
  const refreshKycToken = async () => {
    try {
      const newToken = await refreshKycAccessToken()
      setKycAccessToken(newToken)
      return newToken
    } catch (e) {
      console.error('KYC token refresh error:', e?.message || e)
      throw e
    }
  }

  // Load KYC status when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadKycStatus()
    } else {
      setKycStatus(null)
      setKycAccessToken(null)
      setKycApplicantId(null)
    }
  }, [isAuthenticated])

  // Mock transactions for reference (remove after backend integration)
  /*
  let mockTransactions = [
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
*/




  return (
    <AppContext.Provider value={{
      // Auth
      user,
      isAuthenticated,
      isVerificationRequired,
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

      // Global Dropdown Coordination
      globalDropdownKey,
      closeAllDropdowns,

      // Transfer Flow
      transferData,
      updateTransferData,
      resetTransferData,
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
      transactionsLoading,
      loadTransactions,
      getTransactionDetails,
      countries,
      mockUsers,

      // KYC Verification
      kycStatus,
      kycLoading,
      kycAccessToken,
      kycApplicantId,
      loadKycStatus,
      initiateKyc,
      refreshKycToken
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
