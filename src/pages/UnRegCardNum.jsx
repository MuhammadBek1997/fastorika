import { useState, useEffect } from "react"
import './currency.css'
import { useNavigate, useLocation } from "react-router-dom"
import { useGlobalContext } from "../Context"
import { ChevronLeft, CreditCard, User, AlertCircle, Phone, ArrowBigLeft, ArrowLeft, AlertCircleIcon, Share2, CheckCircle, XCircle } from "lucide-react"
import UnRegCopyModal from "./UnRegCopyModal"
import { findClientByFastorikaId } from "../api"

const UnRegCardNum = () => {
    let { t, theme, user, profilePhone } = useGlobalContext()
    const navigate = useNavigate()
    const location = useLocation()

    // Get transfer data from previous page
    const transferData = location.state || {}

    const [mode, setMode] = useState('card')
    const [cardNumber, setCardNumber] = useState("")
    const [phonePrefix, setPhonePrefix] = useState('+998')
    const [phoneRest, setPhoneRest] = useState('')
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
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

    // Detect card network from card number
    const detectCardNetwork = (cardNum) => {
        const num = cardNum.replace(/\s/g, '')
        if (num.startsWith('4')) return 'VISA'
        if (num.startsWith('5') || num.startsWith('2')) return 'MASTERCARD'
        if (num.startsWith('8600')) return 'UZCARD'
        if (num.startsWith('9860')) return 'HUMO'
        if (num.startsWith('34') || num.startsWith('37')) return 'AMEX'
        return null
    }

    const cardNetwork = detectCardNetwork(cardNumber)

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
                    {t("recipientDetails")}
                </h2>
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
                                    />
                                    {cardNetwork && (
                                        <span style={{
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            background: cardNetwork === 'VISA' ? '#1a1f71' :
                                                        cardNetwork === 'MASTERCARD' ? '#eb001b' :
                                                        cardNetwork === 'UZCARD' ? '#00a651' :
                                                        cardNetwork === 'HUMO' ? '#00bfff' : '#666',
                                            color: 'white'
                                        }}>
                                            {cardNetwork}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}

                        {mode === 'card' && (
                            <div className="two-cols mb-1">
                                <div className="col">
                                    <label className="field-label">
                                        {t("expiryMonth") || "Oy"}
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
                                        {t("expiryYear") || "Yil"}
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
                                    <div className="user-not-found" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger, #ef4444)', marginTop: '0.5rem' }}>
                                        <XCircle size={20} />
                                        <span>{searchError}</span>
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
                                                    {t('selectRecipientCard') || 'Select recipient card'}
                                                </label>
                                                <div style={{ position: 'relative' }}>
                                                    <div
                                                        onClick={() => setIsCardDropdownOpen(!isCardDropdownOpen)}
                                                        style={{
                                                            padding: '0.75rem',
                                                            border: '2px solid #00D26A',
                                                            borderRadius: '8px',
                                                            cursor: 'pointer',
                                                            background: 'rgba(0, 210, 106, 0.1)',
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center'
                                                        }}
                                                    >
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                            <CreditCard size={18} />
                                                            <span>•••• {selectedCard?.cardNumber?.slice(-4) || '----'}</span>
                                                        </div>
                                                        <div/>
                                                    </div>
                                                    {isCardDropdownOpen && (
                                                        <div style={{
                                                            position: 'absolute',
                                                            top: '100%',
                                                            left: 0,
                                                            right: 0,
                                                            background: 'var(--bg-light, #fff)',
                                                            border: '1px solid var(--border-light, #e5e7eb)',
                                                            borderRadius: '8px',
                                                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                                            zIndex: 100,
                                                            marginTop: '4px',
                                                            maxHeight: '200px',
                                                            overflowY: 'auto'
                                                        }}>
                                                            {foundUser.cards.map((card) => (
                                                                <div
                                                                    key={card.cardId}
                                                                    onClick={() => {
                                                                        setSelectedCard(card)
                                                                        setIsCardDropdownOpen(false)
                                                                    }}
                                                                    style={{
                                                                        padding: '0.75rem',
                                                                        cursor: 'pointer',
                                                                        borderBottom: '1px solid var(--border-light, #e5e7eb)',
                                                                        background: selectedCard?.cardId === card.cardId ? 'rgba(0, 210, 106, 0.1)' : 'transparent'
                                                                    }}
                                                                >
                                                                    <div style={{ fontWeight: 500 }}>
                                                                        •••• {card.cardNumber?.slice(-4)}
                                                                    </div>
                                                                    <div style={{ fontSize: '0.85rem', opacity: 0.7 }}>
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
                                <div className="currency-input-container">
                                    <input
                                        type="text"
                                        value={fullPhoneNumber}
                                        onChange={handlePhoneNumberChange}
                                        placeholder={phonePrefix}
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
                                    receiverName: `${firstName} ${lastName}`.trim()
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

                            // Pass all transfer data + recipient info to next page
                            navigate('/provider', {
                                state: {
                                    ...transferData,
                                    recipient: recipientPayload,
                                    receiverCountryId: recipientPayload.receiverCountryId || transferData.receiverCountryId || 1
                                }
                            })
                        }}
                        disabled={
                            mode === 'card'
                                ? (!cardNumber || cardNumber.replace(/\s/g, '').length < 16 || !isPhoneValid || !expiryMonth || !expiryYear || expiryYear.length < 2 || !firstName || !lastName)
                                : (!foundUser || (foundUser.cards?.length > 0 && !selectedCard))
                        }
                    >
                        {t('continue')}
                    </button>
                </div>
            </div>
            {mode === 'user' && (
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
                userverify && <UnRegCopyModal setUserverify={setUserverify}/>
            }
        </div>
    )
}

export default UnRegCardNum
