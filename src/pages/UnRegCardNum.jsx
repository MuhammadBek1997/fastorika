import { useState, useEffect } from "react"
import './currency.css'
import { useNavigate } from "react-router-dom"
import { useGlobalContext } from "../Context"
import { ChevronLeft, CreditCard, User, AlertCircle, Phone, ArrowBigLeft, ArrowLeft, AlertCircleIcon, Share2 } from "lucide-react"
import UnRegCopyModal from "./UnRegCopyModal"

const UnRegCardNum = () => {
    let { t, theme, user, profilePhone, mockUsers } = useGlobalContext()
    const navigate = useNavigate()

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

    // Search user by ID with debounce
    useEffect(() => {
        if (mode === 'user' && userId.trim().length > 0) {
            setIsSearching(true)
            const timer = setTimeout(() => {
                const user = mockUsers.find(u => u.id === userId.trim())
                setFoundUser(user || null)
                setIsSearching(false)
            }, 800) // Simulate search delay
            return () => clearTimeout(timer)
        } else {
            setFoundUser(null)
            setIsSearching(false)
        }
    }, [userId, mode, mockUsers])

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
                                <div className="currency-input-container">
                                    <input
                                        type="text"
                                        value={cardNumber}
                                        onChange={handleCardNumberChange}
                                        placeholder={t('addCardModal.placeholders.cardNumber') || t('placeholders.cardNumber')}
                                    />
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
                                        <span>Ищем пользователя...</span>
                                    </div>
                                )}
                                {!isSearching && userId.trim().length > 0 && foundUser && (
                                    <div className="user-found">
                                        <User size={20} />
                                        <span>{foundUser.fullName}</span>
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
                            const payload = mode === 'card'
                                ? { cardNumber, phoneNumber: fullPhoneNumber, firstName, lastName }
                                : { userId }
                            navigate('/provider', { state: { recipient: payload } })
                        }}
                        disabled={mode === 'card' ? (!cardNumber || !isPhoneValid) : (!userId)}
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
