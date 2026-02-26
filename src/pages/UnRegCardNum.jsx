import { useState, useEffect } from "react"
import './currency.css'
import { useNavigate, useLocation } from "react-router-dom"
import { useGlobalContext } from "../Context"
import { CreditCard, User, Phone, ArrowLeft, Share2, CheckCircle, XCircle, Wallet, Lock, ChevronDown } from "lucide-react"
import UnRegCopyModal from "./UnRegCopyModal"
import { findClientByFastorikaId } from "../api"

const UnRegCardNum = () => {
    let { t, theme, user, profilePhone, transferData, updateTransferData, profileCountriesList } = useGlobalContext()
    const navigate = useNavigate()
    const location = useLocation()

    // Extract transfer summary from global context
    const {
        sendAmount = '0',
        receiveAmount = '0',
        fromCurrency = 'USD',
        toCurrency = 'UZS',
        exchangeRate = null,
        feeCalculation = null,
        transferFeePercentage = 10,
        exchangeRateFeePercentage = 2,
        paymentMethod = '',
        cryptoCurrency = null,
        cryptoIcon = null,
        cryptoName = null,
        // Previously entered recipient data (for back navigation)
        recipientCardNumber = '',
        recipientName = '',
        walletAddress: savedWalletAddress = ''
    } = transferData || {}

    // Check if this is a crypto transfer
    const isCryptoTransfer = paymentMethod === 'CRYPTO'

    // Find destination country and its card indicators
    const destinationCountry = profileCountriesList?.find(
        c => c.currency?.toUpperCase() === toCurrency?.toUpperCase()
    )
    const destCardIndicators = destinationCountry?.cardIndicators
    // If indicators are configured (not null), check if at least one is enabled
    // If not configured (null), show form by default
    const hasAnyIndicatorEnabled = destCardIndicators
        ? Object.values(destCardIndicators).some(v => v === true)
        : true

    // Crypto-specific state
    const [walletAddress, setWalletAddress] = useState(savedWalletAddress || "")
    const [cryptoReceiverName, setCryptoReceiverName] = useState(recipientName || "")

    // Country codes for phone input
    const countryCodes = [
        { code: '+998', country: 'UZ', flag: '🇺🇿', name: 'Uzbekistan' },
        { code: '+7', country: 'RU', flag: '🇷🇺', name: 'Russia' },
        { code: '+7', country: 'KZ', flag: '🇰🇿', name: 'Kazakhstan' },
        { code: '+1', country: 'US', flag: '🇺🇸', name: 'USA' },
        { code: '+44', country: 'GB', flag: '🇬🇧', name: 'UK' },
        { code: '+49', country: 'DE', flag: '🇩🇪', name: 'Germany' },
        { code: '+90', country: 'TR', flag: '🇹🇷', name: 'Turkey' },
        { code: '+82', country: 'KR', flag: '🇰🇷', name: 'South Korea' },
        { code: '+86', country: 'CN', flag: '🇨🇳', name: 'China' },
        { code: '+971', country: 'AE', flag: '🇦🇪', name: 'UAE' }
    ]
    const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false)
    const [selectedCountry, setSelectedCountry] = useState(countryCodes[0])

    const [mode, setMode] = useState('card')
    const [cardNumber, setCardNumber] = useState(recipientCardNumber || "")
    const [phonePrefix, setPhonePrefix] = useState(transferData?.recipientPhone?.slice(0, transferData?.recipientPhone?.indexOf(' ')) || '+998')
    const [phoneRest, setPhoneRest] = useState(transferData?.recipientPhone?.split(' ').slice(1).join('') || '')
    const [firstName, setFirstName] = useState(recipientName?.split(' ')[0] || "")
    const [lastName, setLastName] = useState(recipientName?.split(' ').slice(1).join(' ') || "")
    const [userId, setUserId] = useState("")
    const [userverify,setUserverify] = useState(false)
    const [isSearching, setIsSearching] = useState(false)
    const [foundUser, setFoundUser] = useState(null)
    const [searchError, setSearchError] = useState(null)
    const [selectedCard, setSelectedCard] = useState(null)

    // Dropdown open state for recipient cards
    const [isCardDropdownOpen, setIsCardDropdownOpen] = useState(false)

    // Card expiration date
    const [expiryMonth, setExpiryMonth] = useState('')
    const [expiryYear, setExpiryYear] = useState('')
    const [cvv, setCvv] = useState('')

    // Detect card network from card number
    const detectCardNetwork = (cardNum) => {
        const num = cardNum.replace(/\s/g, '')
        if (!num) return null
        // Uzcard: 8600 yoki 5614
        if (num.startsWith('8600') || num.startsWith('5614')) return 'UZCARD'
        // Humo: 9860
        if (num.startsWith('9860')) return 'HUMO'
        // Visa: 4 bilan boshlanadi
        if (num.startsWith('4')) return 'VISA'
        // Mastercard: 51-55 yoki 2221-2720
        if (num.length >= 2) {
            const first2 = parseInt(num.slice(0, 2))
            if (first2 >= 51 && first2 <= 55) return 'MASTERCARD'
        }
        if (num.length >= 4) {
            const first4 = parseInt(num.slice(0, 4))
            if (first4 >= 2221 && first4 <= 2720) return 'MASTERCARD'
        }
        return null
    }

    const cardNetwork = detectCardNetwork(cardNumber)
    const isInternationalCard = cardNetwork === 'VISA' || cardNetwork === 'MASTERCARD'

    const extractDialCode = (phone) => {
        const match = String(phone || '').match(/^\+(\d{1,3})/)
        return match ? `+${match[1]}` : '+998'
    }

    useEffect(() => {
        const prefix = extractDialCode(profilePhone || user?.phone)
        setPhonePrefix(prefix)
    }, [user, profilePhone])

    const formatCardNumber = (value) => {
        const numbers = value.replace(/\s/g, '')
        const formatted = numbers.match(/.{1,4}/g)
        return formatted ? formatted.join(' ') : numbers
    }

    const handleCardNumberChange = (e) => {
        const value = e.target.value.replace(/\s/g, '')
        if (value.length <= 16 && /^\d*$/.test(value)) {
            setCardNumber(formatCardNumber(value))
        }
    }

    const handlePhoneNumberChange = (e) => {
        const rawDigits = e.target.value.replace(/\D/g, '')
        const prefixDigits = phonePrefix.replace('+', '')
        let afterPrefix = rawDigits.startsWith(prefixDigits) ? rawDigits.slice(prefixDigits.length) : rawDigits
        const maxRestLen = Math.max(0, 12 - prefixDigits.length)
        setPhoneRest(afterPrefix.slice(0, maxRestLen))
    }

    const fullPhoneNumber = `${phonePrefix}${phoneRest}`
    const isPhoneValid = phoneRest.length > 0

    // Search user by Fastorika ID with debounce - using real API
    useEffect(() => {
        if (mode === 'user' && userId.trim().length > 0) {
            setIsSearching(true)
            setSearchError(null)
            setFoundUser(null)
            setSelectedCard(null)

            const timer = setTimeout(async () => {
                try {
                    const client = await findClientByFastorikaId(userId.trim())
                    if (client) {
                        setFoundUser(client)
                        // Auto-select first card if available
                        if (client.cards && client.cards.length > 0) {
                            setSelectedCard(client.cards[0])
                        }
                        setSearchError(null)
                    } else {
                        setFoundUser(null)
                        setSearchError(t('userNotFound') || 'User not found')
                    }
                } catch (error) {
                    console.error('Search error:', error)
                    setFoundUser(null)
                    setSearchError(error.message || t('searchError') || 'Search failed')
                } finally {
                    setIsSearching(false)
                }
            }, 800) // Debounce delay

            return () => clearTimeout(timer)
        } else {
            setFoundUser(null)
            setSearchError(null)
            setSelectedCard(null)
            setIsSearching(false)
        }
    }, [userId, mode, t])

    return (
        <div className="currency">
            <div className="currency-head-back">
                <button
                    onClick={() => navigate(-1)}
                    className="back-btn"
                >
                    <ArrowLeft size={24} />
                    {t("back")}
                </button>

            </div>
            <div className="currency-body">

                <h2 className="currency-head-title">
                    {t("recipientDetails") || "Укажите получателя"}
                </h2>

                {/* Crypto Transfer Inputs - Figma design */}
                {isCryptoTransfer ? (
                    <div className="currency-inner">
                        <div className="input-labels-cont">
                            {/* Receiver Name */}
                            <div className="mb-1">
                                <div className="input-label-row">
                                    <span className="label-icon"><User /></span>
                                    <span className="label-text">{t("receiverFullName") || "Имя Фамилия получателя"}</span>
                                </div>
                                <div className="currency-input-container">
                                    <input
                                        type="text"
                                        value={cryptoReceiverName}
                                        onChange={(e) => setCryptoReceiverName(e.target.value)}
                                        placeholder=""
                                    />
                                </div>
                            </div>

                            {/* Phone Number with Country Dropdown */}
                            <div className="mb-1">
                                <div className="input-label-row">
                                    <span className="label-icon"><Phone /></span>
                                    <span className="label-text">{t("phoneNumber") || "Номер телефона"}</span>
                                </div>
                                <div className="currency-input-container cur-phone-container">
                                    {/* Country Code Dropdown */}
                                    <div className="cur-phone-country-wrapper">
                                        <button
                                            type="button"
                                            onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                                            className="cur-phone-country-btn"
                                        >
                                            <img src={`https://flagcdn.com/w40/${selectedCountry.country.toLowerCase()}.png`} alt="" style={{width:20,height:14,objectFit:'cover',borderRadius:2}} />
                                            <span>{selectedCountry.code}</span>
                                            <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                                                <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        </button>
                                        {isCountryDropdownOpen && (
                                            <div className="cur-phone-dropdown">
                                                {countryCodes.map((country, idx) => (
                                                    <button
                                                        key={`${country.code}-${country.country}-${idx}`}
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedCountry(country)
                                                            setPhonePrefix(country.code)
                                                            setIsCountryDropdownOpen(false)
                                                        }}
                                                        className={`cur-phone-option ${selectedCountry.code === country.code && selectedCountry.country === country.country ? 'active' : ''}`}
                                                    >
                                                        <img src={`https://flagcdn.com/w40/${country.country.toLowerCase()}.png`} alt="" style={{width:20,height:14,objectFit:'cover',borderRadius:2}} />
                                                        <span className="cur-phone-option-name">{country.name}</span>
                                                        <span className="cur-phone-option-code">{country.code}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    {/* Phone Number Input */}
                                    <input
                                        type="text"
                                        value={phoneRest}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '')
                                            setPhoneRest(val.slice(0, 12))
                                        }}
                                        placeholder="00 000 00 00"
                                        className="cur-phone-input"
                                    />
                                </div>
                            </div>

                            {/* Wallet Address */}
                            <div className="mb-1">
                                <div className="input-label-row">
                                    <span className="label-icon"><Wallet /></span>
                                    <span className="label-text">{t("recipientWallet") || "Кошелек получателя"}</span>
                                </div>
                                <div className="currency-input-container">
                                    <input
                                        type="text"
                                        value={walletAddress}
                                        onChange={(e) => setWalletAddress(e.target.value)}
                                        placeholder="0000 0000 0000 0000"
                                        style={{ fontFamily: 'monospace' }}
                                    />
                                </div>
                            </div>

                            {/* Warning info card */}
                            <div className="info-card">
                                <p className="info-text">
                                    <div className="info-icon">!</div>
                                    {t("walletNameWarning") || "Имя и фамилия получателя должны быть введены латинскими буквами"}
                                </p>
                            </div>
                        </div>

                        <div className="terms-block">
                            <div className="terms-accept">
                                <input type="checkbox" id="cryptoTerms" className="terms-checkbox" />
                                <label htmlFor="cryptoTerms" className="terms-label">
                                    {t("confirmRecipientVerified") || "Подтверждаю, что получатель является"} <span className="link-accent">{t("verified") || "проверенным"}</span> {t("and") || "и"} <span className="link-accent">{t("trusted") || "доверенным"}</span> {t("person") || "лицом"}
                                </label>
                            </div>
                        </div>

                        <button
                            className="currency-continueBtn"
                            onClick={() => {
                                const cryptoRecipient = {
                                    mode: 'crypto',
                                    walletAddress: walletAddress,
                                    receiverName: cryptoReceiverName || null,
                                    phoneNumber: `${selectedCountry.code}${phoneRest}`,
                                    cryptoCurrency: cryptoCurrency
                                }

                                // Save to global context
                                updateTransferData({
                                    walletAddress: walletAddress,
                                    recipientName: cryptoReceiverName,
                                    recipientPhone: `${selectedCountry.code}${phoneRest}`,
                                    recipient: cryptoRecipient,
                                    step2Completed: true
                                })

                                // Navigate to provider page to select network
                                navigate('/provider')
                            }}
                            disabled={!walletAddress || walletAddress.length < 10}
                        >
                            {t('continue') || "Продолжить"}
                        </button>
                    </div>
                ) : !hasAnyIndicatorEnabled ? (
                    <div className="currency-inner" style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                        <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
                            <svg width="52" height="52" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="10" stroke="#ef4444" strokeWidth="2"/>
                                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                        </div>
                        <p style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '0.5rem' }}>
                            {t('paymentMethodUnavailable') || 'Bu yo\'nalish uchun to\'lov usuli mavjud emas'}
                        </p>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary, #888)', marginBottom: '1.5rem' }}>
                            {t('paymentMethodUnavailableDesc') || 'Tanlangan valyuta uchun hech qanday to\'lov indikatori yoqilmagan'}
                        </p>
                        <button className="back-btn" onClick={() => navigate(-1)}>
                            <ArrowLeft size={18} />
                            {t('back')}
                        </button>
                    </div>
                ) : (
                    <>
                <p className="currency-desc">
                    {t("fillRecipientInfo")}
                </p>

                <div className="currency-inner">
                    {/* Segmented selection */}
                    <div className="segmented segmented-area">
                        <button
                            type="button"
                            className={`seg-btn ${mode === 'card' ? 'active' : ''}`}
                            onClick={() => setMode('card')}
                        >
                            <CreditCard />
                            <span>{t('byCardNumber') || t('cardNumber')}</span>
                        </button>
                        <button
                            type="button"
                            className={`seg-btn ${mode === 'user' ? 'active' : ''}`}
                            onClick={() => setMode('user')}
                        >
                            <User />
                            <span>{t('byUserId') || 'Fastorika ID'}</span>
                        </button>
                    </div>
                    <div className="input-labels-cont">

                        {mode === 'card' && (
                            <div className="mb-1">
                                <div className="input-label-row">
                                    <span className="label-icon"><CreditCard /></span>
                                    <span className="label-text">{t("cardNumber")}</span>
                                </div>
                                <div className="currency-input-container" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <input
                                        type="text"
                                        value={cardNumber}
                                        onChange={handleCardNumberChange}
                                        placeholder={t('addCardModal.placeholders.cardNumber') || t('placeholders.cardNumber')}
                                        style={{ flex: 1 }}
                                        autoComplete="off"
                                    />
                                    {cardNetwork && (
                                        <img
                                            src={
                                                cardNetwork === 'VISA' ? '/images/visa.png' :
                                                cardNetwork === 'MASTERCARD' ? '/images/mastercard.png' :
                                                cardNetwork === 'UZCARD' ? '/images/Uzcard.svg' :
                                                cardNetwork === 'HUMO' ? '/images/humo.png' : ''
                                            }
                                            alt={cardNetwork}
                                            style={{ height: '24px', objectFit: 'contain' }}
                                        />
                                    )}
                                </div>
                            </div>
                        )}

                        {mode === 'card' && (
                            <div className="two-cols mb-1">
                                <div className="col">
                                    <label className="field-label">
                                        {t("expiryMonth") || "Месяц (MM)"}
                                    </label>
                                    <div className="currency-input-container">
                                        <input
                                            type="text"
                                            value={expiryMonth}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, '')
                                                if (val.length <= 2 && (val === '' || (parseInt(val) >= 0 && parseInt(val) <= 12))) {
                                                    setExpiryMonth(val)
                                                }
                                            }}
                                            placeholder="MM"
                                            maxLength={2}
                                        />
                                    </div>
                                </div>
                                <div className="col">
                                    <label className="field-label">
                                        {t("expiryYear") || "Год (YYYY)"}
                                    </label>
                                    <div className="currency-input-container">
                                        <input
                                            type="text"
                                            value={expiryYear}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, '')
                                                if (val.length <= 4) {
                                                    setExpiryYear(val)
                                                }
                                            }}
                                            placeholder="YYYY"
                                            maxLength={4}
                                        />
                                    </div>
                                </div>
                                {isInternationalCard && (
                                    <div className="col">
                                        <label className="field-label">
                                            <Lock size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                                            CVC/CVV
                                        </label>
                                        <div className="currency-input-container">
                                            <input
                                                type="password"
                                                value={cvv}
                                                onChange={(e) => {
                                                    const val = e.target.value.replace(/\D/g, '')
                                                    if (val.length <= 3) {
                                                        setCvv(val)
                                                    }
                                                }}
                                                placeholder="•••"
                                                maxLength={3}
                                                inputMode="numeric"
                                                autoComplete="cc-csc"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {mode === 'user' && (
                            <div className="mb-1">
                                <label className="field-label">
                                    {t("userId") || 'Fastorika ID'}
                                </label>
                                <div className="currency-input-container">
                                    <input
                                        type="text"
                                        value={userId}
                                        onChange={(e) => setUserId(e.target.value)}
                                        placeholder={t('placeholders.userId')}
                                    />
                                </div>
                                {isSearching && userId.trim().length > 0 && (
                                    <div className="user-search-status">
                                        <svg className="search-spinner" viewBox="0 0 24 24">
                                            <path d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z" opacity=".25"/>
                                            <path d="M12,4a8,8,0,0,1,7.89,6.7A1.53,1.53,0,0,0,21.38,12h0a1.5,1.5,0,0,0,1.48-1.75,11,11,0,0,0-21.72,0A1.5,1.5,0,0,0,2.62,12h0a1.53,1.53,0,0,0,1.49-1.3A8,8,0,0,1,12,4Z"/>
                                        </svg>
                                        <span>{t('searchingUser') || 'Searching user...'}</span>
                                    </div>
                                )}
                                {!isSearching && userId.trim().length > 0 && searchError && (
                                    <div className="user-not-found" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger, #ef4444)', marginTop: '0.5rem', fontSize: '0.875rem' }}>
                                        <XCircle size={18} style={{ flexShrink: 0 }} />
                                        <span>{t('invalidFastorikaId') || 'Noto\'g\'ri Fastorika ID formati'}</span>
                                    </div>
                                )}
                                {!isSearching && userId.trim().length > 0 && foundUser && (
                                    <div className="user-found-container" style={{ marginTop: '0.75rem' }}>
                                        <div className="user-found" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success, #22c55e)', marginBottom: '0.5rem' }}>
                                            <CheckCircle size={20} />
                                            <span style={{ fontWeight: 500 }}>{foundUser.fullName}</span>
                                            {foundUser.verificationStatus === 'VERIFIED' && (
                                                <span style={{ fontSize: '0.75rem', background: 'var(--success, #22c55e)', color: 'white', padding: '2px 6px', borderRadius: '4px' }}>
                                                    {t('verified') || 'Verified'}
                                                </span>
                                            )}
                                        </div>
                                        {/* Card selection dropdown if user has cards */}
                                        {foundUser.cards && foundUser.cards.length > 0 && (
                                            <div className="user-cards" style={{ marginTop: '0.75rem' }}>
                                                <label className="field-label" style={{ marginBottom: '0.5rem', display: 'block' }}>
                                                    {t('selectRecipientCard') || 'Выберите карту получателя'}
                                                </label>
                                                <div style={{ position: 'relative' }}>
                                                    <div
                                                        className="recipient-card-select"
                                                        onClick={() => setIsCardDropdownOpen(!isCardDropdownOpen)}
                                                    >
                                                        <div className="recipient-card-select-info">
                                                            <CreditCard size={18} />
                                                            <span>•••• {selectedCard?.cardNumber?.slice(-4) || '----'}</span>
                                                        </div>
                                                        <ChevronDown size={16} className={`chevron-icon ${isCardDropdownOpen ? 'open' : ''}`} />
                                                    </div>
                                                    {isCardDropdownOpen && (
                                                        <div className="recipient-card-dropdown">
                                                            {foundUser.cards.map((card) => (
                                                                <div
                                                                    key={card.cardId}
                                                                    className={`recipient-card-option ${selectedCard?.cardId === card.cardId ? 'active' : ''}`}
                                                                    onClick={() => {
                                                                        setSelectedCard(card)
                                                                        setIsCardDropdownOpen(false)
                                                                    }}
                                                                >
                                                                    <div className="recipient-card-option-number">
                                                                        •••• {card.cardNumber?.slice(-4)}
                                                                    </div>
                                                                    <div className="recipient-card-option-bank">
                                                                        {card.bankName}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {mode === 'card' && (
                            <div className="mb-1">
                                <div className="input-label-row">
                                    <span className="label-icon"><Phone /></span>
                                    <span className="label-text">{t("phoneNumber")}</span>
                                </div>
                                <div className="currency-input-container cur-phone-container">
                                    {/* Country Code Dropdown */}
                                    <div className="cur-phone-country-wrapper">
                                        <button
                                            type="button"
                                            onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                                            className="cur-phone-country-btn"
                                        >
                                            <img src={`https://flagcdn.com/w40/${selectedCountry.country.toLowerCase()}.png`} alt="" style={{width:20,height:14,objectFit:'cover',borderRadius:2}} />
                                            <span>{selectedCountry.code}</span>
                                            <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                                                <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        </button>
                                        {isCountryDropdownOpen && (
                                            <div className="cur-phone-dropdown">
                                                {countryCodes.map((country, idx) => (
                                                    <button
                                                        key={`${country.code}-${country.country}-${idx}`}
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedCountry(country)
                                                            setPhonePrefix(country.code)
                                                            setIsCountryDropdownOpen(false)
                                                        }}
                                                        className={`cur-phone-option ${selectedCountry.code === country.code && selectedCountry.country === country.country ? 'active' : ''}`}
                                                    >
                                                        <img src={`https://flagcdn.com/w40/${country.country.toLowerCase()}.png`} alt="" style={{width:20,height:14,objectFit:'cover',borderRadius:2}} />
                                                        <span className="cur-phone-option-name">{country.name}</span>
                                                        <span className="cur-phone-option-code">{country.code}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    {/* Phone Number Input */}
                                    <input
                                        type="text"
                                        value={phoneRest}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '')
                                            setPhoneRest(val.slice(0, 12))
                                        }}
                                        placeholder="00 000 00 00"
                                        className="cur-phone-input"
                                    />
                                </div>
                            </div>
                        )}

                        {mode === 'card' && (
                            <div className="two-cols mb-1">
                                <div className="col">
                                    <label className="field-label">
                                        {t("firstName")}
                                    </label>
                                    <div className="currency-input-container">
                                        <input
                                            type="text"
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="col">
                                    <label className="field-label">
                                        {t("lastName")}
                                    </label>
                                    <div className="currency-input-container">
                                        <input
                                            type="text"
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                        {(mode === 'card' || (mode === 'user' && userId.trim().length === 0)) && (
                            <div className="info-card">
                                <p className="info-text">
                                    <div className="info-icon">!</div>
                                    {mode === 'card' ? t("nameWarning") : t("nameWarningUserID")}
                                </p>
                            </div>
                        )}
                    </div>
                    <div className="terms-block">
                        <div className="terms-accept">
                            <input type="checkbox" id="terms" className="terms-checkbox" />
                            <label htmlFor="terms" className="terms-label">
                                {t("confirmTerms")} <span className="link-accent">{t("termsT")}</span> {t("and")} <span className="link-accent">{t("policy")}</span>{t("policy2")}
                            </label>
                        </div>
                    </div>

                    <button
                        className="currency-continueBtn"
                        onClick={() => {
                            let recipientPayload

                            if (mode === 'card') {
                                // Format expiry year to 4 digits
                                const formattedYear = expiryYear.length === 2 ? `20${expiryYear}` : expiryYear

                                // New card input
                                recipientPayload = {
                                    mode: 'card',
                                    cardNumber: cardNumber.replace(/\s/g, ''),
                                    cardNetwork: cardNetwork || 'VISA',
                                    expiryMonth: expiryMonth.padStart(2, '0'),
                                    expiryYear: formattedYear,
                                    cardHolderName: `${firstName} ${lastName}`.trim().toUpperCase(),
                                    phoneNumber: fullPhoneNumber,
                                    firstName,
                                    lastName,
                                    receiverName: `${firstName} ${lastName}`.trim(),
                                    ...(isInternationalCard && { cvv })
                                }
                            } else {
                                // Fastorika ID mode
                                const expYear = selectedCard?.expiryYear?.toString() || ''
                                const formattedExpYear = expYear.length === 2 ? `20${expYear}` : expYear

                                recipientPayload = {
                                    mode: 'user',
                                    fastorikaId: userId,
                                    userId: foundUser?.userId,
                                    foundUser: foundUser,
                                    receiverName: foundUser?.fullName,
                                    cardNumber: selectedCard?.cardNumber,
                                    cardNetwork: selectedCard?.cardNetwork,
                                    cardHolderName: selectedCard?.cardHolderName,
                                    expiryMonth: selectedCard?.expiryMonth?.toString().padStart(2, '0'),
                                    expiryYear: formattedExpYear,
                                    bankName: selectedCard?.bankName,
                                    receiverCountryId: selectedCard?.country?.id
                                }
                            }

                            // Save to global context
                            updateTransferData({
                                recipientCardNumber: cardNumber.replace(/\s/g, ''),
                                recipientName: mode === 'card' ? `${firstName} ${lastName}`.trim() : foundUser?.fullName,
                                recipientPhone: fullPhoneNumber,
                                recipient: recipientPayload,
                                receiverCountryId: recipientPayload.receiverCountryId || transferData?.receiverCountryId || 1,
                                step2Completed: true
                            })

                            // Navigate to provider page
                            navigate('/provider')
                        }}
                        disabled={
                            mode === 'card'
                                ? (!cardNumber || cardNumber.replace(/\s/g, '').length < 16 || !isPhoneValid || !expiryMonth || !expiryYear || expiryYear.length < 2 || !firstName || !lastName || (isInternationalCard && cvv.length !== 3))
                                : (!foundUser || (foundUser.cards?.length > 0 && !selectedCard))
                        }
                    >
                        {t('continue')}
                    </button>
                </div>
                    </>
                )}
            </div>
            {!isCryptoTransfer && mode === 'user' && (
                <div className="currency-share">
                    <div className="currency-share-top">
                        Fastorika
                        <div className="currency-share-img">
                            id
                        </div>
                    </div>
                    <p>
                        {t('fastorikaIdShare.description')}
                    </p>
                    <button onClick={()=>setUserverify(true)}>
                        <Share2 size={"1rem"}/>
                        {t('fastorikaIdShare.shareButton')}
                    </button>
                </div>
            )}
            {
                !isCryptoTransfer && userverify && <UnRegCopyModal setUserverify={setUserverify}/>
            }
        </div>
    )
}

export default UnRegCardNum
